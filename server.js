import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "dotenv";
import portfolioRoutes from "./src/routes/portfolioRoutes.js";
import { notFound, errorHandler } from "./src/middleware/errorHandler.js";

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

// API routes
app.get('/', (req, res) => {
  res.send('Hello World')
})

app.use("/api/portfolio", portfolioRoutes);

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
