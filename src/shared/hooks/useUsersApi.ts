import { useState, useEffect, useCallback, useRef } from "react";
import type { User } from "../../types/Product";
import { dashboardApi } from "../../api/dashboardApi";

/**
 * useUsersApi Hook - Backend API Version
 * Uses Express backend instead of direct Supabase access
 *
 * Migration from useUsers (Supabase) to useUsersApi (Backend)
 * Note: Currently uses polling instead of real-time subscriptions
 */
export const useUsersApi = (householdId: string) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if this is the initial load
  const isInitialLoadRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingTimeoutRef = useRef<number | null>(null);

  // Fetch users from backend
  const fetchUsers = useCallback(
    async (showLoading = true) => {
      if (!householdId) return;

      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        // Only show loading on initial load, not on polls
        if (showLoading && isInitialLoadRef.current) {
          setLoading(true);
        }

        const data = await dashboardApi.getUsers({ householdId });
        setUsers(data);
        setError(null);

        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(err instanceof Error ? err.message : "Failed to fetch users");
        console.error("Error fetching users:", err);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [householdId],
  );

  // Setup polling with proper cleanup
  useEffect(() => {
    // Initial fetch
    fetchUsers(true);

    // Setup polling - fetch without showing loading
    const startPolling = () => {
      pollingTimeoutRef.current = setTimeout(() => {
        fetchUsers(false).then(() => {
          // Schedule next poll after this one completes
          startPolling();
        });
      }, 5000);
    };

    startPolling();

    // Cleanup
    return () => {
      // Clear polling timeout
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }

      // Cancel in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Reset initial load flag
      isInitialLoadRef.current = true;
    };
  }, [fetchUsers]);

  const addUser = async (user: User) => {
    const tempId = crypto.randomUUID();
    const tempUser = { ...user, id: tempId };

    try {
      // Optimistic update
      setUsers((prev) => [...prev, tempUser]);
      setError(null);

      // Call backend (exclude id if present, backend will generate)
      const { id: _id, ...userWithoutId } = user as User & { id?: string };
      const newUser = await dashboardApi.createUser({
        ...userWithoutId,
        householdId,
      } as Omit<User, "id">);

      // Replace temp user with real one from server
      setUsers((prev) => prev.map((u) => (u.id === tempId ? newUser : u)));
    } catch (err) {
      // Rollback on error
      setUsers((prev) => prev.filter((u) => u.id !== tempId));
      const errorMsg =
        err instanceof Error ? err.message : "Failed to add user";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateUser = async (user: User) => {
    const oldUser = users.find((u) => u.id === user.id);

    try {
      // Optimistic update
      setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
      setError(null);

      // Call backend - clean payload (no id)
      const { id: _id, ...userWithoutId } = user;
      const updatedUser = await dashboardApi.updateUser(user.id, {
        ...userWithoutId,
        householdId,
      });

      // Sync with server response
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
    } catch (err) {
      // Rollback on error
      if (oldUser) {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? oldUser : u)));
      }
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update user";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteUser = async (userId: string) => {
    const originalIndex = users.findIndex((u) => u.id === userId);
    const userToDelete = users[originalIndex];

    try {
      // Optimistic update
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setError(null);

      // Call backend
      await dashboardApi.deleteUser(userId, householdId);
    } catch (err) {
      // Rollback on error - restore at original position
      if (userToDelete && originalIndex !== -1) {
        setUsers((prev) => {
          const newUsers = [...prev];
          newUsers.splice(originalIndex, 0, userToDelete);
          return newUsers;
        });
      }
      const errorMsg =
        err instanceof Error ? err.message : "Failed to delete user";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Manual refetch function
  const refetch = useCallback(() => {
    fetchUsers(true);
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    addUser,
    updateUser,
    deleteUser,
    refetch,
  };
};
