import express from "express";
import { changeUsername } from "./user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const userRouter = express.Router();

userRouter.put("/username", authMiddleware, changeUsername);
