const http = require('http');
const url = require('url');
const querystring = require('querystring');

// Azure App Service provides the PORT via environment variable
const PORT = process.env.PORT || 8080;

// Helper function to parse request body
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
    req.on('error', reject);
  });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Set CORS headers to allow cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  try {
    // Ping endpoint (GET request)
    if (path === '/' || path === '/ping') {
      res.setHeader('Content-Type', 'text/plain');
      res.writeHead(200);
      res.end('ping');
      return;
    }
    
    // Echo endpoint (POST request)
    if (path === '/echo' && req.method === 'POST') {
      const body = await parseRequestBody(req);
      const contentType = req.headers['content-type'] || '';
      
      let responseData = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        timestamp: new Date().toISOString(),
        body: body
      };
      
      // Try to parse JSON if content-type suggests it
      if (contentType.includes('application/json') && body) {
        try {
          responseData.parsedBody = JSON.parse(body);
        } catch (e) {
          responseData.parseError = 'Invalid JSON';
        }
      }
      
      // Parse form data if content-type suggests it
      if (contentType.includes('application/x-www-form-urlencoded') && body) {
        try {
          responseData.parsedBody = querystring.parse(body);
        } catch (e) {
          responseData.parseError = 'Invalid form data';
        }
      }
      
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(responseData, null, 2));
      return;
    }
    
    // 404 for unknown endpoints
    res.writeHead(404);
    res.end('Endpoint not found. Available endpoints: / (ping), /echo (POST)');
    
  } catch (error) {
    res.writeHead(500);
    res.end('Server error: ' + error.message);
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Send any HTTP request to get a "ping" response');
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});
