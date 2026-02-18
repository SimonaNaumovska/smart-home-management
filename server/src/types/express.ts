import { Request } from "express";

// Extend Express Request type for future authentication
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    householdId: string;
    email: string;
  };
}
