import request from "supertest";
import { app } from "../../app";
import prisma from "../../prisma";
import { resetDatabase } from "../../test/utils";

describe("Workout routes", () => {
    let authToken: string;
    let userId: string;
    let exerciseId1: string;
    let exerciseId2: string;

    beforeEach(async () => {
        await resetDatabase();

        // Create a test user and get auth token
        const registerRes = await request(app)
            .post("/auth/register")
            .send({ 
                email: "workout@test.com", 
                username: "workoutuser", 
                password: "password123" 
            });
        
        authToken = registerRes.body.token;
        userId = registerRes.body.user.id;

        // Create test exercises
        const exercise1 = await prisma.exercise.create({
            data: { name: "Bench Press", category: "chest" }
        });
        const exercise2 = await prisma.exercise.create({
            data: { name: "Squat", category: "legs" }
        });

        exerciseId1 = exercise1.id;
        exerciseId2 = exercise2.id;
    });

    describe("POST /workout", () => {
        it("should create a workout with exercises and sets", async () => {
            const workoutData = {
                startedAt: "2025-10-31T18:00:00Z",
                durationMinutes: 60,
                note: "Great workout today!",
                exercises: [
                    {
                        exerciseId: exerciseId1,
                        order: 1,
                        sets: [
                            { setNumber: 1, repetitions: 10, weight: 100 },
                            { setNumber: 2, repetitions: 8, weight: 110 }
                        ]
                    },
                    {
                        exerciseId: exerciseId2,
                        order: 2,
                        sets: [
                            { setNumber: 1, repetitions: 12, weight: 80 }
                        ]
                    }
                ]
            };

            const res = await request(app)
                .post("/workout")
                .set("Authorization", `Bearer ${authToken}`)
                .send(workoutData);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("id");
            expect(res.body.userId).toBe(userId);
            expect(res.body.durationMinutes).toBe(60);
            expect(res.body.note).toBe("Great workout today!");
            expect(res.body.workoutExercises).toHaveLength(2);
            
            // Check first exercise
            const firstExercise = res.body.workoutExercises.find((we: any) => we.order === 1);
            expect(firstExercise.exerciseId).toBe(exerciseId1);
            expect(firstExercise.exercise.name).toBe("Bench Press");
            expect(firstExercise.sets).toHaveLength(2);
            expect(firstExercise.sets[0].repetitions).toBe(10);
            expect(firstExercise.sets[0].weight).toBe(100);
        });

        it("should create a workout without a note", async () => {
            const workoutData = {
                startedAt: "2025-10-31T18:00:00Z",
                durationMinutes: 45,
                exercises: [
                    {
                        exerciseId: exerciseId1,
                        order: 1,
                        sets: [
                            { setNumber: 1, repetitions: 10, weight: 100 }
                        ]
                    }
                ]
            };

            const res = await request(app)
                .post("/workout")
                .set("Authorization", `Bearer ${authToken}`)
                .send(workoutData);

            expect(res.status).toBe(201);
            expect(res.body.note).toBeNull();
        });

        it("should fail without authentication", async () => {
            const workoutData = {
                startedAt: "2025-10-31T18:00:00Z",
                durationMinutes: 60,
                exercises: [
                    {
                        exerciseId: exerciseId1,
                        order: 1,
                        sets: [
                            { setNumber: 1, repetitions: 10, weight: 100 }
                        ]
                    }
                ]
            };

            const res = await request(app)
                .post("/workout")
                .send(workoutData);

            expect(res.status).toBe(401);
        });

        it("should fail with missing required fields (no startedAt)", async () => {
            const workoutData = {
                durationMinutes: 60,
                exercises: [
                    {
                        exerciseId: exerciseId1,
                        order: 1,
                        sets: [
                            { setNumber: 1, repetitions: 10, weight: 100 }
                        ]
                    }
                ]
            };

            const res = await request(app)
                .post("/workout")
                .set("Authorization", `Bearer ${authToken}`)
                .send(workoutData);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Missing required fields");
        });

        it("should fail with missing required fields (no exercises)", async () => {
            const workoutData = {
                startedAt: "2025-10-31T18:00:00Z",
                durationMinutes: 60,
                exercises: []
            };

            const res = await request(app)
                .post("/workout")
                .set("Authorization", `Bearer ${authToken}`)
                .send(workoutData);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Missing required fields");
        });

        it("should fail with negative duration", async () => {
            const workoutData = {
                startedAt: "2025-10-31T18:00:00Z",
                durationMinutes: -10,
                exercises: [
                    {
                        exerciseId: exerciseId1,
                        order: 1,
                        sets: [
                            { setNumber: 1, repetitions: 10, weight: 100 }
                        ]
                    }
                ]
            };

            const res = await request(app)
                .post("/workout")
                .set("Authorization", `Bearer ${authToken}`)
                .send(workoutData);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("Duration must not be negative");
        });

        it("should fail with non-existent exercise", async () => {
            const workoutData = {
                startedAt: "2025-10-31T18:00:00Z",
                durationMinutes: 60,
                exercises: [
                    {
                        exerciseId: "00000000-0000-0000-0000-000000000000",
                        order: 1,
                        sets: [
                            { setNumber: 1, repetitions: 10, weight: 100 }
                        ]
                    }
                ]
            };

            const res = await request(app)
                .post("/workout")
                .set("Authorization", `Bearer ${authToken}`)
                .send(workoutData);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("one or more exercises not found");
        });

        it("should fail when one of multiple exercises doesn't exist", async () => {
            const workoutData = {
                startedAt: "2025-10-31T18:00:00Z",
                durationMinutes: 60,
                exercises: [
                    {
                        exerciseId: exerciseId1,
                        order: 1,
                        sets: [
                            { setNumber: 1, repetitions: 10, weight: 100 }
                        ]
                    },
                    {
                        exerciseId: "00000000-0000-0000-0000-000000000000",
                        order: 2,
                        sets: [
                            { setNumber: 1, repetitions: 10, weight: 100 }
                        ]
                    }
                ]
            };

            const res = await request(app)
                .post("/workout")
                .set("Authorization", `Bearer ${authToken}`)
                .send(workoutData);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe("one or more exercises not found");
        });

        it("should create workout with multiple sets per exercise", async () => {
            const workoutData = {
                startedAt: "2025-10-31T18:00:00Z",
                durationMinutes: 90,
                exercises: [
                    {
                        exerciseId: exerciseId1,
                        order: 1,
                        sets: [
                            { setNumber: 1, repetitions: 12, weight: 80 },
                            { setNumber: 2, repetitions: 10, weight: 90 },
                            { setNumber: 3, repetitions: 8, weight: 100 },
                            { setNumber: 4, repetitions: 6, weight: 110 }
                        ]
                    }
                ]
            };

            const res = await request(app)
                .post("/workout")
                .set("Authorization", `Bearer ${authToken}`)
                .send(workoutData);

            expect(res.status).toBe(201);
            expect(res.body.workoutExercises[0].sets).toHaveLength(4);
            expect(res.body.workoutExercises[0].sets[3].weight).toBe(110);
        });
    });
})