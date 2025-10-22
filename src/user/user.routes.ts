import { Router } from "express";
import { getUsers, createUser } from "./user.controller";

const userRouter = Router();

// user routes
userRouter.get("/", getUsers);
userRouter.post("/", createUser);

export default userRouter;
