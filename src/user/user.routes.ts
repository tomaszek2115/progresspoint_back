import express from "express";
import { changeUsername, changePassword, uploadProfilePicture, deleteProfilePicture } from "./user.controller";
import { getProfilePicture } from "./user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../utils/uploadService";

export const userRouter = express.Router();

userRouter.put("/username", authMiddleware, changeUsername);
userRouter.put("/password", authMiddleware, changePassword);
userRouter.post("/picture", authMiddleware, upload.single("picture"), uploadProfilePicture);
userRouter.get("/picture", authMiddleware, getProfilePicture);
userRouter.delete("/picture", authMiddleware, deleteProfilePicture);
