import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import logsRoute from './routes/logs.js';
import { initWebSocket } from './socket.js';
import WebSocket from 'ws'; // Ensure WebSocket is correctly imported

dotenv.config();

const app = express();
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With","X-Session-ID","x-session-id"],
    credentials: true,
    exposedHeaders: ["Content-Type", "Authorization", "X-Request-Id","X-Session-ID","x-session-id"],
  })
);
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket after the server is created
initWebSocket(server);

// Health and readiness endpoints (MUST come before other routes)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/ready', async (req, res) => {
  // Optionally verify DB connectivity or WebSocket state
  res.status(200).json({ ready: true });
});

// Routes
app.use('/', logsRoute);

// Start server
const PORT = process.env.PORT || 9020;
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🟢 Notification Service running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error connecting to the database:', err);
  });

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down Notification Service...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
