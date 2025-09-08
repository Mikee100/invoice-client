const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000', // Your backend server URL
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Remove /api prefix when forwarding to backend
      },
      onProxyReq: (proxyReq, req, res) => {
        // Add any custom headers here if needed
        if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
          // Don't modify content-type for form-data
          return;
        }
        
        // For other requests, set JSON content type
        if (!req.headers['content-type']) {
          proxyReq.setHeader('content-type', 'application/json');
        }
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy error', details: err.message });
      },
      logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
      secure: false, // Set to true in production with HTTPS
      cookieDomainRewrite: {
        '*': '', // Remove domain from cookies
      },
      // Handle WebSocket connections if needed
      ws: true,
      // Handle self-signed certificates in development
      ssl: {
        rejectUnauthorized: false,
      },
    })
  );
};
