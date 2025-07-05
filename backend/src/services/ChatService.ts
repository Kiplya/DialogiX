import { prisma } from "../utils/handlers";
import { encrypt, decrypt } from "../utils/crypt";
import { getChatIdByUsersId } from "../utils/index";

export default class ChatService {
  static async getChatsByUserId(userId: string) {
    const chats = await prisma.chatParticipant.findMany({
      where: { userId },
      include: {
        chat: {
          include: {
            messages: {
              select: {
                createdAt: true,
                text: true,
              },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            chatParticipants: {
              where: { userId: { not: userId } },
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    isOnline: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return chats
      .map((chat) => {
        let lastMessage = "";
        if (chat.chat.messages[0].text) {
          lastMessage = decrypt(chat.chat.messages[0].text);
        }

        return {
          userId: chat.chat.chatParticipants[0].user.id,
          username: chat.chat.chatParticipants[0].user.username,
          lastMessage,
          isOnline: chat.chat.chatParticipants[0].user.isOnline,
          createdAt: chat.chat.messages[0].createdAt,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  static async setIsReadedMessagesByChatIdAndRecepientId(
    chatId: string,
    userId: string
  ) {
    const messages = await prisma.message.findMany({
      where: { chatId, userId, isReaded: false },
      select: { id: true },
    });

    await prisma.message.updateMany({
      where: { chatId, userId, isReaded: false },
      data: { isReaded: true },
    });

    return messages.map((message) => message.id);
  }

  static async getMessagesByChatId(
    page: number,
    limit: number,
    chatId: string
  ) {
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "desc" },
      select: {
        text: true,
        id: true,
        createdAt: true,
        isReaded: true,
        isEdited: true,
        userId: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const decryptedMessages = messages.map((message) => ({
      ...message,
      text: decrypt(message.text),
    }));

    const totalMessagesCount = await prisma.message.count({
      where: { chatId },
    });

    return {
      messages: decryptedMessages,
      hasMore: page * limit < totalMessagesCount,
    };
  }

  static async deleteChatById(id: string) {
    const chat = prisma.chat.findUnique({ where: { id } });
    if (!chat) throw new Error("No chat found");

    await prisma.chat.delete({ where: { id } });
  }

  static async deleteMessageById(id: string) {
    const message = await prisma.message.findUnique({ where: { id } });
    if (!message) throw new Error("No message found");

    await prisma.message.delete({ where: { id } });

    const messagesCount = await prisma.message.count({
      where: { chatId: message.chatId },
    });

    if (!messagesCount) {
      await this.deleteChatById(message.chatId);
    }
  }

  static async createChat(userId_1: string, userId_2: string) {
    const user_1 = await prisma.user.findUnique({ where: { id: userId_1 } });
    const user_2 = await prisma.user.findUnique({ where: { id: userId_2 } });

    if (!user_1 || !user_2) {
      throw new Error("No users provided");
    }

    return await prisma.$transaction(async (tx) => {
      const chat = await tx.chat.create({
        data: { id: getChatIdByUsersId(userId_1, userId_2) },
      });

      await tx.chatParticipant.createMany({
        data: [
          { userId: userId_1, chatId: chat.id },
          { userId: userId_2, chatId: chat.id },
        ],
      });

      return chat;
    });
  }

  static async isChatExist(chatId: string) {
    return await prisma.chat.findUnique({ where: { id: chatId } });
  }

  static async createMessage(userId: string, chatId: string, text: string) {
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) {
      throw new Error("Chat not found");
    }

    const message = await prisma.message.create({
      data: {
        userId,
        chatId,
        text: encrypt(text),
      },
      select: {
        text: true,
        id: true,
        createdAt: true,
        isEdited: true,
        isReaded: true,
        userId: true,
      },
    });

    return { ...message, text: decrypt(message.text) };
  }

  static async setIsReadedMessageById(id: string, isReaded: boolean) {
    await prisma.message.update({ where: { id }, data: { isReaded } });
    const message = await prisma.message.findUnique({
      where: { id },
      select: {
        text: true,
        id: true,
        createdAt: true,
        isEdited: true,
        isReaded: true,
        userId: true,
      },
    });

    if (!message) {
      throw new Error("No message found");
    }

    return { ...message, text: decrypt(message.text) };
  }

  static async updateMessageById(id: string, text: string) {
    const message = await prisma.message.update({
      where: { id },
      data: { text: encrypt(text), isEdited: true, isReaded: false },
      select: {
        text: true,
        id: true,
        createdAt: true,
        isEdited: true,
        isReaded: true,
        userId: true,
      },
    });

    return { ...message, text: decrypt(message.text) };
  }

  static async getChatParticipantIdsByUserId(id: string) {
    const chats = await this.getChatsByUserId(id);
    return chats.map((chat) => chat.userId);
  }

  static async deleteAllChatsByUserId(userId: string) {
    const chatsParticipant = await prisma.chatParticipant.findMany({
      where: { userId },
      select: { chatId: true },
    });

    const chatIds = chatsParticipant.map(
      (chatParticipant) => chatParticipant.chatId
    );

    await prisma.chat.deleteMany({
      where: { id: { in: chatIds } },
    });
  }

  static async isUserInChat(userId: string, chatId: string) {
    const inChat = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!inChat) {
      throw new Error("User is not a participant in the chat");
    }
  }
}
