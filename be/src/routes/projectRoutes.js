import express from "express";
import multer from "multer";
import {
  createProject,
  getProject,
  getProjects,
  updateProject,
  deleteProject,
} from "../controllers/projectControllers.js";

let projectRoutes = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

projectRoutes.get("/", getProjects);
projectRoutes.get("/:id", getProject);
projectRoutes.post("/", upload.single("image"), createProject);
projectRoutes.put("/:id", upload.single("image"), updateProject);
projectRoutes.delete("/:id", deleteProject);

export { projectRoutes };
