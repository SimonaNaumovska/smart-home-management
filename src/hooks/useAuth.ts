import { useState, useEffect } from "react";
import { supabase } from "../supabase/config";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          setIsAuthenticated(true);
          setCurrentUserId(data.session.user.id);
          setCurrentUserEmail(data.session.user.email || "");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setCurrentUserId(session.user.id);
        setCurrentUserEmail(session.user.email || "");
      } else {
        setIsAuthenticated(false);
        setCurrentUserId("");
        setCurrentUserEmail("");
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentUserId("");
    setCurrentUserEmail("");
  };

  return {
    isAuthenticated,
    currentUserId,
    currentUserEmail,
    authChecking,
    signOut,
  };
};
