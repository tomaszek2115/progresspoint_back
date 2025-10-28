import { Request, Response } from "express";
import prisma from "../prisma";

export const changeUsername = async (req: Request, res: Response) => {
  try {
    const userId = req.user;
    const { newUsername } = req.body;

    if (!userId) {
       return res.status(401).json({ error: "Unauthorized"})
    }

    const existing = await prisma.user.findUnique({
      where: { username: newUsername } 
    })

    if (existing) {
      return res.status(409).json({ error: "Username already taken"});
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { username: newUsername }
    })
    res.status(200).json({ username: updated.username});
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}