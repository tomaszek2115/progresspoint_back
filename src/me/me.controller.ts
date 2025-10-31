import { Request, Response } from "express";
import prisma from "../prisma";

export const me = async (req: Request, res: Response) => {
    try {
        const userId = req.user;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, email: true, username: true , createdAt: true, updatedAt: true
            },
        });
        return res.json({ user });
    } catch (err) {
        console.error("Error fetching user profile:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}