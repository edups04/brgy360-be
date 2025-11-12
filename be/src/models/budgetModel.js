import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  file: { type: String, default: "N/A" },
  barangayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Barangay",
  },
});

budgetSchema.index({ title: 1, date: 1 }, { unique: true });

export const Budget = mongoose.model("Budget", budgetSchema);
