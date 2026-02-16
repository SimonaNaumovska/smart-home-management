import { useState, useEffect } from "react";
import type { ChoreDefinition, Room, ChoreCategory } from "../types/Product";
import {
  syncChores,
  addChore as addChoreDB,
  updateChore as updateChoreDB,
  deleteChore as deleteChoreDB,
} from "../supabase/database";

export const useChores = (householdId: string) => {
  const [chores, setChores] = useState<ChoreDefinition[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [choreCategories, setChoreCategories] = useState<ChoreCategory[]>([]);

  useEffect(() => {
    if (!householdId) return;

    const unsubscribe = syncChores(householdId, (syncedChores) => {
      setChores(syncedChores);
    });

    return () => {
      unsubscribe();
    };
  }, [householdId]);

  const addChore = async (chore: ChoreDefinition) => {
    setChores((prev) => [...prev, chore]);
    await addChoreDB(householdId, chore);
  };

  const updateChore = async (chore: ChoreDefinition) => {
    setChores((prev) => prev.map((c) => (c.id === chore.id ? chore : c)));
    await updateChoreDB(householdId, chore);
  };

  const deleteChore = async (choreId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      setChores((prev) => prev.filter((c) => c.id !== choreId));
      await deleteChoreDB(householdId, choreId);
    }
  };

  const addRoom = (room: Omit<Room, "id">) => {
    const newRoom: Room = {
      ...room,
      id: crypto.randomUUID(),
    };
    setRooms((prev) => [...prev, newRoom]);
  };

  const deleteRoom = (roomId: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
  };

  const addCategory = (category: Omit<ChoreCategory, "id">) => {
    const newCategory: ChoreCategory = {
      ...category,
      id: crypto.randomUUID(),
    };
    setChoreCategories((prev) => [...prev, newCategory]);
  };

  const deleteCategory = (categoryId: string) => {
    setChoreCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  return {
    chores,
    rooms,
    choreCategories,
    addChore,
    updateChore,
    deleteChore,
    addRoom,
    deleteRoom,
    addCategory,
    deleteCategory,
  };
};
