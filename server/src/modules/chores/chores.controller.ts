import { Request, Response, NextFunction } from "express";
import { choresService } from "./chores.service";
import { AppError } from "../../middleware/errorHandler";
import type {
  GetChoresQuery,
  GetRoomsQuery,
  GetCategoriesQuery,
  CreateChoreDTO,
  UpdateChoreDTO,
  CreateRoomDTO,
  CreateChoreCategoryDTO,
} from "./chores.types";

export class ChoresController {
  // ========== CHORES ==========

  async getChores(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const query: GetChoresQuery = {
        householdId: req.query.householdId as string,
        room: req.query.room as string | undefined,
        choreCategory: req.query.choreCategory as string | undefined,
        active:
          req.query.active !== undefined
            ? req.query.active === "true"
            : undefined,
        priority: req.query.priority as string | undefined,
      };

      if (!query.householdId) {
        throw new AppError("householdId is required", 400);
      }

      const chores = await choresService.getChores(query);

      res.json({
        status: "success",
        data: chores,
        count: chores.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async getChoreById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const householdId = req.query.householdId as string;

      if (!householdId) {
        throw new AppError("householdId is required", 400);
      }

      const chore = await choresService.getChoreById(id, householdId);

      res.json({
        status: "success",
        data: chore,
      });
    } catch (error) {
      next(error);
    }
  }

  async createChore(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const choreData: CreateChoreDTO = req.body;

      if (!choreData.householdId) {
        throw new AppError("householdId is required", 400);
      }

      if (!choreData.name || !choreData.room) {
        throw new AppError("name and room are required", 400);
      }

      const chore = await choresService.createChore(choreData);

      res.status(201).json({
        status: "success",
        data: chore,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateChore(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updates: UpdateChoreDTO = req.body;

      if (!updates.householdId) {
        throw new AppError("householdId is required", 400);
      }

      const chore = await choresService.updateChore(id, updates);

      res.json({
        status: "success",
        data: chore,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteChore(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const householdId = req.query.householdId as string;

      if (!householdId) {
        throw new AppError("householdId is required", 400);
      }

      await choresService.deleteChore(id, householdId);

      res.json({
        status: "success",
        message: "Chore deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // ========== ROOMS ==========

  async getRooms(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const query: GetRoomsQuery = {
        householdId: req.query.householdId as string,
      };

      if (!query.householdId) {
        throw new AppError("householdId is required", 400);
      }

      const rooms = await choresService.getRooms(query);

      res.json({
        status: "success",
        data: rooms,
        count: rooms.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRoomById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const householdId = req.query.householdId as string;

      if (!householdId) {
        throw new AppError("householdId is required", 400);
      }

      const room = await choresService.getRoomById(id, householdId);

      res.json({
        status: "success",
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  async createRoom(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const roomData: CreateRoomDTO = req.body;

      if (!roomData.householdId) {
        throw new AppError("householdId is required", 400);
      }

      if (!roomData.name) {
        throw new AppError("name is required", 400);
      }

      const room = await choresService.createRoom(roomData);

      res.status(201).json({
        status: "success",
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRoom(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const householdId = req.query.householdId as string;

      if (!householdId) {
        throw new AppError("householdId is required", 400);
      }

      await choresService.deleteRoom(id, householdId);

      res.json({
        status: "success",
        message: "Room deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // ========== CHORE CATEGORIES ==========

  async getChoreCategories(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const query: GetCategoriesQuery = {
        householdId: req.query.householdId as string,
      };

      if (!query.householdId) {
        throw new AppError("householdId is required", 400);
      }

      const categories = await choresService.getChoreCategories(query);

      res.json({
        status: "success",
        data: categories,
        count: categories.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async getChoreCategoryById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const householdId = req.query.householdId as string;

      if (!householdId) {
        throw new AppError("householdId is required", 400);
      }

      const category = await choresService.getChoreCategoryById(
        id,
        householdId,
      );

      res.json({
        status: "success",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async createChoreCategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const categoryData: CreateChoreCategoryDTO = req.body;

      if (!categoryData.householdId) {
        throw new AppError("householdId is required", 400);
      }

      if (!categoryData.name || categoryData.frequencyDays === undefined) {
        throw new AppError("name and frequencyDays are required", 400);
      }

      const category = await choresService.createChoreCategory(categoryData);

      res.status(201).json({
        status: "success",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteChoreCategory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const householdId = req.query.householdId as string;

      if (!householdId) {
        throw new AppError("householdId is required", 400);
      }

      await choresService.deleteChoreCategory(id, householdId);

      res.json({
        status: "success",
        message: "Chore category deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const choresController = new ChoresController();
