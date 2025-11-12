import mongoose from "mongoose";

const barangaySchema = new mongoose.Schema({
  barangayName: { type: String, unique: true, required: true },
  barangayLocation: { type: String, required: true },
});

export const Barangay = mongoose.model("Barangay", barangaySchema);
