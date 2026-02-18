import { useState, useEffect } from "react";
import { authApi } from "../../api/authApi";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authApi.getSession();
        if (session.user) {
          setIsAuthenticated(true);
          setCurrentUserEmail(session.user.email);
          setCurrentUserId(session.user.id);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuth();

    // Subscribe to auth state changes
    const unsubscribe = authApi.onAuthStateChange((user) => {
      if (user) {
        setIsAuthenticated(true);
        setCurrentUserEmail(user.email);
        setCurrentUserId(user.id);
      } else {
        setIsAuthenticated(false);
        setCurrentUserEmail("");
        setCurrentUserId("");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await authApi.signOut();
    setIsAuthenticated(false);
    setCurrentUserEmail("");
    setCurrentUserId("");
  };

  return {
    isAuthenticated,
    currentUserEmail,
    currentUserId,
    authChecking,
    signOut,
  };
};
