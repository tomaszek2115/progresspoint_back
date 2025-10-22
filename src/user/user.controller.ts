import { Request, Response } from "express";
import prisma from "../prisma";
import { hashPassword } from "../utils/hash";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, username, passwordHash },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: "Could not create account" });
  }
};
