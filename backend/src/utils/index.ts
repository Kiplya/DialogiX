import { Response } from "express";
import { BaseRes, ResStatus } from "@shared/index";

export const resServerError = (res: Response<BaseRes>, err: unknown) => {
  console.error(err);
  res
    .status(ResStatus.INTERNAL_SERVER_ERROR)
    .json({ message: "Internal server error" });
};

export const getChatIdByUsersId = (userId_1: string, userId_2: string) => {
  return [userId_1, userId_2].sort().join("_");
};
