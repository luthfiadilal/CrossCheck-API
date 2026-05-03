import { Router } from "express";
import authRouter from "./auth.route";
import taskTypeRouter from "./task-type.route";
import monitoringRouter from "./monitoring.route";
import approvalRouter from "./approval.route";
import exampleRouter from "./example.route";
import uploadRouter from "./upload.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/task-types", taskTypeRouter);
router.use("/monitoring", monitoringRouter);
router.use("/approval", approvalRouter);
router.use("/upload", uploadRouter);
router.use("/example", exampleRouter);

export default router;
