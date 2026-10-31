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

// Hanya ASISTEN_LAPANGAN, KEPALA_KEBUN, dan SUPERVISI yang bisa kelola master blok
router.post("/", authenticate, authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN", "SUPERVISI"), createBlock);
router.put("/:id", authenticate, authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN", "SUPERVISI"), updateBlock);
router.delete("/:id", authenticate, authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN", "SUPERVISI"), deleteBlock);

export default router;
