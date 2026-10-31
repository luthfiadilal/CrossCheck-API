import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  getAllTaskTypes,
  getTaskTypeById,
  createTaskType,
  updateTaskType,
  deleteTaskType,
} from "../controllers/task-type.controller";

const router = Router();

// Semua user yang login bisa lihat task types
router.get("/", authenticate, getAllTaskTypes);
router.get("/:id", authenticate, getTaskTypeById);

// Hanya ASISTEN_LAPANGAN, KEPALA_KEBUN, dan SUPERVISI yang bisa kelola task types
router.post("/", authenticate, authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN", "SUPERVISI"), createTaskType);
router.put("/:id", authenticate, authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN", "SUPERVISI"), updateTaskType);
router.delete("/:id", authenticate, authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN", "SUPERVISI"), deleteTaskType);

export default router;
