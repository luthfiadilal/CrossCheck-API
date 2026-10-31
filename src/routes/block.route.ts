import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  getAllBlocks,
  getBlockById,
  createBlock,
  updateBlock,
  deleteBlock,
} from "../controllers/block.controller";

const router = Router();

// Semua user yang login bisa lihat daftar blok
router.get("/", authenticate, getAllBlocks);
router.get("/:id", authenticate, getBlockById);

// Hanya ASISTEN_LAPANGAN dan KEPALA_KEBUN yang bisa kelola master blok
router.post("/", authenticate, authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN"), createBlock);
router.put("/:id", authenticate, authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN"), updateBlock);
router.delete("/:id", authenticate, authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN"), deleteBlock);

export default router;
