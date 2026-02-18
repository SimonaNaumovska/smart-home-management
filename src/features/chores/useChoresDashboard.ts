import { useState, useEffect, useMemo, useCallback } from "react";
import type {
  ChoreDefinition,
  User,
  Room,
  ChoreCategory,
} from "../../types/Product";

/* ---------------- CONSTANTS ---------------- */

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

const PRIORITIES: ChoreDefinition["priority"][] = [
  "01 High",
  "02 Normal",
  "03 Low",
];

type ChoreView = "dashboard" | "form";

/* ---------------- PROPS ---------------- */

interface UseChoresDashboardProps {
  chores: ChoreDefinition[];
  activeUser: User | null;
  rooms: Room[];
  choreCategories: ChoreCategory[];
  onAddChore: (chore: ChoreDefinition) => void;
  onUpdateChore: (chore: ChoreDefinition) => void;
  onCompleteChore: (choreId: string) => void;
}

/* ---------------- HOOK ---------------- */

export const useChoresDashboard = ({
  chores,
  activeUser,
  rooms,
  choreCategories,
  onAddChore,
  onUpdateChore,
  onCompleteChore,
}: UseChoresDashboardProps) => {
  /* ---------- Derived Data ---------- */

  const availableRooms = useMemo(() => {
    if (rooms.length === 0) return DEFAULT_ROOMS;

    return [...rooms].sort((a, b) => a.order - b.order).map((r) => r.name);
  }, [rooms]);

  const availableCategories = useMemo(() => {
    if (choreCategories.length === 0) return CATEGORIES.map((c) => c.label);

    return [...choreCategories]
      .sort((a, b) => a.order - b.order)
      .map((c) => c.name);
  }, [choreCategories]);

  /* ---------- State ---------- */

  const [choreView, setChoreView] = useState<ChoreView>("dashboard");

  const [taskName, setTaskName] = useState("");

  const [room, setRoom] = useState<string>(availableRooms[0] ?? "Kitchen");

  const [choreCategory, setChoreCategory] = useState<
    ChoreDefinition["choreCategory"]
  >(availableCategories[0] ?? "Daily");

  const [priority, setPriority] =
    useState<ChoreDefinition["priority"]>("02 Normal");

  const [frequency, setFrequency] = useState<number>(1);

  const [isMobileView, setIsMobileView] = useState<boolean>(
    typeof window !== "undefined" && window.innerWidth <= 768,
  );

  /* ---------- Effects ---------- */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => setIsMobileView(window.innerWidth <= 768);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ---------- Status Helpers ---------- */

  const getStatus = useCallback((chore: ChoreDefinition): string => {
    if (!chore.nextDue) return "04 NOT SET";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(chore.nextDue);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "01 OVERDUE";
    if (diffDays === 0) return "02 DUE TODAY";
    if (diffDays === 1) return "03 DUE TOMORROW";
    return "05 OK";
  }, []);

  const getStatusColor = useCallback((status: string): string => {
    if (status.includes("OVERDUE")) return "chore-status-overdue";
    if (status.includes("DUE TODAY")) return "chore-status-today";
    if (status.includes("DUE TOMORROW")) return "chore-status-tomorrow";
    if (status.includes("NOT SET")) return "chore-status-notset";
    return "chore-status-ok";
  }, []);

  /* ---------- Handlers ---------- */

  const handleAddTask = useCallback(() => {
    if (!taskName.trim()) {
      alert("Please enter a chore name");
      return;
    }

    const newChore: ChoreDefinition = {
      id: `CHORE-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      name: taskName,
      room,
      choreCategory,
      priority,
      active: true,
      done: false,
      skipToday: false,
      lastDone: "",
      nextDue: "",
      frequency,
      skipDays: 0,
      consumedProducts: [],
    };

    onAddChore(newChore);

    setTaskName("");
    setChoreView("dashboard");
  }, [taskName, room, choreCategory, priority, frequency, onAddChore]);

  const handleMarkDone = useCallback(
    (chore: ChoreDefinition) => {
      if (!activeUser) {
        alert("Please select an active user first");
        return;
      }

      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      const nextDueDate = new Date(today);
      nextDueDate.setDate(nextDueDate.getDate() + chore.frequency);

      const updatedChore: ChoreDefinition = {
        ...chore,
        done: true,
        lastDone: todayStr,
        nextDue: nextDueDate.toISOString().split("T")[0],
        skipToday: false,
      };

      onUpdateChore(updatedChore);

      if (chore.consumedProducts.length > 0) {
        onCompleteChore(chore.id);
      }

      setTimeout(() => {
        onUpdateChore({ ...updatedChore, done: false });
      }, 500);
    },
    [activeUser, onUpdateChore, onCompleteChore],
  );

  const handleSkipToday = useCallback(
    (chore: ChoreDefinition) => {
      const updatedChore: ChoreDefinition = {
        ...chore,
        skipToday: !chore.skipToday,
        skipDays: chore.skipToday ? 0 : chore.skipDays + 1,
      };

      if (!chore.skipToday) {
        const nextDueDate = new Date();
        nextDueDate.setDate(nextDueDate.getDate() + 1);

        updatedChore.nextDue = nextDueDate.toISOString().split("T")[0];
      }

      onUpdateChore(updatedChore);
    },
    [onUpdateChore],
  );

  const handleToggleActive = useCallback(
    (chore: ChoreDefinition) => {
      onUpdateChore({
        ...chore,
        active: !chore.active,
      });
    },
    [onUpdateChore],
  );

  const handleCategoryChange = useCallback(
    (cat: ChoreDefinition["choreCategory"]) => {
      setChoreCategory(cat);

      const categoryData = choreCategories.find((c) => c.name === cat);

      const freq = categoryData
        ? categoryData.frequencyDays
        : (CATEGORIES.find((c) => c.label === cat)?.days ?? 1);

      setFrequency(freq);
    },
    [choreCategories],
  );

  /* ---------- Derived ---------- */

  const sortedChores = useMemo(() => {
    return [...chores].sort((a, b) => getStatus(a).localeCompare(getStatus(b)));
  }, [chores, getStatus]);

  const stats = useMemo(
    () => ({
      overdue: chores.filter((c) => getStatus(c).includes("OVERDUE")).length,
      dueToday: chores.filter((c) => getStatus(c).includes("DUE TODAY")).length,
      active: chores.filter((c) => c.active).length,
      skipped: chores.filter((c) => c.skipToday).length,
    }),
    [chores, getStatus],
  );

  /* ---------- Return ---------- */

  return {
    choreView,
    setChoreView,
    taskName,
    setTaskName,
    room,
    setRoom,
    choreCategory,
    setPriority,
    priority,
    frequency,
    isMobileView,
    availableRooms,
    availableCategories,
    PRIORITIES,
    sortedChores,
    stats,
    handleAddTask,
    handleMarkDone,
    handleSkipToday,
    handleToggleActive,
    handleCategoryChange,
    getStatus,
    getStatusColor,
  };
};
