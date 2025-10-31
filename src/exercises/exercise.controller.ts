import { Request, Response } from "express";
import prisma from "../prisma";

// GET /exercises - return id and name of all exercises
export async function getExercises(req: Request, res: Response) {
  try {
    const exercises = await prisma.exercise.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return res.status(200).json(exercises);
  } catch (err) {
    console.error("Failed to fetch exercises", err);
    return res.status(500).json({ message: "Failed to fetch exercises" });
  }
}
