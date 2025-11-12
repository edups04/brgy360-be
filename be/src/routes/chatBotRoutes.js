import express from "express";

import {
  createChatBotMessage,
  getChatBotMessage,
  getChatBotMessages,
  updateChatBotMessage,
  deleteChatBotMessage,
} from "../controllers/chatBotControllers.js";

let chatBotRoutes = express.Router();

chatBotRoutes.get("/", getChatBotMessages);
chatBotRoutes.get("/:id", getChatBotMessage);
// * STEP 3 WS - get post requests from frontend
chatBotRoutes.post("/", createChatBotMessage);
chatBotRoutes.put("/:id", updateChatBotMessage);
chatBotRoutes.delete("/:id", deleteChatBotMessage);

export { chatBotRoutes };
