import { useState, useEffect } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { onAuthChange, signOutHousehold } from "./firebase/auth";
import { auth } from "./firebase/config";

import AuthScreen from "./components/AuthScreen";
import OfflineIndicator from "./components/OfflineIndicator";
import App from "./App";

function AppWithFirebase() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [useFirebase, setUseFirebase] = useState(true);

  useEffect(() => {
    // Check if Firebase is configured
    try {
      // Check if Firebase auth is properly initialized
      if (
        !auth ||
        !auth.config.apiKey ||
        auth.config.apiKey === "YOUR_API_KEY"
      ) {
        console.log("📝 Firebase not configured. Using localStorage.");
        setUseFirebase(false);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.log("📝 Firebase error. Using localStorage fallback.");
      setUseFirebase(false);
      setLoading(false);
      return;
    }

    // Listen for auth state changes
    const unsubscribe = onAuthChange((user) => {
      setFirebaseUser(user);
      setLoading(false);
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const handleSignOut = async () => {
    await signOutHousehold();
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>🏠</div>
          <div style={{ fontSize: "18px", color: "#666" }}>
            Loading Smart Household OS...
          </div>
        </div>
      </div>
    );
  }

  // If Firebase not configured, show localStorage version
  if (!useFirebase) {
    return (
      <div>
        <div
          style={{
            backgroundColor: "#fff3cd",
            color: "#856404",
            padding: "12px",
            textAlign: "center",
            fontSize: "13px",
            borderBottom: "1px solid #ffeaa7",
          }}
        >
          📝 Running in Local Mode (localStorage). Set up Firebase for
          multi-device sync.
        </div>
        <App />
      </div>
    );
  }

  // If not authenticated, show auth screen
  if (!firebaseUser) {
    return <AuthScreen onAuthSuccess={() => {}} />;
  }

  // Authenticated - show app with Firebase sync
  return (
    <div>
      <OfflineIndicator />
      <div
        style={{
          backgroundColor: "#e8f5e9",
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #c8e6c9",
        }}
      >
        <div style={{ fontSize: "13px", color: "#2e7d32" }}>
          ☁️ Connected: {firebaseUser.displayName || firebaseUser.email}
        </div>
        <button
          onClick={handleSignOut}
          style={{
            padding: "6px 16px",
            backgroundColor: "transparent",
            color: "#2e7d32",
            border: "1px solid #2e7d32",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          🚪 Sign Out
        </button>
      </div>
      <App householdId={firebaseUser.uid} useFirebase={true} />
    </div>
  );
}

export default AppWithFirebase;
