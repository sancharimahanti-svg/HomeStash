require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const itemRoutes = require("./routes/itemRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// CORS - allow frontend to talk to backend
app.use(cors({
  origin: ["http://localhost:3000", "https://home-stash-one.vercel.app/"],
  credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running successfully!");
});

app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});