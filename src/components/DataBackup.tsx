import React, { useState } from "react";
import { exportAllData, importData } from "../firebase/database";

interface DataBackupProps {
  householdId: string;
}

const DataBackup: React.FC<DataBackupProps> = ({ householdId }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleExport = async () => {
    setLoading(true);
    setMessage("");

    const result = await exportAllData(householdId);

    if (result.success) {
      // Create JSON file
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      // Download file
      const link = document.createElement("a");
      link.href = url;
      link.download = `household-backup-${new Date().toISOString().split("T")[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);
      setMessage("✅ Backup downloaded successfully!");
    } else {
      setMessage("❌ Export failed: " + result.error);
    }

    setLoading(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage("");

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const result = await importData(householdId, data);

      if (result.success) {
        setMessage("✅ Data imported successfully!");
      } else {
        setMessage("❌ Import failed: " + result.error);
      }
    } catch (error: any) {
      setMessage("❌ Invalid backup file: " + error.message);
    }

    setLoading(false);
    e.target.value = "";
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ marginBottom: "20px", color: "#333" }}>
        💾 Data Backup & Restore
      </h3>

      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={handleExport}
          disabled={loading}
          style={{
            padding: "12px 24px",
            backgroundColor: loading ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            flex: "1",
            minWidth: "150px",
          }}
        >
          {loading ? "⏳ Processing..." : "📥 Export Backup"}
        </button>

        <label
          style={{
            padding: "12px 24px",
            backgroundColor: loading ? "#ccc" : "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            flex: "1",
            minWidth: "150px",
            textAlign: "center",
          }}
        >
          {loading ? "⏳ Processing..." : "📤 Import Backup"}
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={loading}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {message && (
        <div
          style={{
            padding: "12px",
            backgroundColor: message.startsWith("✅") ? "#e8f5e9" : "#ffebee",
            color: message.startsWith("✅") ? "#2e7d32" : "#c62828",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#f9f9f9",
          borderRadius: "6px",
          fontSize: "13px",
          color: "#666",
        }}
      >
        <strong>ℹ️ Backup Information:</strong>
        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
          <li>Includes all products, users, chores, and logs</li>
          <li>Data is automatically synced to cloud</li>
          <li>Use export for local backup copies</li>
          <li>Import will merge with existing data</li>
        </ul>
      </div>
    </div>
  );
};

export default DataBackup;
