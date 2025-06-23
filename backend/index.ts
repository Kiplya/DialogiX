import dotenv from "dotenv";
import express from "express";
import router from "./src/routers/index";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import checkDbConnection from "./src/utils/checkDbConnection";
import TokenService from "./src/services/TokenService";
import socketHandler from "./src/utils/socketHandler";
import cors from "cors";

dotenv.config();
const app = express();

const isDev = process.env.MODE === "development";
const corsOptions = {
  origin: "http://localhost:1000",
  credentials: true,
};

if (isDev) {
  app.use(cors(corsOptions));
}

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use("/", router);

const PORT = process.env.BACKEND_PORT;

const setupApp = async () => {
  await checkDbConnection();
  await TokenService.deleteExpiredTokens();

  const httpServer = createServer(app);

  const io = isDev
    ? new Server(httpServer, { cors: corsOptions })
    : new Server(httpServer);

  socketHandler(io);

  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

setupApp();
