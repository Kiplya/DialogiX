import { Router } from "express";
import UserController from "../controllers/UserController";
import TokenController from "../controllers/TokenController";

const publicRouter = Router();

publicRouter.post("/login", UserController.login);
publicRouter.post("/registration", UserController.registration);
publicRouter.post("/refreshTokens", TokenController.refresh);

publicRouter.get("/isEmailExist", UserController.isEmailExist);
publicRouter.get("/isUsernameExist", UserController.isUsernameExist);

export default publicRouter;
