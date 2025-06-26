import { PrismaClient } from "@prisma/client";
import { JwtPayload } from "@shared/index";
import { Request } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";

export const uploadAvatar = multer({
  storage: multer.diskStorage({
    destination: "uploads/avatars/",
    filename: (req: Request & { user?: JwtPayload }, _, cb) => {
      const filename = `avatar-${req.user!.userId}.jpg`;
      const filePath = path.join("uploads/avatars", filename);

      if (fs.existsSync(filePath)) {
        fs.renameSync(filePath, filePath + ".backup");
      }

      cb(null, filename);
    },
  }),
});

export const prisma = new PrismaClient();
