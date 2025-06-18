import { RegistrationReq } from "@shared/index";
import { prisma } from "../utils/handlers";

export default class UserService {
  static async getById(id: string) {
    return await prisma.user.findUnique({ where: { id } });
  }

  static async getByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  static async getByUsername(username: string) {
    return await prisma.user.findUnique({ where: { username } });
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
}
