import { useState, useEffect } from "react";
import type { ConsumptionLog } from "../types/Product";
import {
  syncConsumptionLogs,
  addConsumptionLog as addConsumptionLogDB,
  deleteOldConsumptionLogs as deleteOldLogsDB,
  deleteAllConsumptionLogs as deleteAllLogsDB,
} from "../supabase/database";

export const useConsumption = (householdId: string) => {
  const [consumptionLogs, setConsumptionLogs] = useState<ConsumptionLog[]>([]);

  useEffect(() => {
    if (!householdId) return;

    const unsubscribe = syncConsumptionLogs(householdId, (syncedLogs) => {
      setConsumptionLogs(syncedLogs);
    });

    return () => {
      unsubscribe();
    };
  }, [householdId]);

  const logConsumption = async (log: ConsumptionLog) => {
    setConsumptionLogs((prev) => [...prev, log]);
    await addConsumptionLogDB(householdId, log);
  };

  const deleteOldLogs = async (daysToKeep: number = 90) => {
    const cutoffDate = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    setConsumptionLogs((prev) =>
      prev.filter((log) => log.timestamp >= cutoffDate),
    );
    await deleteOldLogsDB(householdId, daysToKeep);
  };

  const deleteAllLogs = async () => {
    setConsumptionLogs([]);
    await deleteAllLogsDB(householdId);
  };

  return {
    consumptionLogs,
    logConsumption,
    deleteOldLogs,
    deleteAllLogs,
  };
};
