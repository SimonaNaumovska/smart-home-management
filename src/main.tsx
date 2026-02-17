import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import MaintenancePage from "./shared/components/MaintenancePage";
import "./index.css";

const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === "true";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {isMaintenanceMode ? <MaintenancePage /> : <App />}
  </React.StrictMode>,
);
