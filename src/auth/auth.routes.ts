import express from "express";
import { register, login } from "./auth.controller";

export const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);