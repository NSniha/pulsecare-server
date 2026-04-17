import mongoose from "mongoose";

const FundingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    paymentIntentId: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Funding", FundingSchema);
