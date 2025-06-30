import { prisma } from "../utils/handlers";
import { encrypt, decrypt } from "../utils/crypt";

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

  static async getMessagesByChatId(chatId: string) {
    const messages = await prisma.message.findMany({ where: { chatId } });
    return messages.map((message) => ({
      ...message,
      text: decrypt(message.text),
    }));
  }

  static async deleteChatById(id: string) {
    await prisma.chat.delete({ where: { id } });
  }

  static async deleteMessageById(id: string) {
    await prisma.message.delete({ where: { id } });
  }

  static async createChat(userId_1: string, userId_2: string) {
    const user_1 = await prisma.user.findUnique({ where: { id: userId_1 } });
    const user_2 = await prisma.user.findUnique({ where: { id: userId_2 } });

    if (!user_1 || !user_2) {
      throw new Error("No users provided");
    }

    const chat = await prisma.chat.create({});

    await prisma.chatParticipant.createMany({
      data: [
        { userId: userId_1, chatId: chat.id },
        { userId: userId_2, chatId: chat.id },
      ],
    });
  }

  static async createMessage(userId: string, chatId: string, text: string) {
    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) {
      throw new Error("Chat not found");
    }

    return await prisma.message.create({
      data: {
        userId,
        chatId,
        text: encrypt(text),
      },
    });
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
}
