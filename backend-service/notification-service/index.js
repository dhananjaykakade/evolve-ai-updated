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

// Routes
app.use('/', logsRoute);

// Start server
const PORT = process.env.PORT || 9020;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🟢 Notification Service running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Error connecting to the database:', err);
});
