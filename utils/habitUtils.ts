import { Habit } from "@/services/firestore/database-service";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

// Calculates progress for a single habit.
export const getProgress = (habit: Habit) => {
  const completions = habit.completions ?? [];
  const scheduledDates = habit.scheduledDates ?? [];
  if (scheduledDates.length === 0) return 0;
  const completed = scheduledDates.filter(date =>
    completions.some((c) => c.date === date)
  ).length;
  const progress = completed / scheduledDates.length;
  return Math.max(0, Math.min(1, progress)); // Clamp between 0 and 1
};

// Calculates weekly completion stats for all habits.
export function getWeeklyCompletionStats(habits: Habit[]) {
  const startOfWeek = dayjs().startOf("week");
  const endOfWeek = dayjs().endOf("week");

  let totalScheduled = 0;
  let totalCompleted = 0;

  habits.forEach(habit => {
    // Scheduled dates this week
    const scheduledThisWeek = (habit.scheduledDates ?? []).filter(date =>
      dayjs(date).isBetween(startOfWeek, endOfWeek, null, "[]")
    );
    totalScheduled += scheduledThisWeek.length;

    // Completions this week
    const completedThisWeek = (habit.completions ?? []).filter(c =>
      dayjs(c.date).isBetween(startOfWeek, endOfWeek, null, "[]")
    );
    totalCompleted += completedThisWeek.length;
  });

  const percent = totalScheduled === 0 ? 0 : (totalCompleted / totalScheduled) * 100;

  return {
    totalScheduled,
    totalCompleted,
    percent,
  };
}

// Calculates the current streak for a habit.
export function getCurrentStreak(habit: Habit): number {
  const completions = (habit.completions ?? [])
    .map(c => c.date)
    .sort((a, b) => dayjs(b).diff(dayjs(a))); // Descending

  let streak = 0;
  let current = dayjs();

  for (const date of completions) {
    if (current.format("YYYY-MM-DD") === date) {
      streak++;
      current = current.subtract(1, "day");
    } else {
      break;
    }
  }
  return streak;
}

// Calculates the completion graph data for a habit.
export function getCompletionGraphData(habits: Habit[], days: number = 7) {
  const today = dayjs();
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = today.subtract(i, "day").format("YYYY-MM-DD");
    let completed = 0;
    let scheduled = 0;

    habits.forEach(habit => {
      if (habit.scheduledDates?.includes(date)) scheduled++;
      if (habit.completions?.some(c => c.date === date)) completed++;
    });

    data.push({ date, completed, scheduled });
  }

  return data;
}

// Calculates the completion percentage for overall habit completions.
export function getOverallCompletionStats(habits: Habit[]) {
  let totalScheduled = 0;
  let totalCompleted = 0;

  habits.forEach(habit => {
    totalScheduled += habit.scheduledDates?.length ?? 0;
    totalCompleted += habit.completions?.length ?? 0;
  });

  const percent = totalScheduled === 0 ? 0 : (totalCompleted / totalScheduled) * 100;

  return { totalScheduled, totalCompleted, percent };
}