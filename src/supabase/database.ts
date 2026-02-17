import { supabase } from "./config";
import type {
  Product,
  User,
  ChoreDefinition,
  ConsumptionLog,
  Room,
  ChoreCategory,
} from "../types/Product";

// ====================================
// HELPER: Convert between camelCase (app) and snake_case (database)
// ====================================
const productToDb = (product: Product) => ({
  id: product.id,
  name: product.name,
  category: product.category,
  quantity: product.quantity,
  unit: product.unit,
  min_stock: product.minStock,
  purchased: product.purchased,
  use_by: product.useBy,
  storage: product.storage,
  to_buy: product.toBuy,
  frequently_used: product.frequentlyUsed,
});

const productFromDb = (db: any): Product => ({
  id: db.id,
  name: db.name,
  category: db.category,
  quantity: db.quantity,
  unit: db.unit,
  minStock: db.min_stock,
  purchased: db.purchased,
  useBy: db.use_by,
  storage: db.storage,
  toBuy: db.to_buy,
  frequentlyUsed: db.frequently_used,
});

const userToDb = (user: User) => ({
  id: user.id,
  name: user.name,
  color: user.color,
  avatar: user.avatar,
});

const userFromDb = (db: any): User => ({
  id: db.id,
  name: db.name,
  color: db.color,
  avatar: db.avatar,
});

const choreToDb = (chore: ChoreDefinition) => ({
  id: chore.id,
  name: chore.name,
  description: chore.room,
  frequency: String(chore.frequency),
  active: chore.active,
  assigned_to: chore.room,
  duedate: chore.nextDue,
  chore_category: chore.choreCategory,
  consumed_products: chore.consumedProducts,
});

const choreFromDb = (db: any): ChoreDefinition => ({
  id: db.id,
  name: db.name,
  room: db.assigned_to || "",
  choreCategory: db.chore_category || "",
  priority: "02 Normal",
  active: db.active ?? true,
  done: false,
  skipToday: false,
  lastDone: "",
  nextDue: db.duedate || "",
  frequency: parseInt(db.frequency) || 7,
  skipDays: 0,
  consumedProducts: db.consumed_products || [],
});

const logToDb = (log: ConsumptionLog) => ({
  id: log.id,
  user_id: log.userId,
  user_name: log.userName,
  product_id: log.productId,
  product_name: log.productName,
  amount: log.amount,
  unit: log.unit,
  type: log.type,
  chore_id: log.choreId,
  chore_name: log.choreName,
});

const logFromDb = (db: any): ConsumptionLog => ({
  id: db.id,
  userId: db.user_id,
  userName: db.user_name,
  productId: db.product_id,
  productName: db.product_name,
  amount: db.amount,
  unit: db.unit,
  type: db.type,
  choreId: db.chore_id,
  choreName: db.chore_name,
  timestamp: new Date(db.created_at).getTime(),
});

// ====================================
// PRODUCTS
// ====================================

