import { Outlet } from "react-router-dom";
import { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import "./AppLayout.css";

interface AppLayoutProps {
  sidebar?: ReactNode;
  headerTitle?: string;
}

export const AppLayout = ({
  sidebar,
  headerTitle = "Smart Home Management",
}: AppLayoutProps) => {
  return (
    <Box className="app-layout">
      {sidebar && (
        <Box component="aside" className="app-layout-sidebar">
          {sidebar}
        </Box>
      )}

      <Box className="app-layout-content">
        <Box component="header" className="app-header">
          <Typography variant="h4" component="h1" className="app-header-title">
            {headerTitle}
          </Typography>
        </Box>

        <Box component="main" className="app-main">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
