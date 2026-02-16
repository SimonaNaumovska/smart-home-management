import { useState, useEffect } from "react";
import type { User } from "../types/Product";
import { syncUsers, addUser as addUserDB } from "../supabase/database";

export const useUsers = (householdId: string) => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);

  useEffect(() => {
    if (!householdId) return;

    const unsubscribe = syncUsers(householdId, (syncedUsers) => {
      setUsers(syncedUsers);
    });

    return () => {
      unsubscribe();
    };
  }, [householdId]);

  const addUser = async (name: string, avatar: string, color: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      avatar,
      color,
    };
    setUsers((prev) => [...prev, newUser]);
    if (!activeUser) {
      setActiveUser(newUser);
    }
    await addUserDB(householdId, newUser);
  };

  const selectUser = (user: User) => {
    setActiveUser(user);
  };

  return {
    users,
    activeUser,
    addUser,
    selectUser,
  };
};
