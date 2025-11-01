import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { createWorkout, getWorkout } from './workout.controller'

export const workoutRouter = express.Router()

workoutRouter.post("/", authMiddleware, createWorkout)
workoutRouter.get("/", authMiddleware, getWorkout)