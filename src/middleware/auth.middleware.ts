import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const payload = verifyToken(token) as { id: string }
    req.user = payload.id
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};