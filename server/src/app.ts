import express, { Application } from "express";
import "express-async-errors"; // Must be imported before routes to catch async errors
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/logger";
import authRoutes from "./modules/auth/auth.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import choresRoutes from "./modules/chores/chores.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import householdRoutes from "./modules/household/household.routes";

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan("dev"));
app.use(requestLogger);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/chores", choresRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/household", householdRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
