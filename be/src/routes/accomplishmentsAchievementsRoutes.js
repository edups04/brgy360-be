import express from "express";
import multer from "multer";
import {
  createAccomplishmentAchievement,
  getAccomplishmentAchievement,
  getAccomplishmentAchievements,
  updateAccomplishmentAchievement,
  deleteAccomplishmentAchievement,
} from "../controllers/accomplishmentsAchievementsControllers.js";

let accomplishmentsAchievementsRoutes = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

accomplishmentsAchievementsRoutes.get("/", getAccomplishmentAchievements);
accomplishmentsAchievementsRoutes.get("/:id", getAccomplishmentAchievement);
accomplishmentsAchievementsRoutes.post(
  "/",
  upload.single("image"),
  createAccomplishmentAchievement
);
accomplishmentsAchievementsRoutes.put(
  "/:id",
  upload.single("image"),
  updateAccomplishmentAchievement
);
accomplishmentsAchievementsRoutes.delete(
  "/:id",
  deleteAccomplishmentAchievement
);

export { accomplishmentsAchievementsRoutes };
