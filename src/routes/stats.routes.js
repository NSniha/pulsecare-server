import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import User from "../models/User.js";
import Funding from "../models/Funding.js";
import DonationRequest from "../models/DonationRequest.js";

const router = Router();

router.get("/stats", requireAuth, requireRole("admin", "volunteer"), async (req, res) => {
  const totalUsers = await User.countDocuments({ role: "donor" });
  const totalRequests = await DonationRequest.countDocuments({});
  const funds = await Funding.aggregate([
    { $group: { _id: null, sum: { $sum: "$amount" } } }
  ]);
  const totalFunds = funds?.[0]?.sum || 0;

  res.json({ totalUsers, totalFunds, totalRequests });
});

export default router;
