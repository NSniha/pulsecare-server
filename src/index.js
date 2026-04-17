import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import donorRoutes from "./routes/donor.routes.js";
import requestRoutes from "./routes/request.routes.js";
import fundingRoutes from "./routes/funding.routes.js";
import statsRoutes from "./routes/stats.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

app.get("/", (req, res) => {
  res.json({ ok: true, name: "PulseCare API", time: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/donors", donorRoutes);
app.use("/requests", requestRoutes);
app.use("/", fundingRoutes);
app.use("/", statsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ message: err.message || "Server error" });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`PulseCare API running on port ${PORT}`));
  })
  .catch((e) => {
    console.error("DB connection failed:", e);
    process.exit(1);
  });
