import { Response } from "express";
import { BaseRes, ResStatus } from "@shared/index";

export const resServerError = (res: Response<BaseRes>, err: unknown) => {
  console.error(err);
  res
    .status(ResStatus.INTERNAL_SERVER_ERROR)
    .json({ message: "Internal server error" });
};
