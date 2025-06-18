import dotenv from "dotenv";
import express from "express";
import router from "./src/routers/index";
import cookieParser from "cookie-parser";
import checkDbConnection from "./src/utils/checkDbConnection";
import TokenService from "./src/services/TokenService";
import cors from "cors";

dotenv.config();
const app = express();

if (process.env.MODE === "development") {
  app.use(
    cors({
      origin: "http://localhost:1000",
      credentials: true,
    })
  );
}

app.use(express.json());
app.use(cookieParser());
app.use("/", router);

const PORT = process.env.BACKEND_PORT;

const setupApp = async () => {
  await checkDbConnection();
  await TokenService.deleteExpiredTokens();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

setupApp();
