import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

/**
 * POST /api/auth/signup - Create new account
 */
router.post("/signup", authController.signUp.bind(authController));

/**
 * POST /api/auth/signin - Sign in with email/password
 */
router.post("/signin", authController.signIn.bind(authController));

/**
 * POST /api/auth/signout - Sign out current user
 */
router.post("/signout", authController.signOut.bind(authController));

/**
 * GET /api/auth/session - Get current session
 */
router.get("/session", authController.getSession.bind(authController));

/**
 * POST /api/auth/refresh - Refresh session tokens
 */
router.post("/refresh", authController.refreshSession.bind(authController));

export default router;
