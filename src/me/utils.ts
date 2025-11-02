import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export type WorkoutLite = { startedAt: Date | null };

// Convert a Date to YYYY-MM-DD string in UTC (consistent with database storage)
export const toDateKey = (d: Date) => dayjs(d).utc().format("YYYY-MM-DD");

// Get a unique, sorted (desc) array of date keys from workouts
export const uniqueSortedDateKeys = (workouts: WorkoutLite[]) => {
	const keys = workouts
		.filter(w => !!w.startedAt)
		.map(w => toDateKey(w.startedAt as Date));
	return Array.from(new Set(keys)).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
};

// Calculate the current streak - only counts if last workout was today or yesterday
// Streak ends if the last workout was day before yesterday or earlier
// Example: Today is Nov 2, last workout was Nov 1 => streak continues
// Example: Today is Nov 2, last workout was Oct 31 => streak = 0 (ended)
export const calculateCurrentStreak = (dateKeysDesc: string[]): number => {
  if (dateKeysDesc.length === 0) return 0;
  
  const today = dayjs().utc().format("YYYY-MM-DD");
  const yesterday = dayjs().utc().subtract(1, "day").format("YYYY-MM-DD");
  const lastWorkoutDate = dateKeysDesc[0];
  
  // If last workout was day before yesterday or earlier, streak is broken
  if (lastWorkoutDate !== today && lastWorkoutDate !== yesterday) {
    return 0;
  }
  
  // Count consecutive days
  let streak = 1;
  for (let i = 1; i < dateKeysDesc.length; i++) {
    const prev = dayjs(dateKeysDesc[i - 1]);
    const cur = dayjs(dateKeysDesc[i]);
    if (prev.diff(cur, "day") === 1) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
};// Convenience: compute streak directly from workouts
export const computeStreakFromWorkouts = (workouts: WorkoutLite[]) => {
	const keys = uniqueSortedDateKeys(workouts);
	return calculateCurrentStreak(keys);
};