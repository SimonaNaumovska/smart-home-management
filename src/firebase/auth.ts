import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { auth, db } from "./config";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Register new household
export const registerHousehold = async (
  email: string,
  password: string,
  householdName: string,
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Update profile
    await updateProfile(user, {
      displayName: householdName,
    });

    // Create household document in Firestore
    await setDoc(doc(db, "households", user.uid), {
      name: householdName,
      email: email,
      createdAt: new Date().toISOString(),
      members: [],
      settings: {
        theme: "light",
        notifications: true,
      },
    });

    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Sign in to household
export const signInHousehold = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Sign out
export const signOutHousehold = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Listen to auth state changes
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get household data
export const getHouseholdData = async (userId: string) => {
  try {
    const householdDoc = await getDoc(doc(db, "households", userId));
    if (householdDoc.exists()) {
      return { success: true, data: householdDoc.data() };
    } else {
      return { success: false, error: "Household not found" };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if household document exists, create if not
    const householdDoc = await getDoc(doc(db, "households", user.uid));
    if (!householdDoc.exists()) {
      await setDoc(doc(db, "households", user.uid), {
        name: user.displayName || "My Household",
        email: user.email,
        createdAt: new Date().toISOString(),
        members: [],
        settings: {
          theme: "light",
          notifications: true,
        },
      });
    }

    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
