import { Router } from "express";
import { householdController } from "./household.controller";

const router = Router();

// ========== HOUSEHOLDS ==========

// GET /api/household?userId=xxx - Get user's household with members
router.get(
  "/",
  householdController.getHouseholdByUserId.bind(householdController),
);

// GET /api/household/:id - Get household by ID
router.get(
  "/:id",
  householdController.getHouseholdById.bind(householdController),
);

// POST /api/household - Create new household
router.post("/", householdController.createHousehold.bind(householdController));

// PATCH /api/household/:id - Update household
router.patch(
  "/:id",
  householdController.updateHousehold.bind(householdController),
);

// DELETE /api/household/:id - Delete household
router.delete(
  "/:id",
  householdController.deleteHousehold.bind(householdController),
);

// ========== HOUSEHOLD MEMBERS ==========

// GET /api/household/:householdId/members - Get all members
router.get(
  "/:householdId/members",
  householdController.getMembers.bind(householdController),
);

// POST /api/household/join - Join existing household
router.post(
  "/join",
  householdController.joinHousehold.bind(householdController),
);

// DELETE /api/household/leave?userId=xxx&householdId=yyy - Leave household
router.delete(
  "/leave",
  householdController.leaveHousehold.bind(householdController),
);

// PATCH /api/household/member/:memberId - Update member
router.patch(
  "/member/:memberId",
  householdController.updateMember.bind(householdController),
);

// DELETE /api/household/member/:memberId - Remove member
router.delete(
  "/member/:memberId",
  householdController.removeMember.bind(householdController),
);

export default router;
