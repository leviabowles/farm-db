const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
      '/api',
      createProxyMiddleware({
          // Backend service without additional path; rewrite to include the Django namespace.
          // When running inside Docker (as with docker-compose), use the service name 'web' to reach Django.
          // This works because both services share a Docker network. For external host access, the proxy is
          // not used – the React dev server runs on the host and forwards requests directly to localhost:8000.
          // In production (Docker) REACT_APP_API_URL points to the Django service (e.g., http://web:8000).
          // During local development the React container cannot resolve the Docker service name,
          // so we fall back to ``host.docker.internal`` which routes to the host machine where
          // Django is exposed on port 8000.
          target: process.env.REACT_APP_API_URL || 'http://host.docker.internal:8000',
          // Ensure the rewritten URL includes a trailing slash to match Django's patterns.
          pathRewrite: {
            '^/api': '/farms/api/'
          },
          // No path rewrite needed – REACT_APP_API_URL already includes the required prefix.
        // Preserve original Host header (localhost) for Django ALLOWED_HOSTS compatibility
        changeOrigin: false,
      })
    );
};