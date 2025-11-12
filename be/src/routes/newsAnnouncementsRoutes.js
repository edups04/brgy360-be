import express from "express";
import multer from "multer";
import {
  createNewsAnnouncement,
  getNewsAnnouncement,
  getNewsAnnouncements,
  updateNewsAnnouncement,
  deleteNewsAnnouncement,
} from "../controllers/newsAnnouncementsControllers.js";

let newsAnnouncementRoutes = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

newsAnnouncementRoutes.get("/", getNewsAnnouncements);
newsAnnouncementRoutes.get("/:id", getNewsAnnouncement);
newsAnnouncementRoutes.post(
  "/",
  upload.single("image"),
  createNewsAnnouncement
);
newsAnnouncementRoutes.put(
  "/:id",
  upload.single("image"),
  updateNewsAnnouncement
);
newsAnnouncementRoutes.delete("/:id", deleteNewsAnnouncement);

export { newsAnnouncementRoutes };
