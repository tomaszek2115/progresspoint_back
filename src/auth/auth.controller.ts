import { Request, Response } from "express";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";
import prisma from "../prisma";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, username, passwordHash: hashed },
      select: { id: true, email: true, username: true },
    });

    const token = generateToken(user.id);
    res.status(201).json({ user, token });

  } catch (err: any) {
    if (err.code === "P2002") {
      // Prisma: unique constraint failed
      return res.status(409).json({ error: "Email already exists" });
    }

    console.error("Error during registration:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });  
    }

    const userRecord = await prisma.user.findUnique({
      where: { email },
    });

    if (!userRecord) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await comparePassword(password, userRecord.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = {
      id: userRecord.id,
      email: userRecord.email,
      username: userRecord.username,
    };

    const token = generateToken(user.id);
    return res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};