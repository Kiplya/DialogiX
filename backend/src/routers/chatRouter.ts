import { Router } from "express";
import UserController from "../controllers/UserController";
import ChatController from "../controllers/ChatController";

const chatRouter = Router();
chatRouter.use(UserController.authMiddleware);

chatRouter.get("/getChatsByUserId", ChatController.getChatsByUserId);

export default chatRouter;
