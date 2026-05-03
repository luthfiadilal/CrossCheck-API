import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  submitApproval,
  submitDetailApproval,
  getApprovalHistory,
  getPendingApprovals,
} from "../controllers/approval.controller";

const router = Router();

// Ambil laporan yang menunggu approval (hanya atasan)
router.get(
  "/pending",
  authenticate,
  authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN"),
  getPendingApprovals
);

// Ambil riwayat approval per log (semua user login)
router.get("/history/:logId", authenticate, getApprovalHistory);

// Submit keputusan approval per detail (hanya atasan)
router.post(
  "/detail",
  authenticate,
  authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN"),
  submitDetailApproval
);

// Submit keputusan approval (hanya atasan)
router.post(
  "/",
  authenticate,
  authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN"),
  submitApproval
);

export default router;
