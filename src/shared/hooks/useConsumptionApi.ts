import { useState, useEffect, useCallback, useRef } from "react";
import type { ConsumptionLog } from "../../types/Product";
import { dashboardApi } from "../../api/dashboardApi";

/**
 * useConsumptionApi Hook - Backend API Version
 * Uses Express backend instead of direct Supabase access
 *
 * Migration from useConsumption (Supabase) to useConsumptionApi (Backend)
 * Note: Currently uses polling instead of real-time subscriptions
 */
export const useConsumptionApi = (householdId: string) => {
  const [consumptionLogs, setConsumptionLogs] = useState<ConsumptionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if this is the initial load
  const isInitialLoadRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingTimeoutRef = useRef<number | null>(null);

  // Fetch consumption logs from backend
  const fetchConsumptionLogs = useCallback(
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

        const data = await dashboardApi.getConsumptionLogs({ householdId });
        setConsumptionLogs(data);
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
          err instanceof Error
            ? err.message
            : "Failed to fetch consumption logs",
        );
        console.error("Error fetching consumption logs:", err);
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
    fetchConsumptionLogs(true);

    // Setup polling - fetch without showing loading
    const startPolling = () => {
      pollingTimeoutRef.current = setTimeout(() => {
        fetchConsumptionLogs(false).then(() => {
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
  }, [fetchConsumptionLogs]);

  const logConsumption = async (log: ConsumptionLog) => {
    const tempId = crypto.randomUUID();
    const tempLog = { ...log, id: tempId };

    try {
      // Optimistic update
      setConsumptionLogs((prev) => [tempLog, ...prev]);
      setError(null);

      // Call backend (exclude id if present, backend will generate)
      const { id: _id, ...logWithoutId } = log as ConsumptionLog & {
        id?: string;
      };
      const newLog = await dashboardApi.createConsumptionLog({
        ...logWithoutId,
        householdId,
      } as Omit<ConsumptionLog, "id">);

      // Replace temp log with real one from server
      setConsumptionLogs((prev) =>
        prev.map((l) => (l.id === tempId ? newLog : l)),
      );
    } catch (err) {
      // Rollback on error
      setConsumptionLogs((prev) => prev.filter((l) => l.id !== tempId));
      const errorMsg =
        err instanceof Error ? err.message : "Failed to log consumption";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteOldLogs = async (daysToKeep: number = 90) => {
    const cutoffDate = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    const oldLogs = consumptionLogs.filter((log) => log.timestamp < cutoffDate);

    try {
      // Optimistic update
      setConsumptionLogs((prev) =>
        prev.filter((log) => log.timestamp >= cutoffDate),
      );
      setError(null);

      // Call backend
      await dashboardApi.deleteOldConsumptionLogs(householdId, daysToKeep);
    } catch (err) {
      // Rollback on error
      setConsumptionLogs((prev) =>
        [...oldLogs, ...prev].sort((a, b) => b.timestamp - a.timestamp),
      );
      const errorMsg =
        err instanceof Error ? err.message : "Failed to delete old logs";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteAllLogs = async () => {
    const allLogs = [...consumptionLogs];

    try {
      // Optimistic update
      setConsumptionLogs([]);
      setError(null);

      // Call backend
      await dashboardApi.deleteAllConsumptionLogs(householdId);
    } catch (err) {
      // Rollback on error
      setConsumptionLogs(allLogs);
      const errorMsg =
        err instanceof Error ? err.message : "Failed to delete all logs";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Manual refetch function
  const refetch = useCallback(() => {
    fetchConsumptionLogs(true);
  }, [fetchConsumptionLogs]);

  return {
    consumptionLogs,
    loading,
    error,
    logConsumption,
    deleteOldLogs,
    deleteAllLogs,
    refetch,
  };
};
