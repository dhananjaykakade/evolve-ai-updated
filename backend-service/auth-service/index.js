import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Auth Service is running...");
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
