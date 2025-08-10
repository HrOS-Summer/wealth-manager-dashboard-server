import express from "express";
import cors from "cors";

const app = express();

// Essential middleware only
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// Simple routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Wealth Manager API Server', 
    status: 'running',
    timestamp: new Date().toISOString(),
    node_version: process.version
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working', 
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
});

app.get('/api/portfolio/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'portfolio',
    timestamp: new Date().toISOString()
  });
});

// Catch all 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Express Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Vercel serverless function export
export default function handler(req, res) {
  return app(req, res);
}