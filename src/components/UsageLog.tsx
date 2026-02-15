import type { UsageHistory } from "../types/Product";

interface UsageLogProps {
  history: UsageHistory[];
  onClear: () => void;
}

export function UsageLog({ history, onClear }: UsageLogProps) {
  return (
    <>
      <h2>Usage Log</h2>
      {history.length === 0 ? (
        <p>No usage history yet.</p>
      ) : (
        <>
          <div style={{ overflowX: "auto", marginBottom: "10px" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f5f5f5",
                    borderBottom: "2px solid #ddd",
                  }}
                >
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    Date & Time
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    Product Name
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "center",
                      border: "1px solid #ddd",
                    }}
                  >
                    Amount Used
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "left",
                      border: "1px solid #ddd",
                    }}
                  >
                    Unit
                  </th>
                </tr>
              </thead>
              <tbody>
                {history
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((entry) => (
                    <tr
                      key={entry.id}
                      style={{ borderBottom: "1px solid #ddd" }}
                    >
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {entry.productName}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          textAlign: "center",
                        }}
                      >
                        {entry.amount}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {entry.unit}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={onClear}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Clear Usage Log
          </button>
        </>
      )}
    </>
  );
}
