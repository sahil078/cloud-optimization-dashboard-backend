import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { pool } from "./db.js";
import resourceRoutes from "./routes/resources.js";
import recommendationRoutes from "./routes/recommendations.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type, Authorization"
}));
app.use(express.json());

// Add database connection middleware
app.use(async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    next();
  } catch (err) {
    console.error('Database connection failed:', err);
    res.status(503).json({
      error: "Database unavailable",
      details: err.message,
      solution: "Check database connection and credentials"
    });
  }
});

app.use("/resources", resourceRoutes);
app.use("/recommendations", recommendationRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    database: pool ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database URL: ${process.env.DATABASE_URL}`);
});