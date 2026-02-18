import { Router } from "express";
import { dashboardController } from "./dashboard.controller";

const router = Router();

// ========== CONSUMPTION LOG ROUTES ==========
router.get(
  "/consumption-logs",
  dashboardController.getConsumptionLogs.bind(dashboardController),
);
router.get(
  "/consumption-logs/:id",
  dashboardController.getConsumptionLogById.bind(dashboardController),
);
router.post(
  "/consumption-logs",
  dashboardController.createConsumptionLog.bind(dashboardController),
);
router.delete(
  "/consumption-logs/:id",
  dashboardController.deleteConsumptionLog.bind(dashboardController),
);
router.delete(
  "/consumption-logs/old/cleanup",
  dashboardController.deleteOldConsumptionLogs.bind(dashboardController),
);
router.delete(
  "/consumption-logs/all/clear",
  dashboardController.deleteAllConsumptionLogs.bind(dashboardController),
);

// ========== USER ROUTES ==========
router.get("/users", dashboardController.getUsers.bind(dashboardController));
router.get(
  "/users/:id",
  dashboardController.getUserById.bind(dashboardController),
);
router.post("/users", dashboardController.createUser.bind(dashboardController));
router.patch(
  "/users/:id",
  dashboardController.updateUser.bind(dashboardController),
);
router.delete(
  "/users/:id",
  dashboardController.deleteUser.bind(dashboardController),
);

export default router;
