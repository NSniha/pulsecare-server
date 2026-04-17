import mongoose from "mongoose";

const DonationRequestSchema = new mongoose.Schema(
  {
    requesterName: { type: String, required: true },
    requesterEmail: { type: String, required: true },

    recipientName: { type: String, required: true },
    recipientDistrict: { type: String, required: true },
    recipientUpazila: { type: String, required: true },

    hospitalName: { type: String, required: true },
    addressLine: { type: String, required: true },

    bloodGroup: { type: String, required: true },

    donationDate: { type: String, required: true },
    donationTime: { type: String, required: true },

    requestMessage: { type: String, required: true },

    status: { type: String, enum: ["pending", "inprogress", "done", "canceled"], default: "pending" },
    donorName: { type: String, default: null },
    donorEmail: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("DonationRequest", DonationRequestSchema);
