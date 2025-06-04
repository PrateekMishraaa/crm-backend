import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import UserRoutes from "./routes/User.js";
import User from "./models/User.js"; // for syncing indexes

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Routes
app.use("/api", UserRoutes);

// ✅ Connect to MongoDB and sync indexes
mongoose.connect(process.env.MONGOURI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
})
  .then(async () => {
    console.log("Connected to MongoDB");
    await User.syncIndexes(); // ensures proper indexes on lowercase `email`
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB:", err.message);
  });

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Hello World from the server!");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
