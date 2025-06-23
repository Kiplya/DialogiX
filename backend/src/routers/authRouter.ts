import { Router } from "express";
import UserController from "../controllers/UserController";

const authRouter = Router();

authRouter.use(UserController.authMiddleware);
authRouter.post("/logout", UserController.logout);
authRouter.get("/getManyUsersByUsername", UserController.getManyByUsername);

export default authRouter;
