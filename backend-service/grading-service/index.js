import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("grading Service is running...");
});

// Health and readiness endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/ready', async (req, res) => {
  // Optionally verify any external dependencies here
  res.status(200).json({ ready: true });
});

const PORT = process.env.PORT || 9006;
const server = app.listen(PORT, () => console.log(`grading Service running on port ${PORT}`));

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down Grading Service...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
