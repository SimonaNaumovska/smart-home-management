import { useState, useEffect } from "react";
import type { ConsumptionLog } from "../types/Product";
import {
  syncConsumptionLogs,
  addConsumptionLog as addConsumptionLogDB,
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

  return {
    consumptionLogs,
    logConsumption,
  };
};
