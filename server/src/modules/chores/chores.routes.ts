import { Router } from "express";
import { choresController } from "./chores.controller";

const router = Router();

// ========== CHORE ROUTES ==========
router.get("/", choresController.getChores.bind(choresController));
router.get("/:id", choresController.getChoreById.bind(choresController));
router.post("/", choresController.createChore.bind(choresController));
router.patch("/:id", choresController.updateChore.bind(choresController));
router.delete("/:id", choresController.deleteChore.bind(choresController));

// ========== ROOM ROUTES ==========
router.get("/rooms/all", choresController.getRooms.bind(choresController));
router.get("/rooms/:id", choresController.getRoomById.bind(choresController));
router.post("/rooms", choresController.createRoom.bind(choresController));
router.delete("/rooms/:id", choresController.deleteRoom.bind(choresController));

// ========== CHORE CATEGORY ROUTES ==========
router.get(
  "/categories/all",
  choresController.getChoreCategories.bind(choresController),
);
router.get(
  "/categories/:id",
  choresController.getChoreCategoryById.bind(choresController),
);
router.post(
  "/categories",
  choresController.createChoreCategory.bind(choresController),
);
router.delete(
  "/categories/:id",
  choresController.deleteChoreCategory.bind(choresController),
);

export default router;
