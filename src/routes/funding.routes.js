import { Router } from "express";
import Stripe from "stripe";
import Funding from "../models/Funding.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeKey ? new Stripe(stripeKey) : null;

// List all fundings (private)
router.get("/fundings", requireAuth, async (req, res) => {
  const fundings = await Funding.find({}).sort({ createdAt: -1 });
  res.json({ fundings });
});

// Create payment intent (private)
router.post("/create-payment-intent", requireAuth, async (req, res) => {
  const { amount } = req.body || {};
  const n = Number(amount);
  if (!n || n <= 0) return res.status(400).json({ message: "Invalid amount" });
  if (!stripe) return res.status(500).json({ message: "Stripe is not configured (missing STRIPE_SECRET_KEY)" });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(n * 100),
    currency: "usd",
    automatic_payment_methods: { enabled: true },
  });

  res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
});

// Store a funding record (private)
router.post("/fundings", requireAuth, async (req, res) => {
  const { amount, paymentIntentId = "" } = req.body || {};
  const n = Number(amount);
  if (!n || n <= 0) return res.status(400).json({ message: "Invalid amount" });

  const doc = await Funding.create({
    name: req.user.name,
    email: req.user.email,
    amount: n,
    paymentIntentId,
  });

  res.status(201).json({ funding: doc });
});

export default router;
