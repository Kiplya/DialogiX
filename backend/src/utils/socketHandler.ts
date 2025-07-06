import { Server, Socket } from "socket.io";
import * as cookie from "cookie";
import { verifyAccessToken } from "./jwt";
import { getChatIdByUsersId } from "./index";
import UserService from "../services/UserService";
import ChatService from "../services/ChatService";

const getChatInfo = async (chatId: string, userId: string) => {
  const lastMessage = await ChatService.getLastMessageByChatId(chatId);

  const hasUnreadedMessagesBySelf = await ChatService.hasUnreadedMessagesBySelf(
    userId,
    chatId
  );

  const hasUnreadedMessagesByRecepient =
    await ChatService.hasUnreadedMessagesByRecepient(userId, chatId);

  return {
    lastMessage: lastMessage.text,
    isNotReadedBySelf: hasUnreadedMessagesBySelf,
    isNotReadedByRecepient: hasUnreadedMessagesByRecepient,
    lastSenderId: lastMessage.userId,
    createdAt: lastMessage.createdAt,
  };
};

const authCheck = (socket: Socket, controller: string, args?: any[]) => {
  if (!socket.data.isAuth) {
    socket.emit("unauthorized", {
      controller,
      args,
    });

    throw new Error("Unauthorized");
  }
};

const sendChatInfo = async (
  io: Server,
  listener: string,
  chatId: string,
  userId: string,
  recepientId: string
) => {
  const selfInfo = await UserService.getById(userId);
  if (!selfInfo) return;

  const recepientInfo = await UserService.getById(recepientId);
  if (!recepientInfo) return;

  const senderChatInfo = await getChatInfo(chatId, userId);
  const recepientChatInfo = await getChatInfo(chatId, recepientId);

  io.to(`user_${userId}`).emit(listener, {
    ...senderChatInfo,
    userId: recepientInfo.id,
    username: recepientInfo.username,
    isOnline: recepientInfo.isOnline,
    chatId: chatId,
  });

  io.to(`user_${recepientId}`).emit(listener, {
    ...recepientChatInfo,
    userId: selfInfo.id,
    username: selfInfo.username,
    isOnline: selfInfo.isOnline,
    chatId: chatId,
  });
};

