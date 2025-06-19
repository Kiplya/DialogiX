import { Server } from "socket.io";
import * as cookie from "cookie";
import { verifyAccessToken } from "./jwt";

const socketHandler = (io: Server) => {
  io.on("connection", (socket) => {
    socket.use((_, next) => {
      try {
        const cookies = cookie.parse(socket.handshake.headers.cookie || "");
        const refreshToken = cookies["refreshToken"];

        const accessToken: string | undefined =
          socket.handshake.auth.accessToken;
        const userAgent = socket.handshake.headers["user-agent"];

        if (!accessToken || !refreshToken || !userAgent) {
          throw new Error("Invalid authentication data");
        }

        const payload = verifyAccessToken(accessToken);
        if (payload.userAgent !== userAgent) {
          throw new Error("Invalid user-agent");
        }

        socket.data.isAuth = true;
      } catch {
        socket.data.isAuth = false;
      } finally {
        next();
      }
    });
  });
};

export default socketHandler;
