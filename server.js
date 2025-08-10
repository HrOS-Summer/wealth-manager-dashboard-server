import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Wealth Manager API Server', 
    status: 'running',
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working', 
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/portfolio/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'portfolio' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    path: req.originalUrl 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    details: err.message 
  });
});

// Export for Vercel
export default app;