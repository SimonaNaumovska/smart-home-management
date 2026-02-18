import { Request, Response, NextFunction } from "express";
import inventoryService from "./inventory.service";
import { AppError } from "../../middleware/errorHandler";
import type { GetProductsQuery } from "./inventory.types";

export class InventoryController {
  /**
   * GET /api/inventory
   * Get all products for a household
   */
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { householdId, category, toBuy, search, limit, offset } = req.query;

      if (!householdId) {
        throw new AppError("householdId is required", 400);
      }

      const query: GetProductsQuery = {
        householdId: householdId as string,
        category: category as string | undefined,
        toBuy: toBuy === "true" ? true : toBuy === "false" ? false : undefined,
        search: search as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };

      const products = await inventoryService.getProducts(query);

      res.status(200).json({
        status: "success",
        data: products,
        count: products.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/inventory/:id
   * Get a single product by ID
   */
  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { householdId } = req.query;

      if (!householdId) {
        throw new AppError("householdId is required", 400);
      }

      const product = await inventoryService.getProductById(
        id,
        householdId as string,
      );

      res.status(200).json({
        status: "success",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/inventory
   * Create a new product
   */
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const productData = req.body;

      if (!productData.householdId) {
        throw new AppError("householdId is required", 400);
      }

      if (!productData.name || !productData.category) {
        throw new AppError("name and category are required", 400);
      }

      const product = await inventoryService.createProduct(productData);

      res.status(201).json({
        status: "success",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/inventory/:id
   * Update an existing product
   */
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { householdId } = req.query;
      const updates = req.body;

      if (!householdId) {
        throw new AppError("householdId is required", 400);
      }

      const product = await inventoryService.updateProduct(
        id,
        householdId as string,
        updates,
      );

      res.status(200).json({
        status: "success",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/inventory/:id
   * Delete a product
   */
  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { householdId } = req.query;

      if (!householdId) {
        throw new AppError("householdId is required", 400);
      }

      await inventoryService.deleteProduct(id, householdId as string);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/inventory/:id/mark-to-buy
   * Mark product as to buy or not
   */
  async markToBuy(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { householdId } = req.query;
      const { toBuy } = req.body;

      if (!householdId) {
        throw new AppError("householdId is required", 400);
      }

      if (typeof toBuy !== "boolean") {
        throw new AppError("toBuy must be a boolean", 400);
      }

      const product = await inventoryService.markToBuy(
        id,
        householdId as string,
        toBuy,
      );

      res.status(200).json({
        status: "success",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/inventory/low-stock
   * Get products with low stock
   */
  async getLowStockProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { householdId } = req.query;

      if (!householdId) {
        throw new AppError("householdId is required", 400);
      }

      const products = await inventoryService.getLowStockProducts(
        householdId as string,
      );

      res.status(200).json({
        status: "success",
        data: products,
        count: products.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new InventoryController();
