import { Router } from "express";
import publicRouter from "./publicRouter";
import authRouter from "./authRouter";

const router = Router();

router.use("/public", publicRouter);
router.use("/auth", authRouter);

export default router;
