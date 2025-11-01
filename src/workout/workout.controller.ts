import { Request, Response } from "express"
import prisma from "../prisma"

// define the shape of the request body
// IMPORTANT
// frontend should send date data with Z on the end "2025-10-31T19:45:00.000Z"

interface CreateWorkoutBody {
    startedAt: string;
    durationMinutes: number;
    note?: string;
    exercises: {
        exerciseId: string;
        order: number;
        sets: {
            setNumber: number;
            repetitions: number;
            weight: number;
        }[];
    }[];
}

export const createWorkout = async (req: Request, res: Response) => {
    try {
        // check if theres a user id
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized"})
        }
        // get user id
        const userId = req.user;
        // get data from request body
        const { startedAt, durationMinutes, note, exercises}: CreateWorkoutBody = req.body;
        // validation
        if (!startedAt || !durationMinutes || !exercises || exercises.length === 0) {
            return res.status(400).json({ message: "Missing required fields"});
        }
        // check if duration is not negative
        if (durationMinutes < 0) {
            return res.status(400).json({ message: "Duration must not be negative"})
        }
        // verify that all exercises exists
        const exerciseIds = exercises.map(e => e.exerciseId);
        const existingExercises = await prisma.exercise.findMany({
            where: { id: {in: exerciseIds }},
            select: { id: true }
        });
        if (existingExercises.length !== exerciseIds.length) {
            return res.status(400).json({ message: "one or more exercises not found"})
        }
        // create workout with nested releations
        const workout = await prisma.workout.create({
            data:{
                userId,
                startedAt: new Date(startedAt),
                durationMinutes,
                note: note,
                workoutExercises: {
                    create: exercises.map(exercise => ({
                        exerciseId: exercise.exerciseId,
                        order: exercise.order,
                        sets: {
                            create: exercise.sets.map(set => ({
                                setNumber: set.setNumber,
                                repetitions: set.repetitions,
                                weight: set.weight
                            }))
                        }
                    }))
                }
            },
            include: {
                workoutExercises: {
                    include: {
                        exercise: { select: { id: true, name: true}},
                        sets: true
                    }
                }
            }
        });
        return res.status(201).json(workout);
    } catch (err) {
        console.error("Failed to create workout", err);
        return res.status(500).json({ message: "Internal server error"})
    }
}