import { useState } from "react";
import type {
  Product,
  ConsumptionLog,
  ChoreDefinition,
} from "../../types/Product";

interface MaintenancePageProps {
  products: Product[];
  consumptionLogs: ConsumptionLog[];
  chores: ChoreDefinition[];
  onClearOldLogs: () => Promise<void>;
  onClearAllLogs: () => Promise<void>;
}

export function MaintenancePage({
  products,
  consumptionLogs,
  chores,
  onClearOldLogs,
  onClearAllLogs,
}: MaintenancePageProps) {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearOldLogs = async () => {
    if (
      !confirm(
        "This will delete consumption logs older than 90 days. Continue?",
      )
    ) {
      return;
    }

    setIsClearing(true);
    try {
      await onClearOldLogs();
      alert("✓ Old logs cleared successfully");
    } catch (error) {
      alert("Failed to clear old logs");
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearAllLogs = async () => {
    if (
      !confirm(
        "⚠️ WARNING: This will permanently delete ALL consumption logs. This action cannot be undone. Are you sure?",
      )
    ) {
      return;
    }

    setIsClearing(true);
    try {
      await onClearAllLogs();
      alert("✓ All logs cleared successfully");
    } catch (error) {
      alert("Failed to clear logs");
    } finally {
      setIsClearing(false);
    }
  };

  // Calculate statistics
  const totalProducts = products.length;
  const foodProducts = products.filter(
    (p) => p.category === "Food & Beverage",
  ).length;
  const cleaningProducts = products.filter(
    (p) => p.category === "Cleaning",
  ).length;
  const lowStockItems = products.filter((p) => p.quantity <= p.minStock).length;
  const totalChores = chores.length;
  const totalLogs = consumptionLogs.length;

  // Calculate log age
  const oldestLog = consumptionLogs.reduce(
    (oldest, log) => (log.timestamp < oldest ? log.timestamp : oldest),
    Date.now(),
  );

  const daysSinceOldest = consumptionLogs.length
    ? Math.floor((Date.now() - oldestLog) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="maintenance-page">
      <div className="analytics-header">
        <h2>🔧 Maintenance & System Info</h2>
        <p className="analytics-subtitle">Manage and optimize your system</p>
      </div>

      {/* System Statistics */}
      <div className="maintenance-section">
        <h3 className="section-title">📊 System Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{totalProducts}</div>
            <div className="stat-label">Total Products</div>
            <div className="stat-breakdown">
              Food: {foodProducts} | Cleaning: {cleaningProducts}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{lowStockItems}</div>
            <div className="stat-label">Low Stock Items</div>
            <div className="stat-breakdown">
              {lowStockItems === 0 ? "All stocked!" : "Need attention"}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{totalChores}</div>
            <div className="stat-label">Total Chores</div>
            <div className="stat-breakdown">Active tasks</div>
          </div>

          <div className="stat-card">
            <div className="stat-value">{totalLogs}</div>
            <div className="stat-label">Consumption Logs</div>
            <div className="stat-breakdown">
              {daysSinceOldest > 0 ? `${daysSinceOldest} days old` : "No logs"}
            </div>
          </div>
        </div>
      </div>

      {/* Database Maintenance */}
      <div className="maintenance-section">
        <h3 className="section-title">🗄️ Database Maintenance</h3>
        <div className="maintenance-actions">
          <div className="maintenance-card">
            <div className="maintenance-card-icon">🧹</div>
            <h4>Clear Old Logs</h4>
            <p className="maintenance-card-description">
              Remove consumption logs older than 90 days to optimize database
              performance.
            </p>
            <button
              onClick={handleClearOldLogs}
              disabled={isClearing || totalLogs === 0}
              className="maintenance-button primary"
            >
              {isClearing ? "Clearing..." : "Clear Old Logs"}
            </button>
          </div>

          <div className="maintenance-card danger">
            <div className="maintenance-card-icon">⚠️</div>
            <h4>Clear All Logs</h4>
            <p className="maintenance-card-description">
              Permanently delete all consumption logs. This action cannot be
              undone.
            </p>
            <button
              onClick={handleClearAllLogs}
              disabled={isClearing || totalLogs === 0}
              className="maintenance-button danger"
            >
              {isClearing ? "Clearing..." : "Clear All Logs"}
            </button>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="maintenance-section">
        <h3 className="section-title">ℹ️ System Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Database Status:</span>
            <span className="info-value status-online">● Online</span>
          </div>
          <div className="info-item">
            <span className="info-label">Cloud Sync:</span>
            <span className="info-value status-online">● Active</span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Sync:</span>
            <span className="info-value">Real-time</span>
          </div>
          <div className="info-item">
            <span className="info-label">App Version:</span>
            <span className="info-value">1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
