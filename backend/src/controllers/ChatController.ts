import { BaseRes, ResStatus, JwtPayload } from "@shared/index";
import { Request, Response } from "express";
import { resServerError } from "../utils";
import { GetChatsByUserIdRes } from "../../../shared/index";
import ChatService from "../services/ChatService";

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
}
