import { Request, Response } from "express";
import { hashPassword, comparePassword } from "../utils/hash";
import prisma from "../prisma";

// username change
export const changeUsername = async (req: Request, res: Response) => {
  try {
    // get user id from middleware
    const userId = req.user;
    // get username from the request body
    const { newUsername } = req.body;

    // if the user id is missing, return error
    if (!userId) {
       return res.status(401).json({ error: "Unauthorized"})
    }

    // check if the new username is already in use
    const existing = await prisma.user.findUnique({
      where: { username: newUsername } 
    })
    // return error if so
    if (existing) {
      return res.status(409).json({ error: "Username already taken"});
    }

    // update username in the database
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { username: newUsername }
    })
    res.status(200).json({ username: updated.username});
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

// password change
export const changePassword = async (req: Request, res: Response) => {
  try {
    // get user id from middleware
    const userId = req.user;
    // get old and new password
    const { oldPassword, newPassword } = req.body;
    // if new password is the same as the old one, return error
    if (oldPassword === newPassword) {
      return res.status(400).json({ error: "New password must be different from old password"});
    }
    // check user id
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized"});
    }
    // find exact user
    const userRecord = await prisma.user.findUnique({
      where: { id: userId }
    });
    // if no user found, return error
        if (!userRecord) {
      return res.status(404).json({ error: "User not found" });
    }
    // check if old password matches
    const valid = await comparePassword(oldPassword, userRecord!.passwordHash);
    // if not valid, return error
    if (!valid) {
      return res.status(401).json({ error: "Old password is incorrect"});
    }
    // hash new password
    const hashed = await hashPassword(newPassword);
    // update password in database
    await prisma.user.update({
      where: {id: userId },
      data: { passwordHash: hashed }
    });
    res.status(200).json({message: "Password changed successfully"});

  } catch (err) {
    res.status(500).json({ error: "Internal server error"});
  }
}