import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String, required: true },
  lastName: { type: String, required: true },
  sex: { type: String, required: true },
  birthdate: { type: Date, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  status: {
    type: String,
    enum: ["pending", "active", "inactive"],
    default: "pending",
  },
  address: { type: String, required: true },
  profile: { type: String, default: "N/A" },
  validId: {
    type: { type: String },
    front: { type: String, required: true },
    back: { type: String, required: true },
  },
  barangayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Barangay",
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

export const User = mongoose.model("User", userSchema);
