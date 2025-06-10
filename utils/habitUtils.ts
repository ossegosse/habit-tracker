/**
 * Utility functions for habit calculations and statistics.
 * Handles progress tracking, streak calculations, and completion stats.
 */

import { Habit } from "@/services/firestore/database-service";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

/**
 * Calculates the completion progress for a habit as a percentage (0-1).
 * Handles both weekly scheduled habits and specific date-based habits.
 * @param habit - The habit to calculate progress for
 * @returns Progress value between 0 and 1
 */
export const getProgress = (habit: Habit) => {
  if (!habit) return 0;
  
  const completions = habit.completions ?? [];
  
  // Handle weekly scheduled habits
  if (habit.scheduledDays && habit.scheduledDays.length > 0) {
    const createdAt = habit.createdAt ? dayjs(habit.createdAt.toDate()) : dayjs();
    
    if (!createdAt.isValid()) {
      console.warn('Invalid habit creation date:', habit.createdAt);
      return 0;
    }
    
    const daysSinceCreation = dayjs().diff(createdAt, 'day') + 1;
    const weeksSinceCreation = Math.ceil(daysSinceCreation / 7);
    const totalPossibleCompletions = habit.scheduledDays.length * weeksSinceCreation;
    
    if (totalPossibleCompletions === 0) return 0;
    
    // Only count completions that match the current schedule
    const validCompletions = completions.filter(completion => {
      if (!completion || !completion.date) return false;
      
      const completionDate = dayjs(completion.date);
      if (!completionDate.isValid()) {
        console.warn('Invalid completion date:', completion.date);
        return false;
      }
      
      const dayOfWeek = completionDate.format('dddd').toLowerCase();
      return habit.scheduledDays!.includes(dayOfWeek);
    });
    
    return Math.max(0, Math.min(1, validCompletions.length / totalPossibleCompletions));
  }
  
  // Handle specific date-based habits
  const scheduledDates = habit.scheduledDates ?? [];
  if (scheduledDates.length === 0) return 0;
  
  const completed = scheduledDates.filter(date => {
    if (!date) return false;
    return completions.some((c) => c && c.date === date);
  }).length;
  
  const progress = completed / scheduledDates.length;
  return Math.max(0, Math.min(1, progress));
};

/**
 * Calculates weekly completion statistics for all habits.
 * Considers different habit types (weekly, specific dates, daily).
 * @param habits - Array of habits to analyze
 * @returns Object containing weekly completion stats
 */
export function getWeeklyCompletionStats(habits: Habit[]) {
  const startOfWeek = dayjs().startOf("week");
  const endOfWeek = dayjs().endOf("week");

  let totalScheduled = 0;
  let totalCompleted = 0;

  habits.forEach(habit => {
    // Handle weekly scheduled habits
    if (habit.scheduledDays && habit.scheduledDays.length > 0) {
      const daysInWeek: string[] = [];
      for (let i = 0; i < 7; i++) {
        const day = startOfWeek.add(i, 'day');
        const dayName = day.format('dddd').toLowerCase();
        if (habit.scheduledDays.includes(dayName)) {
          daysInWeek.push(day.format('YYYY-MM-DD'));
        }
      }
      totalScheduled += daysInWeek.length;

      const completedThisWeek = (habit.completions ?? []).filter(c =>
        daysInWeek.includes(c.date)
      );
      totalCompleted += completedThisWeek.length;
    } 
    // Handle specific date-based habits
    else if (habit.scheduledDates && habit.scheduledDates.length > 0) {
      const scheduledThisWeek = habit.scheduledDates.filter(date =>
        dayjs(date).isBetween(startOfWeek, endOfWeek, null, "[]")
      );
      totalScheduled += scheduledThisWeek.length;

      const completedThisWeek = (habit.completions ?? []).filter(c =>
        dayjs(c.date).isBetween(startOfWeek, endOfWeek, null, "[]") &&
        habit.scheduledDates!.includes(c.date)
      );
      totalCompleted += completedThisWeek.length;
    }
    // Handle daily habits without specific scheduling
    else {
      totalScheduled += 7;
      
      const completedThisWeek = (habit.completions ?? []).filter(c =>
        dayjs(c.date).isBetween(startOfWeek, endOfWeek, null, "[]")
      );
      totalCompleted += completedThisWeek.length;
    }
  });

  const percent = totalScheduled === 0 ? 0 : (totalCompleted / totalScheduled) * 100;

  return {
    totalScheduled,
    totalCompleted,
    percent,
  };
}

