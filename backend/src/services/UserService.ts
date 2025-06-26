import { RegistrationReq } from "@shared/index";
import { prisma } from "../utils/handlers";

export default class UserService {
  static async getById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        registredAt: true,
        isAdmin: true,
        hasAvatar: true,
      },
    });
  }

  static async getByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  static async getByUsername(username: string) {
    return await prisma.user.findUnique({ where: { username } });
  }

  static async getManyByUsername(
    username: string,
    userId: string,
    page: number,
    limit: number
  ) {
    const userChats = await prisma.chatParticipant.findMany({
      where: { userId },
      select: { chatId: true },
    });
    const chatIds = userChats.map((chat) => chat.chatId);

    const participants = await prisma.chatParticipant.findMany({
      where: {
        chatId: { in: chatIds },
        userId: { not: userId },
      },
      select: { userId: true },
    });
    const excludedUserIds = participants.map((p) => p.userId);

    const users = await prisma.user.findMany({
      where: {
        username: { contains: username, mode: "insensitive" },
        id: { notIn: [userId, ...excludedUserIds] },
      },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, username: true, hasAvatar: true },
    });

    const totalUsers = await prisma.user.findMany({
      where: {
        username: { contains: username, mode: "insensitive" },
        id: {
          notIn: [userId, ...excludedUserIds],
        },
      },
    });

    return { users, hasMore: page * limit < totalUsers.length };
  }

  static async registration(data: RegistrationReq) {
    const emailExist = await this.getByEmail(data.email);
    if (emailExist) {
      throw new Error("User already exist");
    }

    const usernameExist = await this.getByUsername(data.username);
    if (usernameExist) {
      throw new Error("Username already exist");
    }

    return await prisma.user.create({ data });
  }

  static async deleteById(id: string) {
    await prisma.user.delete({ where: { id } });
  }

  static async updatePassword(id: string, newPassword: string) {
    await prisma.user.update({
      where: { id },
      data: { password: newPassword },
    });
  }

  static async getPasswordById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });
  }

  static async updateUsername(id: string, username: string) {
    await prisma.user.update({
      where: { id },
      data: { username },
    });
  }

  static async updateHasAvatar(id: string, hasAvatar: boolean) {
    await prisma.user.update({
      where: { id },
      data: { hasAvatar },
    });
  }
}
