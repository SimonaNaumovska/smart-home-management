import type { ConsumptionLog, User, Product } from "../types/Product";

interface AnalyticsDashboardProps {
  consumptionLogs: ConsumptionLog[];
  users: User[];
  products: Product[];
}

export function AnalyticsDashboard({
  consumptionLogs,
  users,
  products,
}: AnalyticsDashboardProps) {
  // Calculate stats
  const last7Days = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentLogs = consumptionLogs.filter(
    (log) => log.timestamp >= last7Days,
  );

  const foodConsumption = recentLogs.filter((log) => log.type === "food");
  const choreCompletion = recentLogs.filter((log) => log.type === "chore");

  // User statistics
  const userStats = users.map((user) => {
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
  });

  // Low stock warnings
  const lowStockProducts = products.filter(
    (p) => p.quantity <= p.minStock && p.quantity > 0,
  );
  const outOfStockProducts = products.filter((p) => p.quantity === 0);

  // Expiring soon
  const today = new Date();
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const expiringSoon = products.filter((p) => {
    if (!p.useBy) return false;
    const expiryDate = new Date(p.useBy);
    return expiryDate >= today && expiryDate <= in7Days;
  });

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #00BCD4",
        borderRadius: "8px",
        marginBottom: "20px",
        backgroundColor: "#e0f7fa",
      }}
    >
      <h2 style={{ color: "#00838F" }}>📊 Household Analytics</h2>
      <p style={{ color: "#555", fontSize: "14px", marginBottom: "20px" }}>
        Last 7 days insights
      </p>

      {/* Alerts */}
      {(lowStockProducts.length > 0 ||
        outOfStockProducts.length > 0 ||
        expiringSoon.length > 0) && (
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ color: "#F44336" }}>⚠️ Alerts</h3>

          {outOfStockProducts.length > 0 && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#ffebee",
                border: "1px solid #f44336",
                borderRadius: "4px",
                marginBottom: "8px",
              }}
            >
              <strong>Out of Stock:</strong>{" "}
              {outOfStockProducts.map((p) => p.name).join(", ")}
            </div>
          )}

          {lowStockProducts.length > 0 && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fff3e0",
                border: "1px solid #FF9800",
                borderRadius: "4px",
                marginBottom: "8px",
              }}
            >
              <strong>Low Stock:</strong>{" "}
              {lowStockProducts.map((p) => p.name).join(", ")}
            </div>
          )}

          {expiringSoon.length > 0 && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fff9c4",
                border: "1px solid #FBC02D",
                borderRadius: "4px",
              }}
            >
              <strong>Expiring Soon:</strong>{" "}
              {expiringSoon.map((p) => p.name).join(", ")}
            </div>
          )}
        </div>
      )}

      {/* User Performance */}
      <div style={{ marginBottom: "20px" }}>
        <h3>👥 User Activity</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {userStats.map(({ user, foodConsumed, choresCompleted }) => (
            <div
              key={user.id}
              style={{
                flex: "1 1 calc(33.333% - 8px)",
                minWidth: "200px",
                padding: "16px",
                border: `2px solid ${user.color}`,
                borderRadius: "8px",
                backgroundColor: user.color + "20",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <span style={{ fontSize: "32px" }}>{user.avatar}</span>
                <span style={{ fontWeight: "bold", fontSize: "18px" }}>
                  {user.name}
                </span>
              </div>
              <div style={{ fontSize: "14px" }}>
                <div>🍽️ Food Items: {foodConsumed}</div>
                <div>🧹 Chores Done: {choresCompleted}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3>📝 Recent Activity</h3>
        {consumptionLogs.length === 0 ? (
          <p style={{ color: "#666" }}>No activity logged yet</p>
        ) : (
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {consumptionLogs
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 20)
              .map((log) => {
                const user = users.find((u) => u.id === log.userId);
                return (
                  <div
                    key={log.id}
                    style={{
                      padding: "12px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      marginBottom: "8px",
                      backgroundColor: "white",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>
                      {user?.avatar || "👤"}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "bold" }}>
                        {user?.name || "Unknown"}
                        {log.type === "food" ? " ate" : " completed"}
                      </div>
                      <div style={{ color: "#666", fontSize: "14px" }}>
                        {log.amount} {log.unit} of {log.productName}
                        {log.choreName && ` (${log.choreName})`}
                      </div>
                    </div>
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
