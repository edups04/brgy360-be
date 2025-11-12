import express from "express";
import multer from "multer";
import {
  createBudget,
  getBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
} from "../controllers/budgetControllers.js";

let budgetRoutes = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/files/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

budgetRoutes.get("/", getBudgets);
budgetRoutes.get("/:id", getBudget);
budgetRoutes.post("/", upload.single("file"), createBudget);
budgetRoutes.put("/:id", upload.single("file"), updateBudget);
budgetRoutes.delete("/:id", deleteBudget);

export { budgetRoutes };