/**
 * Calculates the current streak for a habit (consecutive days completed).
 * Works backwards from today to find the longest current streak.
 * @param habit - The habit to calculate streak for
 * @returns Number of consecutive days the habit has been completed
 */
export function getCurrentStreak(habit: Habit): number {
  if (!habit || !habit.completions || !Array.isArray(habit.completions)) {
    return 0;
  }

  const completions = habit.completions
    .filter(completion => completion && completion.date)
    .map(c => c.date)
    .sort((a, b) => dayjs(b).diff(dayjs(a))); // Sort in descending order

  if (completions.length === 0) {
    return 0;
  }

  let streak = 0;
  let current = dayjs();

  for (const date of completions) {
    const completionDate = dayjs(date);
    if (!completionDate.isValid()) {
      console.warn(`Invalid completion date: ${date}`);
      continue;
    }

    if (current.format("YYYY-MM-DD") === date) {
      streak++;
      current = current.subtract(1, "day");
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Generates completion graph data for visualization charts.
 * Creates daily completion vs scheduled data points.
 * @param habits - Array of habits to analyze
 * @param days - Number of days to include in the graph (default: 7)
 * @returns Array of data points with date, completed, and scheduled counts
 */
export function getCompletionGraphData(habits: Habit[], days: number = 7) {
  const today = dayjs();
  const data = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = today.subtract(i, "day");
    const dateString = date.format("YYYY-MM-DD");
    const dayName = date.format('dddd').toLowerCase();
    let completed = 0;
    let scheduled = 0;

    habits.forEach(habit => {
      let isScheduled = false;
      
      if (habit.scheduledDays && habit.scheduledDays.length > 0) {
        isScheduled = habit.scheduledDays.includes(dayName);
      } else if (habit.scheduledDates && habit.scheduledDates.length > 0) {
        isScheduled = habit.scheduledDates.includes(dateString);
      } else {
        // Daily habit without specific scheduling
        isScheduled = true;
      }
      
      if (isScheduled) scheduled++;
      if (habit.completions?.some(c => c.date === dateString)) completed++;
    });

    data.push({ date: dateString, completed, scheduled });
  }

  return data;
}

/**
 * Calculates overall completion statistics across all habits.
 * Provides all-time completion percentages and totals.
 * @param habits - Array of habits to analyze
 * @returns Object containing overall completion stats
 */
export function getOverallCompletionStats(habits: Habit[]) {
  let totalScheduled = 0;
  let totalCompleted = 0;

  habits.forEach(habit => {
    // Handle weekly scheduled habits
    if (habit.scheduledDays && habit.scheduledDays.length > 0) {
      const createdAt = habit.createdAt ? dayjs(habit.createdAt.toDate()) : dayjs();
      const daysSinceCreation = dayjs().diff(createdAt, 'day') + 1;
      const weeksSinceCreation = Math.ceil(daysSinceCreation / 7);
      
      totalScheduled += habit.scheduledDays.length * weeksSinceCreation;
      
      // Only count completions that match the current schedule
      const validCompletions = (habit.completions ?? []).filter(completion => {
        const completionDate = dayjs(completion.date);
        const dayOfWeek = completionDate.format('dddd').toLowerCase();
        return habit.scheduledDays!.includes(dayOfWeek);
      });
      
      totalCompleted += validCompletions.length;
    }
    // Handle specific date-based habits
    else if (habit.scheduledDates && habit.scheduledDates.length > 0) {
      totalScheduled += habit.scheduledDates.length;
      
      const validCompletions = (habit.completions ?? []).filter(completion => 
        habit.scheduledDates!.includes(completion.date)
      );
      
      totalCompleted += validCompletions.length;
    }
    // Handle daily habits without specific scheduling
    else {
      const createdAt = habit.createdAt ? dayjs(habit.createdAt.toDate()) : dayjs();
      const daysSinceCreation = dayjs().diff(createdAt, 'day') + 1;
      
      totalScheduled += daysSinceCreation;
      totalCompleted += habit.completions?.length ?? 0;
    }
  });

  const percent = totalScheduled === 0 ? 0 : (totalCompleted / totalScheduled) * 100;

  return { totalScheduled, totalCompleted, percent };
}