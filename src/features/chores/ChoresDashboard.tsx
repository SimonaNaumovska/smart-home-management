import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Alert,
} from "@mui/material";
import type {
  ChoreDefinition,
  User,
  Product,
  Room,
  ChoreCategory,
} from "../../types/Product";
import { useChoresDashboard } from "./useChoresDashboard";

interface ChoresDashboardProps {
  chores: ChoreDefinition[];
  products: Product[];
  activeUser: User | null;
  rooms: Room[];
  choreCategories: ChoreCategory[];
  onAddChore: (chore: ChoreDefinition) => void;
  onUpdateChore: (chore: ChoreDefinition) => void;
  onCompleteChore: (choreId: string) => void;
  onDeleteChore: (choreId: string) => void;
}

// Fallback rooms if no rooms are defined
const DEFAULT_ROOMS = [
  "Kitchen",
  "Bathroom",
  "Bedroom1",
  "Bedroom2",
  "Bedroom3",
  "Living Room",
  "Whole House",
  "Storage",
  "Garage",
  "Other",
];

const CATEGORIES = [
  { label: "Daily", days: 1 },
  { label: "Weekly", days: 7 },
  { label: "Biweekly", days: 14 },
  { label: "Monthly", days: 30 },
  { label: "Quarterly", days: 90 },
  { label: "Half-year", days: 180 },
];

const PRIORITIES = ["01 High", "02 Normal", "03 Low"];

export function ChoresDashboard({
  chores,
  activeUser,
  rooms,
  choreCategories,
  onAddChore,
  onUpdateChore,
  onCompleteChore,
  onDeleteChore,
}: ChoresDashboardProps) {
  const {
    choreView,
    setChoreView,
    taskName,
    setTaskName,
    room,
    setRoom,
    availableRooms,
    sortedChores,
    stats,
    handleAddTask,
    handleMarkDone,
    handleToggleActive,
    getStatus,
    getStatusColor,
  } = useChoresDashboard({
    chores,
    activeUser,
    rooms,
    choreCategories,
    onAddChore,
    onUpdateChore,
    onCompleteChore,
  });

  // Ensure choreView type allows "dashboard" and "form"
  type ChoreViewType = "dashboard" | "form";

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🗓️ Chores Management
      </Typography>

      {!activeUser && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          ⚠️ Please select an active user to mark chores as done
        </Alert>
      )}

      {choreView === "dashboard" ? (
        <>
          {/* Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h5" color="error.main">
                    {stats.overdue}
                  </Typography>
                  <Typography variant="body2">Overdue</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h5" color="warning.main">
                    {stats.dueToday}
                  </Typography>
                  <Typography variant="body2">Due Today</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h5" color="success.main">
                    {stats.active}
                  </Typography>
                  <Typography variant="body2">Active</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h5" color="info.main">
                    {stats.skipped}
                  </Typography>
                  <Typography variant="body2">Skipped</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Toolbar */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Button
              variant={choreView === "dashboard" ? "contained" : "outlined"}
              onClick={() => setChoreView("dashboard")}
            >
              Dashboard
            </Button>
            <Button
              variant={choreView === "form" ? "contained" : "outlined"}
              color="success"
              onClick={() => setChoreView("form")}
            >
              Add Chore
            </Button>
          </Box>

          {/* Mobile Cards */}
          <Grid container spacing={2}>
            {sortedChores.length === 0 ? (
              <Grid size={12}>
                <Typography align="center">No chores yet.</Typography>
              </Grid>
            ) : (
              sortedChores.map((chore) => {
                const status = getStatus(chore);
                const statusColorClass = getStatusColor(status);

                return (
                  <Grid size={12} key={chore.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{chore.name}</Typography>

                        <Chip
                          label={status}
                          color={
                            statusColorClass === "status-overdue"
                              ? "error"
                              : statusColorClass === "status-today"
                                ? "warning"
                                : statusColorClass === "status-active"
                                  ? "success"
                                  : statusColorClass === "status-skipped"
                                    ? "info"
                                    : "default"
                          }
                          size="small"
                          sx={{ mb: 1 }}
                        />

                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            onClick={() => handleToggleActive(chore)}
                            size="small"
                          >
                            Toggle
                          </Button>

                          <Button
                            onClick={() => handleMarkDone(chore)}
                            disabled={!activeUser}
                            size="small"
                            color="success"
                            variant="contained"
                          >
                            Done
                          </Button>

                          <Button
                            onClick={() => onDeleteChore(chore.id)}
                            size="small"
                            color="error"
                            variant="outlined"
                          >
                            Delete
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            )}
          </Grid>
        </>
      ) : (
        <>
          {/* Form */}
          <Card sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Add New Chore
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Chore Name"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Room</InputLabel>
                    <Select
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                    >
                      {availableRooms.map((r) => (
                        <MenuItem key={r} value={r}>
                          {r}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                onClick={handleAddTask}
                variant="contained"
                color="success"
                fullWidth
                sx={{ mt: 3 }}
              >
                Add Task
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
