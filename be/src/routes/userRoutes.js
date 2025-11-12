import express from "express";
import multer from "multer";

import {
  registerUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  verifyEmailRegistered,
} from "../controllers/userController.js";

let userRoutes = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

userRoutes.post("/forgot-password/", forgotPassword);
userRoutes.post("/reset-password/", resetPassword);
userRoutes.post("/verify-reset-token", verifyResetToken);
userRoutes.post("/verify-email", verifyEmailRegistered);
userRoutes.post("/login/", loginUser);
userRoutes.post(
  "/",
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
    { name: "profile", maxCount: 1 },
  ]),
  registerUser
);
userRoutes.get("/:id", getUser);
userRoutes.get("/", getUsers);
userRoutes.put(
  "/:id",
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
    { name: "profile", maxCount: 1 },
  ]),
  updateUser
);
userRoutes.delete("/:id", deleteUser);

userRoutes.get("/proxy/chatbot", async (req, res) => {
  try {
    const response = await fetch(
      "https://chatling.ai/public/embed/chatbot/setup"
    );

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!response.ok) {
      throw new Error(`Remote server returned ${response.status}`);
    }

    if (isJson) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text();
      console.warn("Received non-JSON response:", text.slice(0, 100));
      res.status(500).send("Expected JSON but got HTML or other content");
    }
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).send("Proxy failed: " + err.message);
  }
});

export { userRoutes };
