// If Express still fails, use this structure instead:

// Create: api/index.js (for root route)
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.json({ 
    message: 'Wealth Manager API Server', 
    status: 'running',
    timestamp: new Date().toISOString()
  });
}

// Create: api/test.js
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.json({ 
    message: 'API is working', 
    timestamp: new Date().toISOString()
  });
}

// Create: api/portfolio/health.js
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.json({ 
    status: 'ok',
    service: 'portfolio'
  });
}