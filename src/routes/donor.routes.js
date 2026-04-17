import { Router } from "express";
import User from "../models/User.js";

const router = Router();

// Public donor search
router.get("/", async (req, res) => {
  const { bloodGroup, district, upazila } = req.query;
  const q = { role: "donor", status: "active" };
  if (bloodGroup) q.bloodGroup = bloodGroup;
  if (district) q.district = district;
  if (upazila) q.upazila = upazila;

  const donors = await User.find(q).select("name email avatar bloodGroup district upazila");
  res.json({ donors });
});

export default router;
