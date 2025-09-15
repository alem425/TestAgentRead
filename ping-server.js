const http = require('http');

// Azure App Service provides the PORT via environment variable
const PORT = process.env.PORT || 8080;

// Create HTTP server
const server = http.createServer((req, res) => {
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
  
  // Set response headers
  res.setHeader('Content-Type', 'text/plain');
  res.writeHead(200);
  
  // Send "ping" response
  res.end('ping');
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
