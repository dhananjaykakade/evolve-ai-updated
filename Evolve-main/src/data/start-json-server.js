// package.json should include: "type": "module"

import jsonServer from 'json-server';

const server = jsonServer.create();
const router = jsonServer.router('./src/data/db.json');
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, CORS)
server.use(middlewares);

// Add body parser middleware
server.use(jsonServer.bodyParser);

// Simulate network latency
server.use((req, res, next) => {
  setTimeout(next, 300);
});

// Use router
server.use(router);

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
  console.log(`Access it at http://localhost:${PORT}`);
});
