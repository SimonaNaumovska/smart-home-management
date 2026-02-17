import type { ReactNode } from "react";
import "./Layout.css";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userEmail: string;
  onSignOut: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({
  activeTab,
  onTabChange,
  userEmail,
  onSignOut,
  isOpen,
  onToggle,
}: SidebarProps) => {
  const menuItems = [
    { key: "inventory", label: "Inventory", icon: "📦" },
    { key: "shopping", label: "Shopping", icon: "🛒" },
    { key: "consumption", label: "Consumption", icon: "🍽️" },
    { key: "chores", label: "Chores", icon: "🧹" },
    { key: "analytics", label: "Analytics", icon: "📊" },
    { key: "ai", label: "AI Smart", icon: "🤖" },
    { key: "members", label: "Members", icon: "👥" },
    { key: "maintenance", label: "Maintenance", icon: "🔧" },
    { key: "settings", label: "Settings", icon: "⚙️" },
  ];

  const handleNavClick = (key: string) => {
    onTabChange(key);
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
            <button
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              className={`sidebar-nav-item ${activeTab === item.key ? "active" : ""}`}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-info">
              <span className="sidebar-user-icon">👤</span>
              <span className="sidebar-user-email">{userEmail}</span>
            </div>
            <button onClick={onSignOut} className="sidebar-signout-btn">
              Sign Out
            </button>
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
    <div className="layout-container">
      {/* Hamburger menu button */}
      <button
        className="hamburger-btn"
        onClick={onToggleSidebar}
        aria-label="Toggle menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      <main className={`layout-main ${isSidebarOpen ? "sidebar-open" : ""}`}>
        {children}
      </main>
    </div>
  );
};
