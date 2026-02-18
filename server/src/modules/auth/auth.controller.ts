import { Request, Response } from "express";
import { authService } from "./auth.service";
import { AppError } from "../../middleware/errorHandler";
import type { SignUpDTO, SignInDTO } from "./auth.types";

class AuthController {
  /**
   * POST /api/auth/signup
   */
  async signUp(req: Request, res: Response): Promise<void> {
    const dto = req.body as SignUpDTO;

    if (!dto.email || !dto.password) {
      throw new AppError("Email and password are required", 400);
    }

    const result = await authService.signUp(dto);
    res.status(201).json(result);
  }

  /**
   * POST /api/auth/signin
   */
  async signIn(req: Request, res: Response): Promise<void> {
    const dto = req.body as SignInDTO;

    if (!dto.email || !dto.password) {
      throw new AppError("Email and password are required", 400);
    }

    const result = await authService.signIn(dto);
    res.json(result);
  }

  /**
   * POST /api/auth/signout
   */
  async signOut(req: Request, res: Response): Promise<void> {
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      throw new AppError("Access token required", 401);
    }

    await authService.signOut(accessToken);
    res.status(204).send();
  }

  /**
   * GET /api/auth/session
   */
  async getSession(req: Request, res: Response): Promise<void> {
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      res.json({ user: null });
      return;
    }

    const result = await authService.getSession(accessToken);
    res.json(result);
  }

  /**
   * POST /api/auth/refresh
   */
  async refreshSession(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError("Refresh token required", 400);
    }

    const result = await authService.refreshSession(refreshToken);
    res.json(result);
  }
}

export const authController = new AuthController();
