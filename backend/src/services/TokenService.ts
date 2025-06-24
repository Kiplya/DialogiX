import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { randomUUID } from "crypto";
import { prisma } from "../utils/handlers";
import dotenv from "dotenv";
import { hash } from "../utils/crypt";

dotenv.config();
const REFRESH_TOKEN_EXPIRES_IN = Number(process.env.REFRESH_TOKEN_EXPIRES_IN!);

export default class TokenService {
  static async upsert(
    payload: {
      userId: string;
      isAdmin: boolean;
      userAgent: string;
    },
    prevRefreshTokenId: string | null
  ) {
    const tokenId = randomUUID();

    const accessToken = generateAccessToken({
      ...payload,
      tokenId,
    });
    const refreshToken = generateRefreshToken({
      ...payload,
      tokenId,
    });

    const expiresIn = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN * 1000);
    await prisma.token.create({
      data: {
        id: tokenId,
        refreshToken: await hash(refreshToken),
        userId: payload.userId,
        userAgent: payload.userAgent,
        expiresIn,
      },
    });

    if (prevRefreshTokenId) {
      await this.deleteByRefreshTokenId(prevRefreshTokenId);
    }

    return { accessToken, refreshToken };
  }

  static async deleteExpiredTokens() {
    const now = new Date();

    await prisma.token.deleteMany({
      where: {
        expiresIn: {
          lt: now,
        },
      },
    });
  }

  static async deleteByRefreshTokenId(refreshTokenId: string) {
    await prisma.token.delete({ where: { id: refreshTokenId } });
  }

  static async findByRefreshTokenId(refreshTokenId: string) {
    return await prisma.token.findUnique({ where: { id: refreshTokenId } });
  }

  static async deleteAllByUserId(userId: string) {
    await prisma.token.deleteMany({ where: { userId } });
  }
}
