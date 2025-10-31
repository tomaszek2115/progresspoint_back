import express from "express";
import { changeUsername, changePassword } from "./user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const userRouter = express.Router();

userRouter.put("/username", authMiddleware, changeUsername);
userRouter.put("/password", authMiddleware, changePassword);
