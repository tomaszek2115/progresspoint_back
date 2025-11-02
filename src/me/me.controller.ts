import { Request, Response } from "express";
import prisma from "../prisma";
import { computeStreakFromWorkouts, uniqueSortedDateKeys } from "./utils";

export const me = async (req: Request, res: Response) => {
    try {
        const userId = req.user;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // get data about particular user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, email: true, username: true , createdAt: true
            },
        });
        // get descending list of workouts for this user
        const workouts = await prisma.workout.findMany({
            where: { userId },
            select: { startedAt: true },
            orderBy: { startedAt: 'desc' }
        });

        // total workouts
        const totalWorkouts = await prisma.workout.count({ where: { userId } });

        // compute current streak based on consecutive days ending at most recent workout
        const currentStreak = computeStreakFromWorkouts(workouts);

        // unique days trained
        const days = uniqueSortedDateKeys(workouts);

        // get date of most recent workout
        const lastWorkoutDate = days.length > 0 ? days[0] : null;

        return res.json({ user, totalWorkouts, currentStreak, days, lastWorkoutDate });
    } catch (err) {
        console.error("Error fetching user profile:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}