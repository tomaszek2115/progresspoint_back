import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { createWorkout } from './workout.controller'

export const workoutRouter = express.Router()

workoutRouter.post("/", authMiddleware, createWorkout)