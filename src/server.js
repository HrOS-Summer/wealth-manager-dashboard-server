import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "dotenv";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

config();

const app = express();

// CORS first — allow all for demo
app.use(
  cors({
    origin: "https://wealth-manager-dashboard-client.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
    
  })
);

// Handle preflight requests for all routes
app.options("*", cors());

// Security and essentials
app.use(helmet());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// API routes
app.use("/api/portfolio", portfolioRoutes);

// 404 and centralized error handler
app.use(notFound);
app.use(errorHandler);

export default app;

