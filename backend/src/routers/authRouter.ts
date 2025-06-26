import { Router } from "express";
import { uploadAvatar } from "../utils/handlers";
import UserController from "../controllers/UserController";
import TokenController from "../controllers/TokenController";

const authRouter = Router();
authRouter.use(UserController.authMiddleware);

authRouter.post("/logout", UserController.logout);
authRouter.get("/getManyUsersByUsername", UserController.getManyByUsername);
authRouter.get("/getSelfById", UserController.getSelfById);

authRouter.delete(
  "/deleteAllTokensByUserId",
  TokenController.deleteAllByUserId
);
authRouter.delete("/deleteSelfUserById", UserController.deleteSelfById);
authRouter.put("/updatePassword", UserController.updatePassword);
authRouter.post("/comparePassword", UserController.comparePassword);
authRouter.put("/updateUsername", UserController.updateUsername);
authRouter.post(
  "/uploadAvatar",
  uploadAvatar.single("avatar"),
  UserController.uploadAvatar
);

export default authRouter;
