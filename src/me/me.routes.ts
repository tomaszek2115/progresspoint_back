import express from "express";
import { me } from "./me.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const meRouter = express.Router();

meRouter.get("", authMiddleware, me)