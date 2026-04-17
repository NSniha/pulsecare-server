import { Router } from "express";
import DonationRequest from "../models/DonationRequest.js";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

// Public: pending requests list
router.get("/pending", async (req, res) => {
  const requests = await DonationRequest.find({ status: "pending" }).sort({ createdAt: -1 });
  res.json({ requests });
});

// Create request (donor only, active only)
router.post("/", requireAuth, requireRole("donor"), async (req, res) => {
  const me = await User.findById(req.user._id);
  if (!me) return res.status(401).json({ message: "Unauthorized" });
  if (me.status === "blocked") return res.status(403).json({ message: "Blocked users cannot create donation requests" });

  const {
    requesterName, requesterEmail,
    recipientName, recipientDistrict, recipientUpazila,
    hospitalName, addressLine,
    bloodGroup, donationDate, donationTime,
    requestMessage
  } = req.body || {};

  if (!requesterName || !requesterEmail || !recipientName || !recipientDistrict || !recipientUpazila || !hospitalName || !addressLine || !bloodGroup || !donationDate || !donationTime || !requestMessage) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const doc = await DonationRequest.create({
    requesterName,
    requesterEmail,
    recipientName,
    recipientDistrict,
    recipientUpazila,
    hospitalName,
    addressLine,
    bloodGroup,
    donationDate,
    donationTime,
    requestMessage,
    status: "pending",
  });

  res.status(201).json({ request: doc });
});

// Get my requests (donor only)
router.get("/my", requireAuth, requireRole("donor"), async (req, res) => {
  const { status = "", page = 1, limit = 10 } = req.query;
  const q = { requesterEmail: req.user.email };
  if (status) q.status = status;

  const nLimit = Math.min(50, Number(limit) || 10);
  const nPage = Math.max(1, Number(page) || 1);

  const requests = await DonationRequest.find(q)
    .sort({ createdAt: -1 })
    .skip((nPage - 1) * nLimit)
    .limit(nLimit);

  res.json({ requests });
});

// Admin/Volunteer: get all requests
router.get("/", requireAuth, requireRole("admin", "volunteer"), async (req, res) => {
  const { status = "", page = 1, limit = 10 } = req.query;
  const q = {};
  if (status) q.status = status;

  const nLimit = Math.min(50, Number(limit) || 10);
  const nPage = Math.max(1, Number(page) || 1);

  const requests = await DonationRequest.find(q)
    .sort({ createdAt: -1 })
    .skip((nPage - 1) * nLimit)
    .limit(nLimit);

  res.json({ requests });
});

// Details (private)
router.get("/:id", requireAuth, async (req, res) => {
  const doc = await DonationRequest.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Request not found" });
  res.json({ request: doc });
});

// Donate (private): pending -> inprogress with donor info
router.post("/:id/donate", requireAuth, async (req, res) => {
  const doc = await DonationRequest.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Request not found" });
  if (doc.status !== "pending") return res.status(400).json({ message: "Only pending requests can be taken" });

  doc.status = "inprogress";
  doc.donorName = req.user.name;
  doc.donorEmail = req.user.email;
  await doc.save();

  res.json({ request: doc });
});

// Update status
router.patch("/:id/status", requireAuth, async (req, res) => {
  const { status } = req.body || {};
  if (!["pending","inprogress","done","canceled"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const doc = await DonationRequest.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Request not found" });

  // volunteer can only update status
  if (req.user.role === "volunteer") {
    doc.status = status;
    await doc.save();
    return res.json({ request: doc });
  }

  // donor can update status only for own requests and only inprogress -> done/canceled
  if (req.user.role === "donor") {
    if (doc.requesterEmail !== req.user.email) return res.status(403).json({ message: "Forbidden" });

    if (doc.status === "inprogress" && (status === "done" || status === "canceled")) {
      doc.status = status;
      await doc.save();
      return res.json({ request: doc });
    }
    return res.status(400).json({ message: "Donor can only mark done/canceled from inprogress" });
  }

  // admin can set any status
  if (req.user.role === "admin") {
    doc.status = status;
    await doc.save();
    return res.json({ request: doc });
  }

  return res.status(403).json({ message: "Forbidden" });
});

// Delete request (donor own or admin)
router.delete("/:id", requireAuth, async (req, res) => {
  const doc = await DonationRequest.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "Request not found" });

  if (req.user.role === "admin" || (req.user.role === "donor" && doc.requesterEmail === req.user.email)) {
    await doc.deleteOne();
    return res.json({ ok: true });
  }
  return res.status(403).json({ message: "Forbidden" });
});

export default router;
