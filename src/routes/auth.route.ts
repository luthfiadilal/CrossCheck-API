import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  register,
  login,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Manajemen User oleh ASISTEN_LAPANGAN / KEPALA_KEBUN
router.get("/users", authenticate, getAllUsers);
router.get("/", authenticate, getAllUsers);
router.post("/", authenticate, authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN"), register);
router.put("/users/:id", authenticate, authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN"), updateUser);
router.put("/:id", authenticate, authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN"), updateUser);
router.delete("/users/:id", authenticate, authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN"), deleteUser);
router.delete("/:id", authenticate, authorize("ASISTEN_LAPANGAN", "KEPALA_KEBUN"), deleteUser);

export default router;
