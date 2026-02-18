import { Router } from "express";
import inventoryController from "./inventory.controller";

const router = Router();

// GET /api/inventory/low-stock - Must be before /:id route
router.get("/low-stock", (req, res, next) =>
  inventoryController.getLowStockProducts(req, res, next),
);

// GET /api/inventory
router.get("/", (req, res, next) =>
  inventoryController.getProducts(req, res, next),
);

// GET /api/inventory/:id
router.get("/:id", (req, res, next) =>
  inventoryController.getProductById(req, res, next),
);

// POST /api/inventory
router.post("/", (req, res, next) =>
  inventoryController.createProduct(req, res, next),
);

// PATCH /api/inventory/:id
router.patch("/:id", (req, res, next) =>
  inventoryController.updateProduct(req, res, next),
);

// DELETE /api/inventory/:id
router.delete("/:id", (req, res, next) =>
  inventoryController.deleteProduct(req, res, next),
);

// PATCH /api/inventory/:id/mark-to-buy
router.patch("/:id/mark-to-buy", (req, res, next) =>
  inventoryController.markToBuy(req, res, next),
);

export default router;
