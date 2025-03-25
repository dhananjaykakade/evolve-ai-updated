import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("student Service is running...");
});

const PORT = process.env.PORT || 8090;
app.listen(PORT, () => console.log(`student Service running on port ${PORT}`));
