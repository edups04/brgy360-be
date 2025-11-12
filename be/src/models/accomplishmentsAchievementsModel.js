import mongoose from "mongoose";

const accomplishmentAchievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  contents: { type: String, required: true },
  image: { type: String, default: "N/A" },
  barangayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Barangay",
  },
});

accomplishmentAchievementSchema.index({ title: 1, date: 1 }, { unique: true });

export const AccomplishmentAchievement = mongoose.model(
  "AccomplishmentAchievement",
  accomplishmentAchievementSchema
);
