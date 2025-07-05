import { Router } from "express";
import UserController from "../controllers/UserController";
import ChatController from "../controllers/ChatController";

const chatRouter = Router();
chatRouter.use(UserController.authMiddleware);

chatRouter.get(
  "/getMessagesByUsers",
  ChatController.chatMiddleware,
  ChatController.getMessagesByUsers
);

chatRouter.get("/getChatsByUserId", ChatController.getChatsByUserId);

export default chatRouter;
