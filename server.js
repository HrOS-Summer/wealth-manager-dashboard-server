// Minimal server for Vercel testing
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Basic routing
  const { url, method } = req;
  
  if (url === '/' && method === 'GET') {
    return res.json({ 
      message: 'Wealth Manager API Server', 
      status: 'running',
      timestamp: new Date().toISOString() 
    });
  }
  
  if (url === '/api/test' && method === 'GET') {
    return res.json({ 
      message: 'API is working', 
      timestamp: new Date().toISOString() 
    });
  }
  
  if (url === '/api/portfolio/health' && method === 'GET') {
    return res.json({ 
      status: 'ok',
      service: 'portfolio',
      timestamp: new Date().toISOString() 
    });
  }
  
  // 404 for all other routes
  res.status(404).json({ 
    error: 'Not Found', 
    path: url,
    method: method 
  });
}