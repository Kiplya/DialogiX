import { Response } from "express";
import { ResStatus, BaseRes } from "@shared/index";
import UserService from "../services/UserService";
import validator from "validator";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

export const registrationValidation = (
  email: string,
  password: string,
  username: string,
  res: Response<BaseRes>
) => {
  if (
    !usernameValidation(username, res) ||
    !emailValidation(email, res) ||
    !passwordValidation(password, res)
  ) {
    return false;
  }

  return true;
};

export const loginValidation = (
  email: string,
  password: string,
  res: Response<BaseRes>
) => {
  if (!emailValidation(email, res) || !passwordValidation(password, res)) {
    return false;
  }

  return true;
};

export const usernameValidation = (
  username: string,
  res: Response<BaseRes>
) => {
  if (username.trim().length < 6 || username.trim().length > 16) {
    res.status(ResStatus.INVALID_CREDENTIALS).json({
      message: "Username length must be longer than 5 and shorter than 17",
    });
    return false;
  }

  return true;
};

export const emailValidation = (email: string, res: Response<BaseRes>) => {
  if (!validator.isEmail(email)) {
    res
      .status(ResStatus.INVALID_CREDENTIALS)
      .json({ message: "Incorrect email" });
    return false;
  }

  return true;
};

export const passwordValidation = (
  password: string,
  res: Response<BaseRes>
) => {
  if (password.trim().length < 8 || password.trim().length > 32) {
    res.status(ResStatus.INVALID_CREDENTIALS).json({
      message: "Password length must be longer than 7 and shorter than 33",
    });
    return false;
  }

  return true;
};

export const isCorrectPassword = async (
  password: string,
  userId: string,
  res: Response<BaseRes>
) => {
  const passwordEntity = await UserService.getPasswordById(userId);
  if (!passwordEntity) {
    throw new Error("No password found");
  }

  const isPasswordMatch = await bcrypt.compare(
    password,
    passwordEntity.password
  );

  if (!isPasswordMatch) {
    res
      .status(ResStatus.INVALID_CREDENTIALS)
      .json({ message: "Incorrect password" });

    return false;
  }

  return true;
};

export const isEmailExist = async (email: string, res: Response<BaseRes>) => {
  const user = await UserService.getByEmail(email);
  if (user) {
    res
      .status(ResStatus.INVALID_CREDENTIALS)
      .json({ message: "Email is already in use" });

    return true;
  }

  return false;
};

export const isUsernameExist = async (
  username: string,
  res: Response<BaseRes>
) => {
  const user = await UserService.getByUsername(username);
  if (user) {
    res
      .status(ResStatus.INVALID_CREDENTIALS)
      .json({ message: "Username is already in use" });

    return true;
  }

  return false;
};

export const deleteUserAvatar = (userId: string) => {
  const filename = `avatar-${userId}.jpg`;
  const filePath = path.join("uploads/avatars", filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
