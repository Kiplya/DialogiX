import {
  BaseRes,
  RegistrationReq,
  ResStatus,
  LoginReq,
  LoginRes,
  JwtPayload,
  GetManyUsersRes,
  GetSelfUserRes,
  PasswordValidationReq,
  UpdatePasswordReq,
  UpadateUsernameReq,
} from "@shared/index";
import { Request, Response, NextFunction } from "express";
import UserService from "../services/UserService";
import { resServerError } from "../utils";
import {
  loginValidation,
  passwordValidation,
  registrationValidation,
  isCorrectPassword,
  usernameValidation,
  isUsernameExist,
  isEmailExist,
  deleteUserAvatar,
} from "../utils/user";
import { hash } from "../utils/crypt";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { verifyAccessToken, verifyRefreshToken } from "../utils/jwt";
import TokenService from "../services/TokenService";
import ChatService from "../services/ChatService";
import { GetUserByUsernameRes } from "../../../shared/index";

export default class UserController {
  static async registration(
    req: Request<{}, {}, RegistrationReq>,
    res: Response<BaseRes>
  ) {
    try {
      if (
        !registrationValidation(
          req.body.email,
          req.body.password,
          req.body.username,
          res
        )
      ) {
        return;
      }

      if (
        (await isUsernameExist(req.body.username, res)) ||
        (await isEmailExist(req.body.email, res))
      ) {
        return;
      }

      const hashedPassword = await hash(req.body.password);
      await UserService.registration({
        ...req.body,
        password: hashedPassword,
      });

      res.status(ResStatus.OK).json({ message: "Successful registration" });
    } catch (err) {
      if (err === "User already exist" || err === "Username already exist") {
        res.status(ResStatus.INVALID_CREDENTIALS).json({ message: err });
      } else {
        resServerError(res, err);
      }
    }
  }

