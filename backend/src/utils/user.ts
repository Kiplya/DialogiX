import { Request, Response } from "express";
import {
  ResStatus,
  RegistrationReq,
  BaseRes,
  UsernameValidationReq,
  EmailValidationReq,
  PasswordValidationReq,
  LoginReq,
} from "@shared/index";
import validator from "validator";

export const registrationValidation = (
  req: Request<{}, {}, RegistrationReq>,
  res: Response<BaseRes>
) => {
  if (
    !usernameValidation(req, res) ||
    !emailValidation(req, res) ||
    !passwordValidation(req, res)
  ) {
    return false;
  }

  return true;
};

export const loginValidation = (
  req: Request<{}, {}, LoginReq>,
  res: Response<BaseRes>
) => {
  if (!emailValidation(req, res) || !passwordValidation(req, res)) {
    return false;
  }

  return true;
};

export const usernameValidation = (
  req: Request<{}, {}, UsernameValidationReq>,
  res: Response<BaseRes>
) => {
  if (req.body.username.trim().length < 6) {
    res
      .status(ResStatus.INVALID_CREDENTIALS)
      .json({ message: "Username length must be longer than 5" });
    return false;
  }

  return true;
};

export const emailValidation = (
  req: Request<{}, {}, EmailValidationReq>,
  res: Response<BaseRes>
) => {
  if (!validator.isEmail(req.body.email)) {
    res
      .status(ResStatus.INVALID_CREDENTIALS)
      .json({ message: "Incorrect email" });
    return false;
  }

  return true;
};

export const passwordValidation = (
  req: Request<{}, {}, PasswordValidationReq>,
  res: Response<BaseRes>
) => {
  if (req.body.password.trim().length < 8) {
    res
      .status(ResStatus.INVALID_CREDENTIALS)
      .json({ message: "Password length must be longer than 7" });
    return false;
  }

  return true;
};
