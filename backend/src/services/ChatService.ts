import { prisma } from "../utils/handlers";
import { encrypt, decrypt } from "../utils/crypt";

export default class ChatService {
  static async getChatByUserId(userId: string) {
    const chats = await prisma.chatParticipant.findMany({
      where: { userId },
      include: {
        chat: {
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            chatParticipants: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return chats.sort(
      (a, b) =>
        new Date(b.chat.messages[0].createdAt).getTime() -
        new Date(a.chat.messages[0].createdAt).getTime()
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
