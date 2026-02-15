import type { ChoreDefinition, Product, User } from "../types/Product";

interface ChoreSystemProps {
  chores: ChoreDefinition[];
  products: Product[];
  activeUser: User | null;
  onCompleteChore: (choreId: string) => void;
  onAddChore: (chore: Omit<ChoreDefinition, "id">) => void;
}

// Note: This is a legacy component. ChoresDashboard is used in the main app instead.
export function ChoreSystem({ chores }: ChoreSystemProps) {
  return (
    <div style={{ padding: "20px" }}>
      <h2>🧹 Legacy Chore System</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        This component has been replaced by ChoresDashboard. Please use the
        Chores tab in the main navigation.
      </p>
      <div>
        <strong>Current Chores:</strong> {chores.length}
      </div>
    </div>
  );
}
