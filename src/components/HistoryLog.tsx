import type { UsageHistory } from "../types/Product";

interface HistoryLogProps {
  history: UsageHistory[];
  onClear: () => void;
}

export function HistoryLog({ history, onClear }: HistoryLogProps) {
  return (
    <>
      <h2>Usage History</h2>
      {history.length === 0 ? (
        <p>No usage history yet.</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {history
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((entry) => (
                <li
                  key={entry.id}
                  style={{ padding: "8px 0", borderBottom: "1px solid #ddd" }}
                >
                  {new Date(entry.timestamp).toLocaleString()} — Used{" "}
                  {entry.amount} {entry.unit} of {entry.productName}
                </li>
              ))}
          </ul>
          <button
            onClick={onClear}
            style={{
              marginTop: "10px",
              backgroundColor: "#6c757d",
              color: "white",
            }}
          >
            Clear History
          </button>
        </>
      )}
    </>
  );
}
