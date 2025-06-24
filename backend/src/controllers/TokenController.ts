import { BaseRes, ResStatus, LoginRes, JwtPayload } from "@shared/index";
import { Request, Response } from "express";
import { verifyRefreshToken } from "../utils/jwt";
import TokenService from "../services/TokenService";
import UserService from "../services/UserService";
import { resServerError } from "../utils";

export default class TokenController {
  static async refresh(req: Request, res: Response<LoginRes | BaseRes>) {
    try {
      const currentRefreshToken = req.cookies["refreshToken"];
      if (!currentRefreshToken) {
        res
          .status(ResStatus.INVALID_CREDENTIALS)
          .json({ message: "No token provided" });
        return;
      }

      const currentPayload = verifyRefreshToken(currentRefreshToken);
      const refreshTokenFromDb = await TokenService.findByRefreshTokenId(
        currentPayload.tokenId
      );

      if (!refreshTokenFromDb) {
        res.clearCookie("refreshToken");
        res
          .status(ResStatus.INVALID_CREDENTIALS)
          .json({ message: "Refresh token not found" });
        return;
      }

      if (refreshTokenFromDb.userAgent !== currentPayload.userAgent) {
        res.clearCookie("refreshToken");
        res
          .status(ResStatus.INVALID_CREDENTIALS)
          .json({ message: "Invalid user-agent" });
        return;
      }

      const user = await UserService.getById(currentPayload.userId);
      if (!user) {
        await TokenService.deleteByRefreshTokenId(currentPayload.tokenId);
        res.clearCookie("refreshToken");
        res
          .status(ResStatus.INVALID_CREDENTIALS)
          .json({ message: "User not found" });
        return;
      }

      const newPayload = {
        userId: currentPayload.userId,
        isAdmin: currentPayload.isAdmin,
        userAgent: currentPayload.userAgent,
      };

      const { accessToken, refreshToken } = await TokenService.upsert(
        newPayload,
        currentPayload.tokenId
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
      });

      res.status(ResStatus.OK).json({
        message: "Access token refreshed",
        isAdmin: newPayload.isAdmin,
        accessToken,
      });
    } catch (err) {
      res.clearCookie("refreshToken");
      res
        .status(ResStatus.INVALID_CREDENTIALS)
        .json({ message: "Invalid or expired token" });
    }
  }

  static async deleteAllByUserId(
    req: Request & { user?: JwtPayload },
    res: Response<BaseRes>
  ) {
    try {
      await TokenService.deleteAllByUserId(req.user!.userId);
      res
        .status(ResStatus.NO_CONTENT)
        .json({ message: "Successful logout from all devices" });
    } catch (err) {
      resServerError(res, err);
    }
  }
}
