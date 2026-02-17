import { useState, useEffect } from "react";
import { supabase } from "../../supabase/config";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          setIsAuthenticated(true);
          setCurrentUserEmail(data.session.user.email || "");
          setCurrentUserId(data.session.user.id);
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
        setCurrentUserEmail(session.user.email || "");
        setCurrentUserId(session.user.id);
      } else {
        setIsAuthenticated(false);
        setCurrentUserEmail("");
        setCurrentUserId("");
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
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
