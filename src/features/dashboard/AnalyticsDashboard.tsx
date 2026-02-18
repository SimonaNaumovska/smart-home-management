import type { ConsumptionLog, User, Product } from "../../types/Product";
import { useAnalyticsDashboard } from "./useAnalyticsDashboard";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Grid from "@mui/material/Grid";

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
  const {
    userStats,
    lowStockProducts,
    outOfStockProducts,
    expiringSoon,
    hasAlerts,
    sortedConsumptionLogs,
  } = useAnalyticsDashboard({ consumptionLogs, users, products });

  return (
    <Card
      sx={{
        mb: 3,
        borderColor: "info.main",
        borderWidth: 2,
        borderStyle: "solid",
      }}
    >
      <CardContent>
        <Typography variant="h5" component="h2" color="info.dark" gutterBottom>
          📊 Household Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Last 7 days insights
        </Typography>

        {/* Alerts */}
        {hasAlerts && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" color="error" gutterBottom>
              ⚠️ Alerts
            </Typography>

            {outOfStockProducts.length > 0 && (
              <Alert severity="error" sx={{ mb: 1 }}>
                <AlertTitle>Out of Stock</AlertTitle>
                {outOfStockProducts.map((p) => p.name).join(", ")}
              </Alert>
            )}

            {lowStockProducts.length > 0 && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                <AlertTitle>Low Stock</AlertTitle>
                {lowStockProducts.map((p) => p.name).join(", ")}
              </Alert>
            )}

            {expiringSoon.length > 0 && (
              <Alert severity="info">
                <AlertTitle>Expiring Soon</AlertTitle>
                {expiringSoon.map((p) => p.name).join(", ")}
              </Alert>
            )}
          </Box>
        )}

        {/* User Performance */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            👥 User Activity
          </Typography>
          <Grid container spacing={2}>
            {userStats.map(({ user, foodConsumed, choresCompleted }) => (
              <Grid item xs={12} sm={6} md={4} key={user.id}>
                <Card
                  sx={{
                    borderColor: user.color,
                    borderWidth: 2,
                    borderStyle: "solid",
                    bgcolor: user.color + "20",
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Typography variant="h4">{user.avatar}</Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {user.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      🍽️ Food Items: {foodConsumed}
                    </Typography>
                    <Typography variant="body2">
                      🧹 Chores Done: {choresCompleted}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Recent Activity */}
        <Box>
          <Typography variant="h6" gutterBottom>
            📝 Recent Activity
          </Typography>
          {consumptionLogs.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No activity logged yet
            </Typography>
          ) : (
            <Box sx={{ maxHeight: 300, overflow: "auto" }}>
              {sortedConsumptionLogs.map((log) => {
                const user = users.find((u) => u.id === log.userId);
                return (
                  <Card key={log.id} sx={{ mb: 1 }}>
                    <CardContent
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        py: 1.5,
                        "&:last-child": { pb: 1.5 },
                      }}
                    >
                      <Typography variant="h5">
                        {user?.avatar || "👤"}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight="bold">
                          {user?.name || "Unknown"}
                          {log.type === "food" ? " ate" : " completed"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {log.amount} {log.unit} of {log.productName}
                          {log.choreName && ` (${log.choreName})`}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
