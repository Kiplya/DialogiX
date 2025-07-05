import {
  BaseRes,
  ResStatus,
  JwtPayload,
  GetChatsByUserIdRes,
  GetMessagesByChatIdRes,
} from "@shared/index";
import { NextFunction, Request, Response } from "express";
import { getChatIdByUsersId, resServerError } from "../utils/index";
import ChatService from "../services/ChatService";
import UserService from "../services/UserService";

export default class ChatController {
  static async getChatsByUserId(
    req: Request & { user?: JwtPayload },
    res: Response<GetChatsByUserIdRes | BaseRes>
  ) {
    try {
      const chats = await ChatService.getChatsByUserId(req.user!.userId);
      res.status(ResStatus.OK).json(chats);
    } catch (err) {
      resServerError(res, err);
    }
  }

  static async getMessagesByUsers(
    req: Request & { chatId?: string },
    res: Response<GetMessagesByChatIdRes | BaseRes>
  ) {
    try {
      const { page, limit } = req.query;
      if (!page || !limit) {
        res
          .status(ResStatus.INVALID_CREDENTIALS)
          .json({ message: "Invalid Credentials" });
        return;
      }

      const messages = await ChatService.getMessagesByChatId(
        parseInt(page.toString()),
        parseInt(limit.toString()),
        req.chatId!
      );

      res.status(ResStatus.OK).json(messages);
    } catch (err) {
      resServerError(res, err);
    }
  }

  static async chatMiddleware(
    req: Request<{}, {}, { recepientId?: string }> & {
      user?: JwtPayload;
      recepientId?: string;
      chatId?: string;
    },
    res: Response<BaseRes>,
    next: NextFunction
  ) {
    try {
      const recepientId = req.body?.recepientId || req.query?.recepientId;

      if (!recepientId) {
        res
          .status(ResStatus.INVALID_CREDENTIALS)
          .json({ message: "Invalid recipient ID" });
        return;
      }

      const recepient = await UserService.getById(recepientId.toString());

      if (!recepient) {
        res
          .status(ResStatus.INVALID_CREDENTIALS)
          .json({ message: "No recepient found" });
        return;
      }

      const chatId = getChatIdByUsersId(req.user!.userId, recepient.id);
      await ChatService.isUserInChat(req.user!.userId, chatId);

      req.chatId = chatId;
      req.recepientId = recepient.id;
      next();
    } catch {
      res
        .status(ResStatus.FORBIDDEN)
        .json({ message: "User is not a participant in the chat" });
    }
  }
}
