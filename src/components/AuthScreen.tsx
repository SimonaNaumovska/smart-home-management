import React, { useState } from "react";
import {
  registerHousehold,
  signInHousehold,
  signInWithGoogle,
} from "../firebase/auth";

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSignUp) {
      if (!householdName) {
        setError("Please enter a household name");
        setLoading(false);
        return;
      }
      const result = await registerHousehold(email, password, householdName);
      if (result.success) {
        onAuthSuccess();
      } else {
        setError(result.error || "Registration failed");
      }
    } else {
      const result = await signInHousehold(email, password);
      if (result.success) {
        onAuthSuccess();
      } else {
        setError(result.error || "Sign in failed");
      }
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    const result = await signInWithGoogle();
    if (result.success) {
      onAuthSuccess();
    } else {
      setError(result.error || "Google sign in failed");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>🏠</h1>
          <h2 style={{ fontSize: "24px", marginBottom: "5px", color: "#333" }}>
            Smart Household OS
          </h2>
          <p style={{ color: "#666", fontSize: "14px" }}>
            {isSignUp
              ? "Create your household account"
              : "Sign in to your household"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Household Name
              </label>
              <input
                type="text"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                placeholder="e.g., Smith Family"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
                required={isSignUp}
              />
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
              }}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#ffebee",
                color: "#c62828",
                borderRadius: "6px",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: loading ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "15px",
            }}
          >
            {loading
              ? "Please wait..."
              : isSignUp
                ? "🎉 Create Household"
                : "🔐 Sign In"}
          </button>

          <div style={{ textAlign: "center", marginBottom: "15px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "15px 0",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  backgroundColor: "#ddd",
                }}
              ></div>
              <span
                style={{
                  padding: "0 10px",
                  color: "#666",
                  fontSize: "12px",
                }}
              >
                OR
              </span>
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  backgroundColor: "#ddd",
                }}
              ></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "white",
                color: "#333",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path
                  fill="#4285F4"
                  d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
                />
                <path
                  fill="#34A853"
                  d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"
                />
                <path
                  fill="#FBBC05"
                  d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"
                />
                <path
                  fill="#EA4335"
                  d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"
                />
              </svg>
              {isSignUp ? "Sign up with Google" : "Sign in with Google"}
            </button>
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "#4CAF50",
                cursor: "pointer",
                fontSize: "14px",
                textDecoration: "underline",
              }}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>

        <div
          style={{
            marginTop: "30px",
            padding: "15px",
            backgroundColor: "#f9f9f9",
            borderRadius: "6px",
            fontSize: "12px",
            color: "#666",
          }}
        >
          <strong>✨ Features:</strong>
          <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
            <li>Multi-device sync in real-time</li>
            <li>Shared household management</li>
            <li>Secure cloud backup</li>
            <li>Access from anywhere</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
