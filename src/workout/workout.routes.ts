import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware'

export const workoutRouter = express.Router()