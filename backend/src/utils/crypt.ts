import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";

const ALGORITHM = "aes-256-cbc";
const SALT_ROUNDS = 10;

dotenv.config();
const IV = Buffer.from(process.env.CRYPT_IV!, "hex");
const KEY = Buffer.from(process.env.CRYPT_KEY!, "hex");

export const encrypt = (data: string) => {
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

export const decrypt = (encryptedData: string) => {
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, IV);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

export const hash = async (data: string) => {
  const hashedData = await bcrypt.hash(data, SALT_ROUNDS);
  return hashedData;
};
