import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("notification Service is running...");
});

const PORT = process.env.PORT || 8003;
app.listen(PORT, () => console.log(`notification Service running on port ${PORT}`));
