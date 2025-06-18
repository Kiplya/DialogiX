import { Router } from "express";
import UserController from "../controllers/UserController";

const authRouter = Router();

authRouter.use(UserController.authMiddleware);
authRouter.post("/logout", UserController.logout);

export default authRouter;
