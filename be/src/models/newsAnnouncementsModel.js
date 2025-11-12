import mongoose from "mongoose";

const newsAnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  contents: { type: String, required: true },
  image: { type: String, default: "N/A" },
  barangayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Barangay",
  },
});

newsAnnouncementSchema.index({ title: 1, date: 1 }, { unique: true });

export const NewsAnnouncement = mongoose.model(
  "NewsAnnouncement",
  newsAnnouncementSchema
);
