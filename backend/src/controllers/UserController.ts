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
} from "@shared/index";
import { Request, Response, NextFunction } from "express";
import UserService from "../services/UserService";
import { resServerError } from "../utils";
import {
  loginValidation,
  passwordValidation,
  registrationValidation,
} from "../utils/user";
import { hash } from "../utils/crypt";
import bcrypt from "bcryptjs";
import { verifyAccessToken, verifyRefreshToken } from "../utils/jwt";
import TokenService from "../services/TokenService";
import ChatService from "../services/ChatService";

export default class UserController {
  static async registration(
    req: Request<{}, {}, RegistrationReq>,
    res: Response<BaseRes>
  ) {
    try {
      if (!registrationValidation(req, res)) {
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
      if (!loginValidation(req, res)) {
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

      const user = await UserService.getByEmail(email.toString());
      if (user) {
        res
          .status(ResStatus.INVALID_CREDENTIALS)
          .json({ message: "Email is already in use" });
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

      const user = await UserService.getByUsername(username.toString());
      if (user) {
        res
          .status(ResStatus.INVALID_CREDENTIALS)
          .json({ message: "Username is already in use" });
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

  static async deleteSelfById(
    req: Request & { user?: JwtPayload },
    res: Response<BaseRes>
  ) {
    try {
      await ChatService.deleteAllChatsByUserId(req.user!.userId);
      await UserService.deleteById(req.user!.userId);

      res.status(ResStatus.OK).json({ message: "Successful delete user" });
    } catch (err) {
      resServerError(res, err);
    }
  }

  static async updatePassword(
    req: Request<{}, {}, PasswordValidationReq> & { user?: JwtPayload },
    res: Response<BaseRes>
  ) {
    try {
      if (!passwordValidation(req, res)) {
        return;
      }

      const hashedPassword = await hash(req.body.password);
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
      const passwordEntity = await UserService.getPasswordById(
        req.user!.userId
      );
      if (!passwordEntity) {
        throw new Error("No password found");
      }

      const isPasswordMatch = await bcrypt.compare(
        req.body.password,
        passwordEntity.password
      );

      if (!isPasswordMatch) {
        res
          .status(ResStatus.INVALID_CREDENTIALS)
          .json({ message: "Incorrect password" });
        return;
      }

      res.status(ResStatus.OK).json({ message: "Correct password" });
    } catch (err) {
      resServerError(res, err);
    }
  }
}
