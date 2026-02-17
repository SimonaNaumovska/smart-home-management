import React, { useState, useEffect } from "react";

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        backgroundColor: "#ff9800",
        color: "white",
        padding: "12px",
        textAlign: "center",
        fontSize: "14px",
        fontWeight: "bold",
        zIndex: 10000,
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      }}
    >
      📵 You're offline. Changes will sync when you reconnect.
    </div>
  );
};

export default OfflineIndicator;