export const syncProducts = (
  householdId: string,
  callback: (products: Product[]) => void,
) => {
  // Initial fetch
  supabase
    .from("products")
    .select("*")
    .eq("household_id", householdId)
    .then(({ data, error }) => {
      if (error) {
        console.error("Error fetching products:", error);
        return;
      }
      const products = (data || []).map(productFromDb);
      callback(products);
    });

  // Subscribe to real-time updates
  const subscription = supabase
    .channel(`products-${householdId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "products",
        filter: `household_id=eq.${householdId}`,
      },
      () => {
        // Refetch on any change
        supabase
          .from("products")
          .select("*")
          .eq("household_id", householdId)
          .then(({ data, error }) => {
            if (!error && data) {
              const products = data.map(productFromDb);
              callback(products);
            }
          });
      },
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};

export const addProduct = async (householdId: string, product: Product) => {
  try {
    const dbProduct = productToDb(product);
    const { error } = await supabase.from("products").insert([
      {
        ...dbProduct,
        household_id: householdId,
      },
    ]);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error adding product:", error);
    return { success: false, error: error.message };
  }
};

export const updateProduct = async (householdId: string, product: Product) => {
  try {
    const dbProduct = productToDb(product);
    const { error } = await supabase
      .from("products")
      .update({
        ...dbProduct,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id)
      .eq("household_id", householdId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error updating product:", error);
    return { success: false, error: error.message };
  }
};

export const deleteProduct = async (householdId: string, productId: string) => {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("household_id", householdId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting product:", error);
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
  // Initial fetch
  supabase
    .from("users")
    .select("*")
    .eq("household_id", householdId)
    .then(({ data, error }) => {
      if (error) {
        console.error("Error fetching users:", error);
        return;
      }
      const users = (data || []).map(userFromDb);
      callback(users);
    });

  // Subscribe to real-time updates
  const subscription = supabase
    .channel(`users-${householdId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "users",
        filter: `household_id=eq.${householdId}`,
      },
      () => {
        supabase
          .from("users")
          .select("*")
          .eq("household_id", householdId)
          .then(({ data, error }) => {
            if (!error && data) {
              const users = data.map(userFromDb);
              callback(users);
            }
          });
      },
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const addUser = async (householdId: string, user: User) => {
  try {
    const dbUser = userToDb(user);
    const { error } = await supabase.from("users").insert([
      {
        ...dbUser,
        household_id: householdId,
      },
    ]);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error adding user:", error);
    return { success: false, error: error.message };
  }
};

export const deleteUser = async (householdId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", userId)
      .eq("household_id", householdId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user:", error);
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
  // Initial fetch
  supabase
    .from("chores")
    .select("*")
    .eq("household_id", householdId)
    .then(({ data, error }) => {
      if (error) {
        console.error("Error fetching chores:", error);
        return;
      }
      const chores = (data || []).map(choreFromDb);
      callback(chores);
    });

  // Subscribe to real-time updates
  const subscription = supabase
    .channel(`chores-${householdId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chores",
        filter: `household_id=eq.${householdId}`,
      },
      () => {
        supabase
          .from("chores")
          .select("*")
          .eq("household_id", householdId)
          .then(({ data, error }) => {
            if (!error && data) {
              const chores = data.map(choreFromDb);
              callback(chores);
            }
          });
      },
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const addChore = async (householdId: string, chore: ChoreDefinition) => {
  try {
    const dbChore = choreToDb(chore);
    const { error } = await supabase.from("chores").insert([
      {
        ...dbChore,
        household_id: householdId,
      },
    ]);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error adding chore:", error);
    return { success: false, error: error.message };
  }
};

export const updateChore = async (
  householdId: string,
  chore: ChoreDefinition,
) => {
  try {
    const dbChore = choreToDb(chore);
    const { error } = await supabase
      .from("chores")
      .update({
        ...dbChore,
        updated_at: new Date().toISOString(),
      })
      .eq("id", chore.id)
      .eq("household_id", householdId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error updating chore:", error);
    return { success: false, error: error.message };
  }
};

export const deleteChore = async (householdId: string, choreId: string) => {
  try {
    const { error } = await supabase
      .from("chores")
      .delete()
      .eq("id", choreId)
      .eq("household_id", householdId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting chore:", error);
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
  // Initial fetch
  supabase
    .from("consumption_logs")
    .select("*")
    .eq("household_id", householdId)
    .then(({ data, error }) => {
      if (error) {
        console.error("Error fetching consumption logs:", error);
        return;
      }
      const logs = (data || []).map(logFromDb);
      callback(logs);
    });

  // Subscribe to real-time updates
  const subscription = supabase
    .channel(`consumption_logs-${householdId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "consumption_logs",
        filter: `household_id=eq.${householdId}`,
      },
      () => {
        supabase
          .from("consumption_logs")
          .select("*")
          .eq("household_id", householdId)
          .then(({ data, error }) => {
            if (!error && data) {
              const logs = data.map(logFromDb);
              callback(logs);
            }
          });
      },
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const addConsumptionLog = async (
  householdId: string,
  log: ConsumptionLog,
) => {
  try {
    const dbLog = logToDb(log);
    const { error } = await supabase.from("consumption_logs").insert([
      {
        ...dbLog,
        household_id: householdId,
      },
    ]);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error adding consumption log:", error);
    return { success: false, error: error.message };
  }
};

export const deleteOldConsumptionLogs = async (
  householdId: string,
  daysToKeep: number = 90,
) => {
  try {
    const cutoffDate = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    const { error } = await supabase
      .from("consumption_logs")
      .delete()
      .eq("household_id", householdId)
      .lt("timestamp", cutoffDate);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting old consumption logs:", error);
    return { success: false, error: error.message };
  }
};

export const deleteAllConsumptionLogs = async (householdId: string) => {
  try {
    const { error } = await supabase
      .from("consumption_logs")
      .delete()
      .eq("household_id", householdId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting all consumption logs:", error);
    return { success: false, error: error.message };
  }
};

// ====================================
// ROOMS
// ====================================

export const syncRooms = (
  householdId: string,
  callback: (rooms: Room[]) => void,
) => {
  supabase
    .from("rooms")
    .select("*")
    .eq("household_id", householdId)
    .then(({ data, error }) => {
      if (error) {
        console.error("Error fetching rooms:", error);
        return;
      }
      callback(data || []);
    });

  const subscription = supabase
    .channel(`rooms-${householdId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "rooms",
        filter: `household_id=eq.${householdId}`,
      },
      () => {
        supabase
          .from("rooms")
          .select("*")
          .eq("household_id", householdId)
          .then(({ data, error }) => {
            if (!error && data) {
              callback(data);
            }
          });
      },
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const addRoom = async (householdId: string, room: Room) => {
  try {
    const { error } = await supabase.from("rooms").insert([
      {
        ...room,
        household_id: householdId,
      },
    ]);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error adding room:", error);
    return { success: false, error: error.message };
  }
};

export const deleteRoom = async (householdId: string, roomId: string) => {
  try {
    const { error } = await supabase
      .from("rooms")
      .delete()
      .eq("id", roomId)
      .eq("household_id", householdId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting room:", error);
    return { success: false, error: error.message };
  }
};

// ====================================
// CHORE CATEGORIES
// ====================================

export const syncChoreCategories = (
  householdId: string,
  callback: (categories: ChoreCategory[]) => void,
) => {
  supabase
    .from("chore_categories")
    .select("*")
    .eq("household_id", householdId)
    .then(({ data, error }) => {
      if (error) {
        console.error("Error fetching chore categories:", error);
        return;
      }
      callback(data || []);
    });

  const subscription = supabase
    .channel(`chore_categories-${householdId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chore_categories",
        filter: `household_id=eq.${householdId}`,
      },
      () => {
        supabase
          .from("chore_categories")
          .select("*")
          .eq("household_id", householdId)
          .then(({ data, error }) => {
            if (!error && data) {
              callback(data);
            }
          });
      },
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const addChoreCategory = async (
  householdId: string,
  category: ChoreCategory,
) => {
  try {
    const { error } = await supabase.from("chore_categories").insert([
      {
        ...category,
        household_id: householdId,
      },
    ]);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error adding chore category:", error);
    return { success: false, error: error.message };
  }
};

export const deleteChoreCategory = async (
  householdId: string,
  categoryId: string,
) => {
  try {
    const { error } = await supabase
      .from("chore_categories")
      .delete()
      .eq("id", categoryId)
      .eq("household_id", householdId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting chore category:", error);
    return { success: false, error: error.message };
  }
};

// ====================================
// DATA EXPORT/IMPORT
// ====================================

export const exportAllData = async (householdId: string) => {
  try {
    const [productsRes, usersRes, choresRes, logsRes] = await Promise.all([
      supabase.from("products").select("*").eq("household_id", householdId),
      supabase.from("users").select("*").eq("household_id", householdId),
      supabase.from("chores").select("*").eq("household_id", householdId),
      supabase
        .from("consumption_logs")
        .select("*")
        .eq("household_id", householdId),
    ]);

    const data = {
      products: productsRes.data || [],
      users: usersRes.data || [],
      chores: choresRes.data || [],
      consumptionLogs: logsRes.data || [],
    };

    return { success: true, data };
  } catch (error: any) {
    console.error("Error exporting data:", error);
    return { success: false, error: error.message };
  }
};

export const importData = async (householdId: string, data: any) => {
  try {
    // Import products
    if (data.products?.length) {
      await supabase.from("products").insert(
        data.products.map((p: any) => ({
          ...p,
          household_id: householdId,
        })),
      );
    }

    // Import users
    if (data.users?.length) {
      await supabase.from("users").insert(
        data.users.map((u: any) => ({
          ...u,
          household_id: householdId,
        })),
      );
    }

    // Import chores
    if (data.chores?.length) {
      await supabase.from("chores").insert(
        data.chores.map((c: any) => ({
          ...c,
          household_id: householdId,
        })),
      );
    }

    // Import consumption logs
    if (data.consumptionLogs?.length) {
      await supabase.from("consumption_logs").insert(
        data.consumptionLogs.map((l: any) => ({
          ...l,
          household_id: householdId,
        })),
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error importing data:", error);
    return { success: false, error: error.message };
  }
};

// ====================================
// SHOPPING LIST
// ====================================

export const getShoppingList = async (
  householdId: string,
): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("household_id", householdId)
      .eq("to_buy", true);

    if (error) throw error;
    return (data || []).map(productFromDb);
  } catch (error: any) {
    console.error("Error fetching shopping list:", error);
    return [];
  }
};

export const markItemPurchased = async (
  householdId: string,
  productId: string,
  quantity: number,
  unit: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get current product data
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("household_id", householdId)
      .single();

    if (fetchError) throw fetchError;

    if (!product) {
      throw new Error("Product not found");
    }

    const currentProduct = productFromDb(product);

    // Validate unit matches
    if (currentProduct.unit !== unit) {
      console.warn(
        `Unit mismatch: expected ${currentProduct.unit}, got ${unit}. Using product's unit.`,
      );
    }

    // Update quantity (add to existing)
    const newQuantity = currentProduct.quantity + quantity;

    // Update product
    const updatedProduct: Product = {
      ...currentProduct,
      quantity: newQuantity,
      toBuy: false, // Remove from shopping list
    };

    const dbProduct = productToDb(updatedProduct);
    const { error: updateError } = await supabase
      .from("products")
      .update({
        ...dbProduct,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .eq("household_id", householdId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error: any) {
    console.error("Error marking item purchased:", error);
    return { success: false, error: error.message };
  }
};

export const toggleToBuyStatus = async (
  householdId: string,
  productId: string,
  toBuy: boolean,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("products")
      .update({
        to_buy: toBuy,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .eq("household_id", householdId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error toggling to_buy status:", error);
    return { success: false, error: error.message };
  }
};

// ====================================
// HOUSEHOLD MEMBERS
// ====================================

export interface HouseholdMemberDb {
  id: string;
  household_id: string;
  user_id: string;
  role: "owner" | "member";
  display_name: string | null;
  joined_at: string;
}

export const getHouseholdMembers = async (
  householdId: string,
): Promise<HouseholdMemberDb[]> => {
  try {
    const { data, error } = await supabase
      .from("household_members")
      .select("*")
      .eq("household_id", householdId);

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Error fetching household members:", error);
    return [];
  }
};

export const addHouseholdMember = async (
  householdId: string,
  userId: string,
  role: "owner" | "member",
  displayName: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from("household_members").insert({
      household_id: householdId,
      user_id: userId,
      role,
      display_name: displayName,
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error adding household member:", error);
    return { success: false, error: error.message };
  }
};

export const removeHouseholdMember = async (
  householdId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("household_members")
      .delete()
      .eq("household_id", householdId)
      .eq("user_id", userId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error removing household member:", error);
    return { success: false, error: error.message };
  }
};
