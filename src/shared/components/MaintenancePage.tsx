import React from "react";
import "./MaintenancePage.css";

const MaintenancePage: React.FC = () => {
  return (
    <div className="maintenance-container">
      <div className="maintenance-content">
        <div className="maintenance-icon">🔧</div>
        <h1 className="maintenance-title">Under Maintenance</h1>
        <p className="maintenance-message">
          We're currently performing scheduled maintenance to improve your
          experience.
        </p>
        <p className="maintenance-submessage">
          We'll be back shortly. Thank you for your patience!
        </p>
        <div className="maintenance-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
