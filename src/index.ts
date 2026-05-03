import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import apiRouter from "./routes";
import { connectDB } from "./config/database";
import db from "./models";

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "5000", 10);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api", apiRouter);

// Health check
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "CrossCheck API is running 🚀",
  });
});

// Start server
const startServer = async () => {
  await connectDB();

  // Sync models (use { alter: true } in development only)
  if (process.env.NODE_ENV === "development") {
    await db.sequelize.sync({ alter: true });
    console.log("📦 Database synced");
  }

  app.listen(PORT, () => {
    console.log(`⚡ Server is running on http://localhost:${PORT}`);
  });
};

startServer();

export default app;
