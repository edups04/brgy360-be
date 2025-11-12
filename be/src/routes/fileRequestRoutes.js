import express from "express";
import multer from "multer";

import {
  createFileRequest,
  getFileRequest,
  getFileRequests,
  updateFileRequest,
  deleteFileRequest,
} from "../controllers/fileRequestControllers.js";

let fileRequestRoutes = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

fileRequestRoutes.get("/", getFileRequests);
fileRequestRoutes.get("/:id", getFileRequest);
fileRequestRoutes.post("/", upload.single("image"), createFileRequest);
fileRequestRoutes.put("/:id", updateFileRequest);
fileRequestRoutes.delete("/:id", deleteFileRequest);

export { fileRequestRoutes };
