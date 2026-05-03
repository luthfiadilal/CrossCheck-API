import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";
import { uploadImage } from "../controllers/upload.controller";

const router = Router();

// Endpoint upload gambar, middleware auth opsional (bisa disesuaikan jika butuh login)
// upload.single("image") berarti kita mengharapkan file dengan nama field "image"
router.post("/", authenticate, upload.single("image"), uploadImage);

export default router;
