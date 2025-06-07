import { Habit } from "@/services/firestore/database-service";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

// Calculates progress for a single habit.
export const getProgress = (habit: Habit) => {
  const completions = habit.completions ?? [];
  
  // For habits with scheduledDays (weekly habits)
  if (habit.scheduledDays && habit.scheduledDays.length > 0) {
    // Calculate total possible completions since creation
    const createdAt = habit.createdAt ? dayjs(habit.createdAt.toDate()) : dayjs();
    const daysSinceCreation = dayjs().diff(createdAt, 'day') + 1;
    const weeksSinceCreation = Math.ceil(daysSinceCreation / 7);
    const totalPossibleCompletions = habit.scheduledDays.length * weeksSinceCreation;
    
    if (totalPossibleCompletions === 0) return 0;
    
    // Only count completions that match the current schedule
    const validCompletions = completions.filter(completion => {
      const completionDate = dayjs(completion.date);
      const dayOfWeek = completionDate.format('dddd').toLowerCase();
      return habit.scheduledDays!.includes(dayOfWeek);
    });
    
    return Math.max(0, Math.min(1, validCompletions.length / totalPossibleCompletions));
  }
  
  // For habits with specific scheduledDates
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
    // For habits with scheduledDays (weekly habits)
    if (habit.scheduledDays && habit.scheduledDays.length > 0) {
      // Count how many of the scheduled days fall within this week
      const daysInWeek: string[] = [];
      for (let i = 0; i < 7; i++) {
        const day = startOfWeek.add(i, 'day');
        const dayName = day.format('dddd').toLowerCase();
        if (habit.scheduledDays.includes(dayName)) {
          daysInWeek.push(day.format('YYYY-MM-DD'));
        }
      }
      totalScheduled += daysInWeek.length;

      // Count completions for those specific days
      const completedThisWeek = (habit.completions ?? []).filter(c =>
        daysInWeek.includes(c.date)
      );
      totalCompleted += completedThisWeek.length;
    } 
    // For habits with specific scheduledDates
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
    // For daily habits without specific scheduling
    else {
      // Count all 7 days of the week as scheduled
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
    const date = today.subtract(i, "day");
    const dateString = date.format("YYYY-MM-DD");
    const dayName = date.format('dddd').toLowerCase();
    let completed = 0;
    let scheduled = 0;

    habits.forEach(habit => {
      // Check if habit is scheduled for this day
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

// Calculates the completion percentage for overall habit completions.
export function getOverallCompletionStats(habits: Habit[]) {
  let totalScheduled = 0;
  let totalCompleted = 0;

  habits.forEach(habit => {
    // For habits with scheduledDays (weekly habits)
    if (habit.scheduledDays && habit.scheduledDays.length > 0) {
      // Calculate total possible completions since creation
      const createdAt = habit.createdAt ? dayjs(habit.createdAt.toDate()) : dayjs();
      const daysSinceCreation = dayjs().diff(createdAt, 'day') + 1;
      const weeksSinceCreation = Math.ceil(daysSinceCreation / 7);
      
      totalScheduled += habit.scheduledDays.length * weeksSinceCreation;
      
      // Only count completions that match the current schedule
      // This prevents the 400% issue when someone edits their habit from 4 days to 1 day
      const validCompletions = (habit.completions ?? []).filter(completion => {
        const completionDate = dayjs(completion.date);
        const dayOfWeek = completionDate.format('dddd').toLowerCase();
        return habit.scheduledDays!.includes(dayOfWeek);
      });
      
      totalCompleted += validCompletions.length;
    }
    // For habits with specific scheduledDates
    else if (habit.scheduledDates && habit.scheduledDates.length > 0) {
      totalScheduled += habit.scheduledDates.length;
      
      // Only count completions that are in the scheduled dates
      const validCompletions = (habit.completions ?? []).filter(completion => 
        habit.scheduledDates!.includes(completion.date)
      );
      
      totalCompleted += validCompletions.length;
    }
    // For daily habits without specific scheduling
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