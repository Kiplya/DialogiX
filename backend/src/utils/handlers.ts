import { PrismaClient } from "@prisma/client";
import multer from "multer";

export const uploadAvatar = multer({ dest: "uploads/avatar/" });
export const prisma = new PrismaClient();
