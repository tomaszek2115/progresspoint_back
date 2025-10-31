import express from "express";
import { getExercises } from "./exercise.controller";

export const exerciseRouter = express.Router();

// public endpoint to list available exercises
exerciseRouter.get("/", getExercises);
