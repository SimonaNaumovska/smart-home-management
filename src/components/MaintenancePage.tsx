export function MaintenancePage() {
  return (
    <div className="maintenance-mode-page">
      <div className="maintenance-content">
        <div className="maintenance-icon">🔧</div>
        <h1 className="maintenance-title">Under Maintenance</h1>
        <p className="maintenance-message">
          We're currently performing scheduled maintenance to improve your
          experience.
        </p>
        <p className="maintenance-submessage">
          The site will be back online shortly. Thank you for your patience!
        </p>
        <div className="maintenance-status">
          <div className="status-indicator"></div>
          <span>Working on updates...</span>
        </div>
      </div>
    </div>
  );
}
