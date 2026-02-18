import { useMemo } from "react";
import type { ConsumptionLog, User, Product } from "../../types/Product";

interface UseAnalyticsDashboardProps {
  consumptionLogs: ConsumptionLog[];
  users: User[];
  products: Product[];
}

export const useAnalyticsDashboard = ({
  consumptionLogs,
  users,
  products,
}: UseAnalyticsDashboardProps) => {
  // Calculate stats
  const last7Days = useMemo(() => Date.now() - 7 * 24 * 60 * 60 * 1000, []);

  const recentLogs = useMemo(
    () => consumptionLogs.filter((log) => log.timestamp >= last7Days),
    [consumptionLogs, last7Days],
  );

  const foodConsumption = useMemo(
    () => recentLogs.filter((log) => log.type === "food"),
    [recentLogs],
  );

  const choreCompletion = useMemo(
    () => recentLogs.filter((log) => log.type === "chore"),
    [recentLogs],
  );

  // User statistics
  const userStats = useMemo(
    () =>
      users.map((user) => {
        const userFoodLogs = foodConsumption.filter(
          (log) => log.userId === user.id,
        );
        const userChoreLogs = choreCompletion.filter(
          (log) => log.userId === user.id,
        );

        return {
          user,
          foodConsumed: userFoodLogs.length,
          choresCompleted: userChoreLogs.length,
        };
      }),
    [users, foodConsumption, choreCompletion],
  );

  // Low stock warnings
  const lowStockProducts = useMemo(
    () => products.filter((p) => p.quantity <= p.minStock && p.quantity > 0),
    [products],
  );

  const outOfStockProducts = useMemo(
    () => products.filter((p) => p.quantity === 0),
    [products],
  );

  // Expiring soon
  const expiringSoon = useMemo(() => {
    const today = new Date();
    const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return products.filter((p) => {
      if (!p.useBy) return false;
      const expiryDate = new Date(p.useBy);
      return expiryDate >= today && expiryDate <= in7Days;
    });
  }, [products]);

  const hasAlerts =
    lowStockProducts.length > 0 ||
    outOfStockProducts.length > 0 ||
    expiringSoon.length > 0;

  const sortedConsumptionLogs = useMemo(
    () =>
      [...consumptionLogs]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20),
    [consumptionLogs],
  );

  return {
    userStats,
    lowStockProducts,
    outOfStockProducts,
    expiringSoon,
    hasAlerts,
    sortedConsumptionLogs,
  };
};