  static async login(
    req: Request<{}, {}, LoginReq>,
    res: Response<LoginRes | BaseRes>
  ) {
    try {
      if (!loginValidation(req.body.email, req.body.password, res)) {
        return;
      }

      const user = await UserService.getByEmail(req.body.email);
      const isPasswordMatch = await bcrypt.compare(
        req.body.password,
        user?.password ?? ""
      );

      if (!isPasswordMatch || !user) {
        res
          .status(ResStatus.INVALID_CREDENTIALS)
          .json({ message: "Invalid credentials" });
        return;
      }

      const userAgent = req.headers["user-agent"];
      if (!userAgent) {
        res
          .status(ResStatus.INVALID_CREDENTIALS)
          .json({ message: "Invalid User-Agent" });
        return;
      }

      const payload = { userAgent, userId: user.id, isAdmin: user.isAdmin };
      const { refreshToken, accessToken } = await TokenService.upsert(
        payload,
        null
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
      });

      res.status(ResStatus.OK).json({
        message: "Successfully logged in",
        isAdmin: user.isAdmin,
        accessToken,
      });
    } catch (err) {
      resServerError(res, err);
    }
  }

  static async logout(req: Request, res: Response<BaseRes>) {
    try {
      const refreshToken = req.cookies["refreshToken"];
      if (refreshToken) {
        res.clearCookie("refreshToken");
        const refreshTokenId = verifyRefreshToken(refreshToken).tokenId;
        await TokenService.deleteByRefreshTokenId(refreshTokenId);
      }
      res.status(ResStatus.OK).json({ message: "Successfully logged out" });
    } catch (err) {
      resServerError(res, err);
    }
  }

  static async authMiddleware(
    req: Request & { user?: JwtPayload },
    res: Response<BaseRes>,
    next: NextFunction
  ) {
    try {
      const authHeader = req.headers["authorization"];
      const userAgent = req.headers["user-agent"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res
          .status(ResStatus.INVALID_CREDENTIALS)
          .json({ message: "No token provided" });
        return;
      }

      const refreshToken = req.cookies["refreshToken"];
      const accessToken = authHeader.split(" ")[1];
      const tokenPayload = verifyAccessToken(accessToken);

      if (userAgent !== tokenPayload.userAgent || !refreshToken) {
        throw new Error();
      }

      const refreshTokenFromDb = await TokenService.findByRefreshTokenId(
        tokenPayload.tokenId
      );

      if (!refreshTokenFromDb) {
        throw new Error();
      }

      req.user = tokenPayload;
      next();
    } catch (err) {
      res
        .status(ResStatus.UNAUTHORIZED)
        .json({ message: "Invalid or expired token" });
    }
  }

  static async isEmailExist(req: Request, res: Response<BaseRes>) {
    try {
      const email = req.query.email;
      if (!email) {
        res
          .status(ResStatus.INVALID_CREDENTIALS)
          .json({ message: "No Email provided" });
        return;
      }

      if (await isEmailExist(email.toString(), res)) {
        return;
      }

      res.sendStatus(ResStatus.NO_CONTENT);
    } catch (err) {
      resServerError(res, err);
    }
  }

  static async isUsernameExist(req: Request, res: Response<BaseRes>) {
    try {
      const username = req.query.username;
      if (!username) {
        res
          .status(ResStatus.INVALID_CREDENTIALS)
          .json({ message: "No username provided" });
        return;
      }

      if (await isUsernameExist(username.toString(), res)) {
        return;
      }

      res.sendStatus(ResStatus.NO_CONTENT);
    } catch (err) {
      resServerError(res, err);
    }
  }

  static async getManyByUsername(
    req: Request & { user?: JwtPayload },
    res: Response<GetManyUsersRes | BaseRes>
  ) {
    try {
      const { page, limit, username } = req.query;
      if (!page || !limit || !username) {
        res
          .status(ResStatus.INVALID_CREDENTIALS)
          .json({ message: "Invalid Credentials" });
        return;
      }

      const resultUsers = await UserService.getManyByUsername(
        username.toString(),
        req.user!.userId,
        parseInt(page.toString()),
        parseInt(limit.toString())
      );

      res.status(ResStatus.OK).json(resultUsers);
    } catch (err) {
      resServerError(res, err);
    }
  }

  static async getSelfById(
    req: Request & { user?: JwtPayload },
    res: Response<GetSelfUserRes | BaseRes>
  ) {
    try {
      const user = await UserService.getById(req.user!.userId);
      if (!user) {
        throw new Error("No user found");
      }

      res.status(ResStatus.OK).json(user);
    } catch (err) {
      resServerError(res, err);
    }
  }

  static async getByUsername(
    req: Request,
    res: Response<GetUserByUsernameRes | BaseRes>
  ) {
    try {
      const username = req.query.username;
      if (!username) {
        res
          .status(ResStatus.INVALID_CREDENTIALS)
          .json({ message: "No username provided" });
        return;
      }

      const user = await UserService.getByUsername(username.toString());
      if (!user) {
        res
          .status(ResStatus.INVALID_CREDENTIALS)
          .json({ message: "No user found" });
        return;
      }

      res.status(ResStatus.OK).json(user);
    } catch (err) {
      resServerError(res, err);
    }
  }

  static async deleteSelfById(
    req: Request<{}, {}, PasswordValidationReq> & { user?: JwtPayload },
    res: Response<BaseRes>
  ) {
    try {
      const isPasswordMatch = await isCorrectPassword(
        req.body.password,
        req.user!.userId,
        res
      );
      if (!isPasswordMatch) {
        return;
      }

      await ChatService.deleteAllChatsByUserId(req.user!.userId);
      await UserService.deleteById(req.user!.userId);
      deleteUserAvatar(req.user!.userId);

      res.status(ResStatus.OK).json({ message: "Successful delete user" });
    } catch (err) {
      resServerError(res, err);
    }
  }

  static async updatePassword(
    req: Request<{}, {}, UpdatePasswordReq> & { user?: JwtPayload },
    res: Response<BaseRes>
  ) {
    try {
      if (!passwordValidation(req.body.newPassword, res)) {
        return;
      }

      const isPasswordMatch = await isCorrectPassword(
        req.body.password,
        req.user!.userId,
        res
      );
      if (!isPasswordMatch) {
        return;
      }

      const hashedPassword = await hash(req.body.newPassword);
      await UserService.updatePassword(req.user!.userId, hashedPassword);
      await TokenService.deleteAllByUserId(req.user!.userId);

      res.status(ResStatus.OK).json({ message: "Password successful changed" });
    } catch (err) {
      resServerError(res, err);
    }
  }

  static async comparePassword(
    req: Request<{}, {}, PasswordValidationReq> & { user?: JwtPayload },
    res: Response<BaseRes>
  ) {
    try {
      if (!passwordValidation(req.body.password, res)) {
        return;
      }

      const isPasswordMatch = await isCorrectPassword(
        req.body.password,
        req.user!.userId,
        res
      );
      if (!isPasswordMatch) {
        return;
      }

      res.status(ResStatus.OK).json({ message: "Correct password" });
    } catch (err) {
      resServerError(res, err);
    }
  }

  static async updateUsername(
    req: Request<{}, {}, UpadateUsernameReq> & { user?: JwtPayload },
    res: Response<BaseRes>
  ) {
    try {
      if (!usernameValidation(req.body.username, res)) {
        return;
      }
      if (await isUsernameExist(req.body.username, res)) {
        return;
      }

      await UserService.updateUsername(req.user!.userId, req.body.username);
      res.status(ResStatus.OK).json({ message: "Username successful changed" });
    } catch (err) {
      resServerError(res, err);
    }
  }

  static async uploadAvatar(
    req: Request & { user?: JwtPayload },
    res: Response<BaseRes>
  ) {
    try {
      const file = req.file;
      if (!file) {
        res
          .status(ResStatus.INVALID_CREDENTIALS)
          .json({ message: "No file uploaded" });
        return;
      }

      const backupPath = file.path + ".backup";
      const invalidFileAction = (message: string) => {
        fs.unlinkSync(file.path);
        if (fs.existsSync(backupPath)) {
          fs.renameSync(backupPath, file.path);
        }

        res.status(ResStatus.INVALID_CREDENTIALS).json({ message });
      };

      const ext = path.extname(file.originalname).toLowerCase();
      if (ext !== ".jpg" || file.mimetype !== "image/jpeg") {
        invalidFileAction("Only .jpg files are allowed");
        return;
      }

      if (file.size > 1024 * 1024) {
        invalidFileAction("File is too large (max 1MB)");
        return;
      }

      const image = sharp(file.path);
      const metadata = await image.metadata();

      if (!metadata.width || !metadata.height) {
        invalidFileAction("Invalid image");
        return;
      }

      if (metadata.width !== metadata.height) {
        invalidFileAction("Image must be square");
        return;
      }

      if (metadata.width < 128 || metadata.width > 1024) {
        invalidFileAction(
          "Image dimensions must be between 128x128 and 1024x1024"
        );
        return;
      }

      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath);
      }

      res.status(ResStatus.OK).json({ message: "Avatar uploaded" });
    } catch (err) {
      resServerError(res, err);
    }
  }
}
