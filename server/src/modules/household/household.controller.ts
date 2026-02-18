import { Request, Response } from "express";
import { householdService } from "./household.service";
import { AppError } from "../../middleware/errorHandler";
import type {
  CreateHouseholdDTO,
  JoinHouseholdDTO,
  UpdateHouseholdDTO,
  UpdateMemberDTO,
} from "./household.types";

export class HouseholdController {
  // ========== HOUSEHOLDS ==========

  async getHouseholdByUserId(req: Request, res: Response): Promise<void> {
    const { userId } = req.query as { userId?: string };

    if (!userId) {
      throw new AppError("userId query parameter is required", 400);
    }

    const householdWithMembers = await householdService.getHouseholdByUserId({
      userId,
    });

    res.json(householdWithMembers);
  }

  async getHouseholdById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      throw new AppError("Household ID is required", 400);
    }

    const household = await householdService.getHouseholdById(id);
    res.json(household);
  }

  async createHousehold(req: Request, res: Response): Promise<void> {
    const householdData = req.body as CreateHouseholdDTO;

    if (
      !householdData.name ||
      !householdData.ownerUserId ||
      !householdData.ownerDisplayName
    ) {
      throw new AppError(
        "name, ownerUserId, and ownerDisplayName are required",
        400,
      );
    }

    const householdWithMembers =
      await householdService.createHousehold(householdData);

    res.status(201).json(householdWithMembers);
  }

  async updateHousehold(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updates = req.body as UpdateHouseholdDTO;

    if (!id) {
      throw new AppError("Household ID is required", 400);
    }

    if (!updates.name) {
      throw new AppError("At least one field to update is required", 400);
    }

    const household = await householdService.updateHousehold(id, updates);
    res.json(household);
  }

  async deleteHousehold(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      throw new AppError("Household ID is required", 400);
    }

    await householdService.deleteHousehold(id);
    res.status(204).send();
  }

  // ========== HOUSEHOLD MEMBERS ==========

  async getMembers(req: Request, res: Response): Promise<void> {
    const { householdId } = req.params;

    if (!householdId) {
      throw new AppError("householdId parameter is required", 400);
    }

    const members = await householdService.getMembers({ householdId });
    res.json(members);
  }

  async joinHousehold(req: Request, res: Response): Promise<void> {
    const joinData = req.body as JoinHouseholdDTO;

    if (!joinData.householdId || !joinData.userId || !joinData.displayName) {
      throw new AppError(
        "householdId, userId, and displayName are required",
        400,
      );
    }

    const member = await householdService.joinHousehold(joinData);
    res.status(201).json(member);
  }

  async updateMember(req: Request, res: Response): Promise<void> {
    const { memberId } = req.params;
    const updates = req.body as UpdateMemberDTO;

    if (!memberId) {
      throw new AppError("memberId parameter is required", 400);
    }

    if (!updates.displayName && !updates.avatar && !updates.color) {
      throw new AppError("At least one field to update is required", 400);
    }

    const member = await householdService.updateMember(memberId, updates);
    res.json(member);
  }

  async leaveHousehold(req: Request, res: Response): Promise<void> {
    const { userId, householdId } = req.query as {
      userId?: string;
      householdId?: string;
    };

    if (!userId || !householdId) {
      throw new AppError(
        "userId and householdId query parameters are required",
        400,
      );
    }

    await householdService.leavehousehold(userId, householdId);
    res.status(204).send();
  }

  async removeMember(req: Request, res: Response): Promise<void> {
    const { memberId } = req.params;

    if (!memberId) {
      throw new AppError("memberId parameter is required", 400);
    }

    await householdService.removeMember(memberId);
    res.status(204).send();
  }
}

export const householdController = new HouseholdController();
