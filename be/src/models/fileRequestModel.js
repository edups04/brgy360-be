import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import dotenv from "dotenv";

dotenv.config();
const URL = process.env.MONGODB;
const connection = mongoose.createConnection(URL);
const AutoIncrement = AutoIncrementFactory(connection);

const fileRequestSchema = new mongoose.Schema({
  requestNumber: { type: Number },
  residentCertificateNumber: { type: Number, default: 0 },
  requestedDocumentType: {
    type: String,
    enum: [
      "barangay-clearance",
      "barangay-indigency",
      "certificate-of-residency",
      "first-time-job-seeker",
    ],
    default: "barangay-clearance",
  },
  issuanceDate: { type: String, default: "N/A" },
  placeOfIssuance: { type: String, default: "N/A" },
  status: {
    type: String,
    enum: ["pending", "approved", "declined", "completed"],
    default: "pending",
  },
  dateRequested: { type: Date, default: Date.now, required: true },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  barangayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Barangay",
  },
});

fileRequestSchema.plugin(AutoIncrement, { inc_field: "requestNumber" });

export const FileRequest = mongoose.model("FileRequest", fileRequestSchema);
