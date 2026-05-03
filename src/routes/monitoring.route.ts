import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  createMonitoringLog,
  getAllMonitoringLogs,
  getMonitoringLogById,
  updateMonitoringLog,
  deleteMonitoringLog,
  bulkCreateMonitoringLogs,
} from "../controllers/monitoring.controller";

const router = Router();

// Semua user login bisa lihat monitoring logs (filtered by role di controller)
router.get("/", authenticate, getAllMonitoringLogs);
router.get("/:id", authenticate, getMonitoringLogById);

// Hanya MANDOR yang bisa buat, edit, dan hapus laporan
router.post("/", authenticate, authorize("MANDOR"), createMonitoringLog);
router.post("/bulk", authenticate, authorize("MANDOR"), bulkCreateMonitoringLogs);
router.put("/:id", authenticate, authorize("MANDOR"), updateMonitoringLog);
router.delete("/:id", authenticate, authorize("MANDOR"), deleteMonitoringLog);

export default router;
