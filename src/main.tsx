import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App";
import MaintenancePage from "./shared/components/MaintenancePage";
import "./index.css";

const theme = createTheme({
  palette: {
    mode: "light", // change to "dark" later if you want
    primary: {
      main: "#1976d2",
    },
  },
});

const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === "true";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        {isMaintenanceMode ? <MaintenancePage /> : <App />}
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
