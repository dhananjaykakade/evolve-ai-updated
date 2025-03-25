import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("teacher Service is running...");
});

const PORT = process.env.PORT || 8005;
app.listen(PORT, () => console.log(`teacher Service running on port ${PORT}`));
