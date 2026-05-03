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

// Hanya ASISTEN_LAPANGAN dan KEPALA_KEBUN yang bisa kelola task types
router.post("/", authenticate, authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN"), createTaskType);
router.put("/:id", authenticate, authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN"), updateTaskType);
router.delete("/:id", authenticate, authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN"), deleteTaskType);

export default router;
