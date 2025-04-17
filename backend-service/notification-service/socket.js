import { WebSocketServer } from 'ws';
import Log from './models/logs.js'; // Your Mongoose model
import mongoose from 'mongoose';

let wss;

export const initWebSocket = (server) => {
  wss = new WebSocketServer({ server });
  console.log('🚀 WebSocket server running...');

  wss.on('connection', (ws) => {
    console.log('📡 Client connected to WebSocket');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        const { studentId, testId, message: logMessage, studentName } = data;

        if (!studentId || !testId || !logMessage) {
          return ws.send(JSON.stringify({ error: 'Missing required fields.' }));
        }

        // Save log to DB
        const log = await Log.create({
          studentId,
          studentName,
          testId: new mongoose.Types.ObjectId(testId),
          message: logMessage,
          timestamp: new Date(),
        });

        // Broadcast to ALL clients (or just teachers if logic is added)
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === client.OPEN) {
            client.send(JSON.stringify({ type: 'log', data: log }));
          }
        });

        // Optionally, acknowledge the sender
        ws.send(JSON.stringify({ type: 'ack', message: 'Log saved.' }));
      } catch (err) {
        console.error('❌ Error handling message:', err.message);
        ws.send(JSON.stringify({ error: 'Invalid message format or server error.' }));
      }
    });

    ws.on('close', () => {
      console.log('❌ Client disconnected');
    });
  });
};
