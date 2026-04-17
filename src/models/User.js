import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    avatar: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    district: { type: String, required: true },
    upazila: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["donor", "volunteer", "admin"], default: "donor" },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
