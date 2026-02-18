import { useState, useEffect, useCallback, useRef } from "react";
import type { ChoreDefinition, Room, ChoreCategory } from "../../types/Product";
import { choresApi } from "../../api/choresApi";

/**
 * useChoresApi Hook - Backend API Version
 * Uses Express backend instead of direct Supabase access
 *
 * Migration from useChores (Supabase) to useChoresApi (Backend)
 * Note: Currently uses polling instead of real-time subscriptions
 */
export const useChoresApi = (householdId: string) => {
  const [chores, setChores] = useState<ChoreDefinition[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [choreCategories, setChoreCategories] = useState<ChoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if this is the initial load
  const isInitialLoadRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingTimeoutRef = useRef<number | null>(null);

  // Fetch all data from backend
  const fetchAllData = useCallback(
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

        // Fetch all data in parallel
        const [choresData, roomsData, categoriesData] = await Promise.all([
          choresApi.getChores({ householdId }),
          choresApi.getRooms({ householdId }),
          choresApi.getChoreCategories({ householdId }),
        ]);

        setChores(choresData);
        setRooms(roomsData);
        setChoreCategories(categoriesData);
        setError(null);

        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Failed to fetch chores data",
        );
        console.error("Error fetching chores data:", err);
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
    fetchAllData(true);

    // Setup polling - fetch without showing loading
    const startPolling = () => {
      pollingTimeoutRef.current = setTimeout(() => {
        fetchAllData(false).then(() => {
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
  }, [fetchAllData]);

  // ========== CHORES OPERATIONS ==========

  const addChore = async (chore: ChoreDefinition) => {
    const tempId = crypto.randomUUID();
    const tempChore = { ...chore, id: tempId };

    try {
      // Optimistic update
      setChores((prev) => [...prev, tempChore]);
      setError(null);

      // Call backend (exclude id if present, backend will generate)
      const { id: _id, ...choreWithoutId } = chore as ChoreDefinition & {
        id?: string;
      };
      const newChore = await choresApi.createChore({
        ...choreWithoutId,
        householdId,
      } as Omit<ChoreDefinition, "id">);

      // Replace temp chore with real one from server
      setChores((prev) => prev.map((c) => (c.id === tempId ? newChore : c)));
    } catch (err) {
      // Rollback on error
      setChores((prev) => prev.filter((c) => c.id !== tempId));
      const errorMsg =
        err instanceof Error ? err.message : "Failed to add chore";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateChore = async (chore: ChoreDefinition) => {
    const oldChore = chores.find((c) => c.id === chore.id);

    try {
      // Optimistic update
      setChores((prev) => prev.map((c) => (c.id === chore.id ? chore : c)));
      setError(null);

      // Call backend - clean payload (no id)
      const { id: _id, ...choreWithoutId } = chore;
      const updatedChore = await choresApi.updateChore(chore.id, {
        ...choreWithoutId,
        householdId,
      });

      // Sync with server response
      setChores((prev) =>
        prev.map((c) => (c.id === chore.id ? updatedChore : c)),
      );
    } catch (err) {
      // Rollback on error
      if (oldChore) {
        setChores((prev) =>
          prev.map((c) => (c.id === chore.id ? oldChore : c)),
        );
      }
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update chore";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteChore = async (choreId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    const originalIndex = chores.findIndex((c) => c.id === choreId);
    const choreToDelete = chores[originalIndex];

    try {
      // Optimistic update
      setChores((prev) => prev.filter((c) => c.id !== choreId));
      setError(null);

      // Call backend
      await choresApi.deleteChore(choreId, householdId);
    } catch (err) {
      // Rollback on error - restore at original position
      if (choreToDelete && originalIndex !== -1) {
        setChores((prev) => {
          const newChores = [...prev];
          newChores.splice(originalIndex, 0, choreToDelete);
          return newChores;
        });
      }
      const errorMsg =
        err instanceof Error ? err.message : "Failed to delete chore";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // ========== ROOMS OPERATIONS ==========

  const addRoom = async (room: Omit<Room, "id">) => {
    const tempId = crypto.randomUUID();
    const tempRoom = { ...room, id: tempId };

    try {
      // Optimistic update
      setRooms((prev) => [...prev, tempRoom]);
      setError(null);

      // Call backend
      const newRoom = await choresApi.createRoom({
        ...room,
        householdId,
      } as Omit<Room, "id">);

      // Replace temp room with real one from server
      setRooms((prev) => prev.map((r) => (r.id === tempId ? newRoom : r)));
    } catch (err) {
      // Rollback on error
      setRooms((prev) => prev.filter((r) => r.id !== tempId));
      const errorMsg =
        err instanceof Error ? err.message : "Failed to add room";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) {
      return;
    }

    const originalIndex = rooms.findIndex((r) => r.id === roomId);
    const roomToDelete = rooms[originalIndex];

    try {
      // Optimistic update
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      setError(null);

      // Call backend
      await choresApi.deleteRoom(roomId, householdId);
    } catch (err) {
      // Rollback on error - restore at original position
      if (roomToDelete && originalIndex !== -1) {
        setRooms((prev) => {
          const newRooms = [...prev];
          newRooms.splice(originalIndex, 0, roomToDelete);
          return newRooms;
        });
      }
      const errorMsg =
        err instanceof Error ? err.message : "Failed to delete room";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // ========== CHORE CATEGORIES OPERATIONS ==========

  const addCategory = async (category: Omit<ChoreCategory, "id">) => {
    const tempId = crypto.randomUUID();
    const tempCategory = { ...category, id: tempId };

    try {
      // Optimistic update
      setChoreCategories((prev) => [...prev, tempCategory]);
      setError(null);

      // Call backend
      const newCategory = await choresApi.createChoreCategory({
        ...category,
        householdId,
      } as Omit<ChoreCategory, "id">);

      // Replace temp category with real one from server
      setChoreCategories((prev) =>
        prev.map((c) => (c.id === tempId ? newCategory : c)),
      );
    } catch (err) {
      // Rollback on error
      setChoreCategories((prev) => prev.filter((c) => c.id !== tempId));
      const errorMsg =
        err instanceof Error ? err.message : "Failed to add category";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this frequency?")) {
      return;
    }

    const originalIndex = choreCategories.findIndex((c) => c.id === categoryId);
    const categoryToDelete = choreCategories[originalIndex];

    try {
      // Optimistic update
      setChoreCategories((prev) => prev.filter((c) => c.id !== categoryId));
      setError(null);

      // Call backend
      await choresApi.deleteChoreCategory(categoryId, householdId);
    } catch (err) {
      // Rollback on error - restore at original position
      if (categoryToDelete && originalIndex !== -1) {
        setChoreCategories((prev) => {
          const newCategories = [...prev];
          newCategories.splice(originalIndex, 0, categoryToDelete);
          return newCategories;
        });
      }
      const errorMsg =
        err instanceof Error ? err.message : "Failed to delete category";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Manual refetch function
  const refetch = useCallback(() => {
    fetchAllData(true);
  }, [fetchAllData]);

  return {
    // State
    chores,
    rooms,
    choreCategories,
    loading,
    error,

    // Chores operations
    addChore,
    updateChore,
    deleteChore,

    // Rooms operations
    addRoom,
    deleteRoom,

    // Categories operations
    addCategory,
    deleteCategory,

    // Utils
    refetch,
  };
};
