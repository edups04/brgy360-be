import express from "express";

import {
  createBarangay,
  getBarangay,
  getBarangays,
  updateBarangay,
  deleteBarangay,
  getBarangayReports,
} from "../controllers/barangayController.js";

let barangayRoutes = express.Router();

barangayRoutes.get("/reports/:id", getBarangayReports);
barangayRoutes.get("/reports", getBarangayReports);
barangayRoutes.get("/", getBarangays);
barangayRoutes.get("/:id", getBarangay);
barangayRoutes.post("/", createBarangay);
barangayRoutes.put("/:id", updateBarangay);
barangayRoutes.delete("/:id", deleteBarangay);

export { barangayRoutes };
