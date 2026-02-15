import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import type {
  Product,
  User,
  ChoreDefinition,
  ConsumptionLog,
} from "../types/Product";

// ====================================
// PRODUCTS
// ====================================

export const syncProducts = (
  householdId: string,
  callback: (products: Product[]) => void,
) => {
  const productsRef = collection(db, "households", householdId, "products");

  return onSnapshot(productsRef, (snapshot) => {
    const products: Product[] = [];
    snapshot.forEach((doc) => {
      products.push({ ...doc.data() } as Product);
    });
    callback(products);
  });
};

export const addProduct = async (householdId: string, product: Product) => {
  try {
    const productRef = doc(
      db,
      "households",
      householdId,
      "products",
      product.id,
    );
    await setDoc(productRef, {
      ...product,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateProduct = async (householdId: string, product: Product) => {
  try {
    const productRef = doc(
      db,
      "households",
      householdId,
      "products",
      product.id,
    );
    await updateDoc(productRef, {
      ...product,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteProduct = async (householdId: string, productId: string) => {
  try {
    const productRef = doc(
      db,
      "households",
      householdId,
      "products",
      productId,
    );
    await deleteDoc(productRef);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ====================================
// USERS (Household Members)
// ====================================

export const syncUsers = (
  householdId: string,
  callback: (users: User[]) => void,
) => {
  const usersRef = collection(db, "households", householdId, "users");

  return onSnapshot(usersRef, (snapshot) => {
    const users: User[] = [];
    snapshot.forEach((doc) => {
      users.push({ ...doc.data() } as User);
    });
    callback(users);
  });
};

export const addUser = async (householdId: string, user: User) => {
  try {
    const userRef = doc(db, "households", householdId, "users", user.id);
    await setDoc(userRef, {
      ...user,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteUser = async (householdId: string, userId: string) => {
  try {
    const userRef = doc(db, "households", householdId, "users", userId);
    await deleteDoc(userRef);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ====================================
// CHORES
// ====================================

export const syncChores = (
  householdId: string,
  callback: (chores: ChoreDefinition[]) => void,
) => {
  const choresRef = collection(db, "households", householdId, "chores");

  return onSnapshot(choresRef, (snapshot) => {
    const chores: ChoreDefinition[] = [];
    snapshot.forEach((doc) => {
      chores.push({ ...doc.data() } as ChoreDefinition);
    });
    callback(chores);
  });
};

export const addChore = async (householdId: string, chore: ChoreDefinition) => {
  try {
    const choreRef = doc(db, "households", householdId, "chores", chore.id);
    await setDoc(choreRef, {
      ...chore,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateChore = async (
  householdId: string,
  chore: ChoreDefinition,
) => {
  try {
    const choreRef = doc(db, "households", householdId, "chores", chore.id);
    await updateDoc(choreRef, {
      ...chore,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteChore = async (householdId: string, choreId: string) => {
  try {
    const choreRef = doc(db, "households", householdId, "chores", choreId);
    await deleteDoc(choreRef);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ====================================
// CONSUMPTION LOGS
// ====================================

export const syncConsumptionLogs = (
  householdId: string,
  callback: (logs: ConsumptionLog[]) => void,
) => {
  const logsRef = collection(db, "households", householdId, "consumptionLogs");

  return onSnapshot(logsRef, (snapshot) => {
    const logs: ConsumptionLog[] = [];
    snapshot.forEach((doc) => {
      logs.push({ ...doc.data() } as ConsumptionLog);
    });
    callback(logs);
  });
};

export const addConsumptionLog = async (
  householdId: string,
  log: ConsumptionLog,
) => {
  try {
    const logRef = doc(
      db,
      "households",
      householdId,
      "consumptionLogs",
      log.id,
    );
    await setDoc(logRef, {
      ...log,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ====================================
// ACTIVE USER (per device)
// ====================================

export const setActiveUser = async (
  householdId: string,
  deviceId: string,
  userId: string | null,
) => {
  try {
    const activeUserRef = doc(
      db,
      "households",
      householdId,
      "activeUsers",
      deviceId,
    );
    if (userId) {
      await setDoc(activeUserRef, {
        userId,
        updatedAt: serverTimestamp(),
      });
    } else {
      await deleteDoc(activeUserRef);
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getActiveUser = async (householdId: string, deviceId: string) => {
  try {
    const activeUserRef = doc(
      db,
      "households",
      householdId,
      "activeUsers",
      deviceId,
    );
    const activeUserDoc = await getDoc(activeUserRef);
    if (activeUserDoc.exists()) {
      return { success: true, userId: activeUserDoc.data().userId };
    } else {
      return { success: true, userId: null };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ====================================
// BACKUP & EXPORT
// ====================================

export const exportAllData = async (householdId: string) => {
  try {
    const data: any = {};

    // Get products
    const productsSnapshot = await getDocs(
      collection(db, "households", householdId, "products"),
    );
    data.products = productsSnapshot.docs.map((doc) => doc.data());

    // Get users
    const usersSnapshot = await getDocs(
      collection(db, "households", householdId, "users"),
    );
    data.users = usersSnapshot.docs.map((doc) => doc.data());

    // Get chores
    const choresSnapshot = await getDocs(
      collection(db, "households", householdId, "chores"),
    );
    data.chores = choresSnapshot.docs.map((doc) => doc.data());

    // Get consumption logs
    const logsSnapshot = await getDocs(
      collection(db, "households", householdId, "consumptionLogs"),
    );
    data.consumptionLogs = logsSnapshot.docs.map((doc) => doc.data());

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const importData = async (householdId: string, data: any) => {
  try {
    // Import products
    if (data.products) {
      for (const product of data.products) {
        await addProduct(householdId, product);
      }
    }

    // Import users
    if (data.users) {
      for (const user of data.users) {
        await addUser(householdId, user);
      }
    }

    // Import chores
    if (data.chores) {
      for (const chore of data.chores) {
        await addChore(householdId, chore);
      }
    }

    // Import consumption logs
    if (data.consumptionLogs) {
      for (const log of data.consumptionLogs) {
        await addConsumptionLog(householdId, log);
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
