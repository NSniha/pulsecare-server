import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../lib/jwt.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, name, avatar, bloodGroup, district, upazila, password } = req.body || {};
  if (!email || !name || !avatar || !bloodGroup || !district || !upazila || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ message: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: email.toLowerCase(),
    name,
    avatar,
    bloodGroup,
    district,
    upazila,
    passwordHash,
    role: "donor",
    status: "active",
  });

  const token = signToken(user._id.toString());
  res.json({ token, user: safeUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user._id.toString());
  res.json({ token, user: safeUser(user) });
});

router.get("/me", requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

function safeUser(userDoc) {
  const u = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete u.passwordHash;
  return u;
}

export default router;
