import { Request, Response, NextFunction } from "express";
import { dashboardService } from "./dashboard.service";
import { AppError } from "../../middleware/errorHandler";
import type {
  GetConsumptionLogsQuery,
  GetUsersQuery,
  CreateConsumptionLogDTO,
  CreateUserDTO,
  UpdateUserDTO,
} from "./dashboard.types";

export class DashboardController {
  // ========== CONSUMPTION LOGS ==========

  async getConsumptionLogs(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const query: GetConsumptionLogsQuery = {
        householdId: req.query.householdId as string,
        userId: req.query.userId as string | undefined,
        productId: req.query.productId as string | undefined,
        type: req.query.type as "food" | "chore" | undefined,
        startDate: req.query.startDate
          ? parseInt(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? parseInt(req.query.endDate as string)
          : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
      };

      if (!query.householdId) {
        throw new AppError("householdId is required", 400);
      }

      const logs = await dashboardService.getConsumptionLogs(query);

      res.json({
        status: "success",
        data: logs,
        count: logs.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async getConsumptionLogById(
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

      const log = await dashboardService.getConsumptionLogById(id, householdId);

      res.json({
        status: "success",
        data: log,
      });
    } catch (error) {
      next(error);
    }
  }

  async createConsumptionLog(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const logData: CreateConsumptionLogDTO = req.body;

      if (!logData.householdId) {
        throw new AppError("householdId is required", 400);
      }

      if (
        !logData.userId ||
        !logData.productId ||
        !logData.productName ||
        !logData.type
      ) {
        throw new AppError(
          "userId, productId, productName, and type are required",
          400,
        );
      }

      const log = await dashboardService.createConsumptionLog(logData);

      res.status(201).json({
        status: "success",
        data: log,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteConsumptionLog(
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

      await dashboardService.deleteConsumptionLog(id, householdId);

      res.json({
        status: "success",
        message: "Consumption log deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteOldConsumptionLogs(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const householdId = req.query.householdId as string;
      const daysToKeep = req.query.daysToKeep
        ? parseInt(req.query.daysToKeep as string)
        : 90;

      if (!householdId) {
        throw new AppError("householdId is required", 400);
      }

      await dashboardService.deleteOldConsumptionLogs(householdId, daysToKeep);

      res.json({
        status: "success",
        message: `Deleted logs older than ${daysToKeep} days`,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAllConsumptionLogs(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const householdId = req.query.householdId as string;

      if (!householdId) {
        throw new AppError("householdId is required", 400);
      }

      await dashboardService.deleteAllConsumptionLogs(householdId);

      res.json({
        status: "success",
        message: "All consumption logs deleted",
      });
    } catch (error) {
      next(error);
    }
  }

  // ========== USERS ==========

  async getUsers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const query: GetUsersQuery = {
        householdId: req.query.householdId as string,
      };

      if (!query.householdId) {
        throw new AppError("householdId is required", 400);
      }

      const users = await dashboardService.getUsers(query);

      res.json({
        status: "success",
        data: users,
        count: users.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(
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

      const user = await dashboardService.getUserById(id, householdId);

      res.json({
        status: "success",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userData: CreateUserDTO = req.body;

      if (!userData.householdId) {
        throw new AppError("householdId is required", 400);
      }

      if (!userData.name) {
        throw new AppError("name is required", 400);
      }

      const user = await dashboardService.createUser(userData);

      res.status(201).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updates: UpdateUserDTO = req.body;

      if (!updates.householdId) {
        throw new AppError("householdId is required", 400);
      }

      const user = await dashboardService.updateUser(id, updates);

      res.json({
        status: "success",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(
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

      await dashboardService.deleteUser(id, householdId);

      res.json({
        status: "success",
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
