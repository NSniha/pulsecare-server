import { Router } from "express";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

// Public donor search
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  const { status } = req.query;
  const q = {};
  if (status) q.status = status;
  const users = await User.find(q).select("-passwordHash").sort({ createdAt: -1 });
  res.json({ users });
});

// Update own profile (email not editable)
router.patch("/me", requireAuth, async (req, res) => {
  const allowed = ["name", "avatar", "bloodGroup", "district", "upazila"];
  const updates = {};
  for (const k of allowed) if (req.body?.[k] !== undefined) updates[k] = req.body[k];

  const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-passwordHash");
  res.json({ user: updated });
});

// Admin: block/unblock user
router.patch("/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  const { status } = req.body || {};
  if (!["active", "blocked"].includes(status)) return res.status(400).json({ message: "Invalid status" });

  const updated = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select("-passwordHash");
  if (!updated) return res.status(404).json({ message: "User not found" });

  res.json({ user: updated });
});

// Admin: role update
router.patch("/:id/role", requireAuth, requireRole("admin"), async (req, res) => {
  const { role } = req.body || {};
  if (!["donor", "volunteer", "admin"].includes(role)) return res.status(400).json({ message: "Invalid role" });

  const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-passwordHash");
  if (!updated) return res.status(404).json({ message: "User not found" });

  res.json({ user: updated });
});

// Public endpoint for donor search (does NOT require login)
router.get("/public/search", async (req, res) => {
  const { bloodGroup, district, upazila } = req.query;
  const q = { role: "donor", status: "active" };
  if (bloodGroup) q.bloodGroup = bloodGroup;
  if (district) q.district = district;
  if (upazila) q.upazila = upazila;

  const donors = await User.find(q).select("name email avatar bloodGroup district upazila role status");
  res.json({ donors });
});

export default router;
