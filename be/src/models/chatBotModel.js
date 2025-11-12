import mongoose from "mongoose";

const chatBotSchema = new mongoose.Schema({
  message: { type: String, required: true },
  from: { type: String, enum: ["chatbot", "admin", "user"], default: "user" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["read", "unread"], default: "unread" },
});

export const ChatBot = mongoose.model("ChatBot", chatBotSchema);
