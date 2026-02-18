import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import MenuIcon from "@mui/icons-material/Menu";
import "./Layout.css";

interface SidebarProps {
  userEmail: string;
  onSignOut: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({
  userEmail,
  onSignOut,
  isOpen,
  onToggle,
}: SidebarProps) => {
  const menuItems = [
    { path: "/", label: "Analytics", icon: "📊" },
    { path: "/inventory", label: "Inventory", icon: "📦" },
    { path: "/shopping", label: "Shopping", icon: "🛒" },
    { path: "/consumption", label: "Consumption", icon: "🍽️" },
    { path: "/chores", label: "Chores", icon: "🧹" },
    { path: "/ai", label: "AI Smart", icon: "🤖" },
    { path: "/members", label: "Members", icon: "👥" },
    { path: "/settings", label: "Settings", icon: "⚙️" },
  ];

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onToggle}
          onKeyDown={(e) => {
            if (e.key === "Escape") onToggle();
          }}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">🏠 Smart Home</h1>
          <p className="sidebar-subtitle">Household OS</p>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? "active" : ""}`
              }
              end={item.path === "/"}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-info">
              <span className="sidebar-user-icon">👤</span>
              <span className="sidebar-user-email">{userEmail}</span>
            </div>
            <Button
              variant="outlined"
              color="error"
              onClick={onSignOut}
              className="sidebar-signout-btn"
              fullWidth
              size="small"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

interface LayoutProps {
  children: ReactNode;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Layout = ({
  children,
  isSidebarOpen,
  onToggleSidebar,
}: LayoutProps) => {
  return (
    <Box className="layout-container">
      {/* Hamburger menu button */}
      <IconButton
        className="hamburger-btn"
        onClick={onToggleSidebar}
        aria-label="Toggle menu"
        color="primary"
      >
        <MenuIcon />
      </IconButton>

      <Box
        component="main"
        className={`layout-main ${isSidebarOpen ? "sidebar-open" : ""}`}
      >
        {children}
      </Box>
    </Box>
  );
};
