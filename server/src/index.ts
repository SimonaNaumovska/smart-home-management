import dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config();

import app from "./app";

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("⚠️ SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("⚠️ SIGINT received. Shutting down gracefully...");
  process.exit(0);
});
