import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "dotenv"
import portfolioRoutes from "./routes/portfolioRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

config();

const app = express();

// Security and essentials
app.use(helmet());

const allowedOrigins = [
"https://wealth-manager-dashboard-client.vercel.app",
/.vercel.app$/, // any vercel preview/alias
"http://localhost:5173",
];

const corsOptions = {
origin(origin, cb) {
if (!origin) return cb(null, true); // SSR/health checks
if (
allowedOrigins.some((o) =>
typeof o === "string" ? o === origin : o.test(origin)
)
) {
return cb(null, true);
}
return cb(new Error(`CORS blocked for origin: ${origin}`));
},
credentials: false,
methods: ["GET", "HEAD", "OPTIONS"],
allowedHeaders: ["Content-Type", "Authorization"],
optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// API routes
app.use("/api/portfolio", portfolioRoutes);

// 404 and centralized error handler
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`Portfolio API running on port ${PORT}`);
});