const socketHandler = (io: Server) => {
  io.on("connection", (socket) => {
    socket.use((_, next) => {
      try {
        const cookies = cookie.parse(socket.handshake.headers.cookie || "");
        const refreshToken = cookies["refreshToken"];

        const accessToken: string | undefined =
          socket.handshake.auth.accessToken;
        const userAgent = socket.handshake.headers["user-agent"];

        if (!accessToken || !refreshToken || !userAgent) {
          throw new Error("Invalid authentication data");
        }

        const payload = verifyAccessToken(accessToken);
        if (payload.userAgent !== userAgent) {
          throw new Error("Invalid user-agent");
        }

        socket.data.isAuth = true;
        socket.data.userId = payload.userId;
      } catch {
        socket.data.isAuth = false;
      } finally {
        next();
      }
    });

    socket.on("join_user", async () => {
      try {
        if (!socket.data.isAuth) return;

        socket.join(`user_${socket.data.userId}`);

        const chatParticipantIds =
          await ChatService.getChatParticipantIdsByUserId(socket.data.userId);
        await UserService.setOnlineStatus(socket.data.userId, true);

        for (const chatParticipantId of chatParticipantIds) {
          io.to(`user_${chatParticipantId}`).emit(
            "user_online",
            socket.data.userId
          );
        }
      } catch {}
    });

    socket.on("disconnect", async () => {
      try {
        if (!socket.data.isAuth) return;

        const chatParticipantIds =
          await ChatService.getChatParticipantIdsByUserId(socket.data.userId);
        await UserService.setOnlineStatus(socket.data.userId, false);

        for (const chatParticipantId of chatParticipantIds) {
          io.to(`user_${chatParticipantId}`).emit(
            "user_offline",
            socket.data.userId
          );
        }
      } catch {}
    });

    socket.on("join_chat", async (recepientId: string) => {
      try {
        authCheck(socket, "join_chat", [recepientId]);

        const recepient = await UserService.getById(recepientId);
        if (!recepient) return;

        socket.join(
          `chat_${getChatIdByUsersId(recepientId, socket.data.userId)}`
        );

        const chat = await ChatService.isChatExist(
          getChatIdByUsersId(recepientId, socket.data.userId)
        );
        if (!chat) return;

        const messagesIds =
          await ChatService.setIsReadedMessagesByChatIdAndRecepientId(
            chat.id,
            recepientId
          );

        if (!messagesIds.length) return;

        io.to(`chat_${chat.id}`).emit("join_chat", messagesIds);
        await sendChatInfo(
          io,
          "dialogs_join_chat",
          chat.id,
          socket.data.userId,
          recepientId
        );
      } catch {}
    });

    socket.on("leave_chat", async (recepientId: string) => {
      try {
        authCheck(socket, "leave_chat", [recepientId]);

        const recepient = await UserService.getById(recepientId);
        if (!recepient) return;

        socket.leave(
          `chat_${getChatIdByUsersId(recepientId, socket.data.userId)}`
        );
      } catch {}
    });

    socket.on("delete_chat", async (recepientId: string) => {
      try {
        authCheck(socket, "delete_chat", [recepientId]);

        const chat = await ChatService.isChatExist(
          getChatIdByUsersId(recepientId, socket.data.userId)
        );
        if (!chat) return;

        await ChatService.deleteChatById(chat.id);

        io.to(`chat_${chat.id}`).emit("delete_chat");

        io.to([`user_${recepientId}`, `user_${socket.data.userId}`]).emit(
          "dialogs_delete_chat",
          chat.id
        );
      } catch {}
    });

    socket.on("send_message", async (text: string, recepientId: string) => {
      try {
        authCheck(socket, "send_message", [text, recepientId]);

        const chat = await ChatService.isChatExist(
          getChatIdByUsersId(recepientId, socket.data.userId)
        );
        let chatId = chat?.id;

        const recepient = await UserService.getById(recepientId);
        if (!recepient) return;

        if (!chat) {
          const newChat = await ChatService.createChat(
            socket.data.userId,
            recepientId
          );

          chatId = newChat.id;
        }

        let message = await ChatService.createMessage(
          socket.data.userId,
          chatId!,
          text
        );
        const roomSize = io.sockets.adapter.rooms.get(`chat_${chatId}`)?.size;

        if (roomSize === 2) {
          message = await ChatService.setIsReadedMessageById(message.id, true);
        }

        io.to(`chat_${chatId}`).emit("receive_message", message);
        await sendChatInfo(
          io,
          "dialogs_receive_message",
          chatId!,
          socket.data.userId,
          recepientId
        );
      } catch {}
    });

    socket.on(
      "delete_message",
      async (messageId: string, recepientId: string) => {
        try {
          authCheck(socket, "delete_message", [messageId, recepientId]);

          const chat = await ChatService.isChatExist(
            getChatIdByUsersId(recepientId, socket.data.userId)
          );
          if (!chat) return;

          const lastMessage = await ChatService.getLastMessageByChatId(chat.id);
          await ChatService.deleteMessageById(messageId);

          const isChatExist = await ChatService.isChatExist(
            getChatIdByUsersId(recepientId, socket.data.userId)
          );

          if (!isChatExist) {
            io.to([`user_${recepientId}`, `user_${socket.data.userId}`]).emit(
              "dialogs_delete_chat",
              chat.id
            );
          }

          io.to(`chat_${chat.id}`).emit("delete_message", messageId);

          if (lastMessage.id !== messageId) return;
          await sendChatInfo(
            io,
            "dialogs_delete_message",
            chat.id,
            socket.data.userId,
            recepientId
          );
        } catch {}
      }
    );

    socket.on("block_user", async (recepientId: string) => {
      try {
        authCheck(socket, "block_user", [recepientId]);

        const recepient = await UserService.getById(recepientId);
        if (!recepient) return;

        await UserService.blockByIds(socket.data.userId, recepientId);
        io.to(
          `chat_${getChatIdByUsersId(recepientId, socket.data.userId)}`
        ).emit("block_user");
      } catch {}
    });

    socket.on("unblock_user", async (recepientId: string) => {
      try {
        authCheck(socket, "unblock_user", [recepientId]);

        const recepient = await UserService.getById(recepientId);
        if (!recepient) return;

        await UserService.unblockByIds(socket.data.userId, recepientId);
      } catch {}
    });

    socket.on("edit_message", async (messageId, text, recepientId) => {
      try {
        authCheck(socket, "edit_message", [messageId, text, recepientId]);

        const chat = await ChatService.isChatExist(
          getChatIdByUsersId(recepientId, socket.data.userId)
        );
        if (!chat) return;

        let message = await ChatService.updateMessageById(messageId, text);
        const roomSize = io.sockets.adapter.rooms.get(`chat_${chat.id}`)?.size;

        if (roomSize === 2) {
          message = await ChatService.setIsReadedMessageById(message.id, true);
        }

        io.to(`chat_${chat.id}`).emit("edit_message", message);
        await sendChatInfo(
          io,
          "dialogs_edit_message",
          chat.id,
          socket.data.userId,
          recepientId
        );
      } catch {}
    });
  });
};

export default socketHandler;
