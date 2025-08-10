import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "dotenv";

config();
const app = express();

app.use(cors({
  origin: true, // Allow all origins temporarily
  credentials: true
}));

app.options("*", cors());
app.use(helmet());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Basic health check
app.get('/', (req, res) => {
  res.send("<h1>Welcome to online manager</h1>");
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', timestamp: new Date().toISOString() });
});

// Try to load portfolio routes with error handling
try {
  const { default: portfolioRoutes } = await import("./src/routes/portfolioRoutes.js");
  app.use("/api/portfolio", portfolioRoutes);
  console.log("Portfolio routes loaded successfully");
} catch (error) {
  console.error("Failed to load portfolio routes:", error.message);
  
  // Fallback routes
  app.get("/api/portfolio/health", (req, res) => {
    res.status(500).json({ 
      error: "Portfolio routes failed to load", 
      details: error.message 
    });
  });
}

// Load error handlers with fallback
try {
  const { notFound, errorHandler } = await import("./src/middleware/errorHandler.js");
  app.use(notFound);
  app.use(errorHandler);
} catch (error) {
  console.error("Failed to load error handlers:", error.message);
  
  // Fallback error handlers
  app.use((req, res) => {
    res.status(404).json({ error: "Not Found", path: req.originalUrl });
  });
  
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  });
}

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});