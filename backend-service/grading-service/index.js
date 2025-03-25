import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("grading Service is running...");
});

const PORT = process.env.PORT || 8002;
app.listen(PORT, () => console.log(`grading Service running on port ${PORT}`));
