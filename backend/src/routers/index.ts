import { Router } from "express";
import publicRouter from "./publicRouter";
import authRouter from "./authRouter";
import chatRouter from "./chatRouter";

const router = Router();

router.use("/public", publicRouter);
router.use("/auth", authRouter);
router.use("/chat", chatRouter);

export default router;
