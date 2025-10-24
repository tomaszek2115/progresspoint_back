import prisma from "../prisma";

export const resetDatabase = async () => {
  const tables = ['sets', 'workout_exercises', 'workouts', 'exercises', 'users'];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`
    );
  }
};