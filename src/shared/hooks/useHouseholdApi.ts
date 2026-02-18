import { useState, useEffect, useCallback, useRef } from "react";
import {
  householdApi,
  type Household,
  type HouseholdMember,
  type HouseholdWithMembers,
  type CreateHouseholdDTO,
  type JoinHouseholdDTO,
  type UpdateHouseholdDTO,
  type UpdateMemberDTO,
} from "../../api/householdApi";

/**
 * useHouseholdApi Hook - Backend API Version
 * Uses Express backend instead of direct Supabase access
 *
 * Migration from useHousehold (Supabase) to useHouseholdApi (Backend)
 * Note: Currently uses polling instead of real-time subscriptions
 */
export const useHouseholdApi = (userId: string | undefined) => {
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if this is the initial load
  const isInitialLoadRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingTimeoutRef = useRef<number | null>(null);

  // Fetch household from backend
  const fetchHousehold = useCallback(
    async (showLoading = true) => {
      if (!userId) return;

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

        const data = await householdApi.getUserHousehold(userId);

        if (data) {
          setHousehold(data.household);
          setMembers(data.members);
        } else {
          setHousehold(null);
          setMembers([]);
        }

        setError(null); // Clear any previous errors

        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Failed to fetch household",
        );
        console.error("Error fetching household:", err);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [userId],
  );

  // Setup polling with proper cleanup
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchHousehold(true);

    // Setup polling - fetch without showing loading
    const startPolling = () => {
      pollingTimeoutRef.current = window.setTimeout(() => {
        fetchHousehold(false).then(() => {
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
  }, [fetchHousehold, userId]);

  const createHousehold = async (
    householdData: CreateHouseholdDTO,
  ): Promise<HouseholdWithMembers | null> => {
    try {
      setError(null);

      // Call backend
      const result = await householdApi.createHousehold(householdData);

      // Optimistic update
      setHousehold(result.household);
      setMembers(result.members);

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create household";
      setError(errorMessage);
      console.error("Error creating household:", err);
      return null;
    }
  };

  const updateHousehold = async (
    id: string,
    updates: UpdateHouseholdDTO,
  ): Promise<boolean> => {
    if (!household) return false;

    // Store previous state for rollback
    const previousHousehold = household;

    try {
      // Optimistic update
      setHousehold((prev) => (prev ? { ...prev, ...updates } : null));
      setError(null);

      // Call backend
      const updated = await householdApi.updateHousehold(id, updates);
      setHousehold(updated);

      return true;
    } catch (err) {
      // Rollback on error
      setHousehold(previousHousehold);

      const errorMessage =
        err instanceof Error ? err.message : "Failed to update household";
      setError(errorMessage);
      console.error("Error updating household:", err);

      return false;
    }
  };

  const deleteHousehold = async (id: string): Promise<boolean> => {
    // Store previous state for rollback
    const previousHousehold = household;
    const previousMembers = members;

    try {
      // Optimistic update
      setHousehold(null);
      setMembers([]);
      setError(null);

      // Call backend
      await householdApi.deleteHousehold(id);

      return true;
    } catch (err) {
      // Rollback on error
      setHousehold(previousHousehold);
      setMembers(previousMembers);

      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete household";
      setError(errorMessage);
      console.error("Error deleting household:", err);

      return false;
    }
  };

  const joinHousehold = async (
    joinData: JoinHouseholdDTO,
  ): Promise<HouseholdMember | null> => {
    try {
      setError(null);

      // Call backend
      const newMember = await householdApi.joinHousehold(joinData);

      // Optimistic update - add new member
      setMembers((prev) => [...prev, newMember]);

      // Fetch full household details now that user has joined
      await fetchHousehold(false);

      return newMember;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to join household";
      setError(errorMessage);
      console.error("Error joining household:", err);
      return null;
    }
  };

  const leaveHousehold = async (
    userId: string,
    householdId: string,
  ): Promise<boolean> => {
    // Store previous state for rollback
    const previousHousehold = household;
    const previousMembers = members;

    try {
      // Optimistic update - clear household
      setHousehold(null);
      setMembers([]);
      setError(null);

      // Call backend
      await householdApi.leaveHousehold(userId, householdId);

      return true;
    } catch (err) {
      // Rollback on error
      setHousehold(previousHousehold);
      setMembers(previousMembers);

      const errorMessage =
        err instanceof Error ? err.message : "Failed to leave household";
      setError(errorMessage);
      console.error("Error leaving household:", err);

      return false;
    }
  };

  const updateMember = async (
    memberId: string,
    updates: UpdateMemberDTO,
  ): Promise<boolean> => {
    // Store previous state for rollback
    const previousMembers = members;

    try {
      // Optimistic update
      setMembers((prev) =>
        prev.map((member) =>
          member.id === memberId ? { ...member, ...updates } : member,
        ),
      );
      setError(null);

      // Call backend
      const updated = await householdApi.updateMember(memberId, updates);

      // Update with actual data from server
      setMembers((prev) =>
        prev.map((member) => (member.id === memberId ? updated : member)),
      );

      return true;
    } catch (err) {
      // Rollback on error
      setMembers(previousMembers);

      const errorMessage =
        err instanceof Error ? err.message : "Failed to update member";
      setError(errorMessage);
      console.error("Error updating member:", err);

      return false;
    }
  };

  const removeMember = async (memberId: string): Promise<boolean> => {
    // Store previous state for rollback
    const previousMembers = members;

    try {
      // Optimistic update - remove member
      setMembers((prev) => prev.filter((member) => member.id !== memberId));
      setError(null);

      // Call backend
      await householdApi.removeMember(memberId);

      return true;
    } catch (err) {
      // Rollback on error
      setMembers(previousMembers);

      const errorMessage =
        err instanceof Error ? err.message : "Failed to remove member";
      setError(errorMessage);
      console.error("Error removing member:", err);

      return false;
    }
  };

  return {
    household,
    members,
    loading,
    error,
    // Household operations
    createHousehold,
    updateHousehold,
    deleteHousehold,
    // Member operations
    joinHousehold,
    leaveHousehold,
    updateMember,
    removeMember,
    // Manual refresh
    refetch: () => fetchHousehold(true),
  };
};
