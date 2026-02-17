import { useState, useEffect } from "react";
import type { ChoreDefinition, Room, ChoreCategory } from "../../types/Product";
import {
  syncChores,
  addChore as addChoreDB,
  updateChore as updateChoreDB,
  deleteChore as deleteChoreDB,
  syncRooms,
  addRoom as addRoomDB,
  deleteRoom as deleteRoomDB,
  syncChoreCategories,
  addChoreCategory as addChoreCategoryDB,
  deleteChoreCategory as deleteChoreCategoryDB,
} from "../../supabase/database";

export const useChores = (householdId: string) => {
  const [chores, setChores] = useState<ChoreDefinition[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [choreCategories, setChoreCategories] = useState<ChoreCategory[]>([]);

  useEffect(() => {
    if (!householdId) return;

    const unsubscribeChores = syncChores(householdId, (syncedChores) => {
      setChores(syncedChores);
    });

    const unsubscribeRooms = syncRooms(householdId, (syncedRooms) => {
      setRooms(syncedRooms);
    });

    const unsubscribeCategories = syncChoreCategories(
      householdId,
      (syncedCategories) => {
        setChoreCategories(syncedCategories);
      },
    );

    return () => {
      unsubscribeChores();
      unsubscribeRooms();
      unsubscribeCategories();
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

  const addRoom = async (room: Omit<Room, "id">) => {
    const newRoom: Room = {
      ...room,
      id: crypto.randomUUID(),
    };
    await addRoomDB(householdId, newRoom);
  };

  const deleteRoom = async (roomId: string) => {
    if (confirm("Are you sure you want to delete this room?")) {
      await deleteRoomDB(householdId, roomId);
    }
  };

  const addCategory = async (category: Omit<ChoreCategory, "id">) => {
    const newCategory: ChoreCategory = {
      ...category,
      id: crypto.randomUUID(),
    };
    await addChoreCategoryDB(householdId, newCategory);
  };

  const deleteCategory = async (categoryId: string) => {
    if (confirm("Are you sure you want to delete this frequency?")) {
      await deleteChoreCategoryDB(householdId, categoryId);
    }
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
