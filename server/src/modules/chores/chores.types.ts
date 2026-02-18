// Chores Module Types

export interface ChoreDefinition {
  id: string;
  name: string;
  room: string;
  choreCategory: string;
  priority: "01 High" | "02 Normal" | "03 Low";
  active: boolean;
  done: boolean;
  skipToday: boolean;
  lastDone: string; // date
  nextDue: string; // date
  frequency: number; // days
  skipDays: number;
  consumedProducts: {
    productName: string;
    defaultAmount: number;
    unit: string;
  }[];
  householdId?: string;
}

export interface Room {
  id: string;
  name: string;
  icon: string; // emoji
  order: number;
  householdId?: string;
}

export interface ChoreCategory {
  id: string;
  name: string;
  icon: string; // emoji
  frequencyDays: number;
  order: number;
  householdId?: string;
}

// DTOs
export interface CreateChoreDTO extends Omit<ChoreDefinition, "id"> {
  householdId: string;
}

export interface UpdateChoreDTO extends Partial<Omit<ChoreDefinition, "id">> {
  householdId: string;
}

export interface CreateRoomDTO extends Omit<Room, "id"> {
  householdId: string;
}

export interface CreateChoreCategoryDTO extends Omit<ChoreCategory, "id"> {
  householdId: string;
}

// Query params
export interface GetChoresQuery {
  householdId: string;
  room?: string;
  choreCategory?: string;
  active?: boolean;
  priority?: string;
}

export interface GetRoomsQuery {
  householdId: string;
}

export interface GetCategoriesQuery {
  householdId: string;
}
