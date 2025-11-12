import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  contents: { type: String, required: true },
  image: { type: String, required: true },
  barangayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Barangay",
  },
});

projectSchema.index({ title: 1, date: 1 }, { unique: true });

export const Project = mongoose.model("Project", projectSchema);
