/**
 * Database service for managing habit-related operations in Firestore.
 * Provides CRUD operations for habits with proper authentication checks.
 */

import { ComponentProps } from 'react';
import { db } from '../../config/firebase';
import { auth } from '../../config/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

/**
 * Represents a habit in the system with all its properties and tracking data.
 */
export type Habit = {
    id?: string;
    title: string;
    description: string;
    scheduledDates?: string[]; // Specific dates when habit should be performed
    scheduledDays?: string[]; // Days of week: ['monday', 'tuesday', etc.]
    timers?: { start: string; end: string; intervalMinutes: number };
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    userId?: string;
    category: string;
    icon: ComponentProps<typeof Ionicons>["name"];
    completions?: { date: string; time?: string }[]; // Tracking completion history
}

/**
 * Creates a new habit in the database.
 * @param habitData - Habit data without id, userId, and createdAt (auto-generated)
 * @returns Promise resolving to the created document reference
 */
export const addHabit = async (habitData: Omit<Habit, 'id' | 'userId' | 'createdAt'>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    return await addDoc(collection(db, 'habits'), {
        ...habitData,
        userId: user.uid,
        createdAt: Timestamp.now(),
        completions: [],
    });
}

/**
 * Marks a habit as completed for a specific date.
 * Prevents duplicate completions for the same date.
 * @param habitId - The habit's document ID
 * @param date - Date string in YYYY-MM-DD format
 */
export const completeHabit = async (habitId: string, date: string) => {
    const habitRef = doc(db, 'habits', habitId);
    const habitDoc = await getDoc(habitRef);

    if (!habitDoc.exists()) throw new Error('Habit not found');

    const data = habitDoc.data();
    const completions: { date: string; time?: string }[] = data.completions || [];

    if (!completions.some(c => c.date === date)) {
        completions.push({ date });
        await updateDoc(habitRef, { completions });
    }
};

/**
 * Removes a completion entry for a specific date.
 * @param habitId - The habit's document ID
 * @param date - Date string in YYYY-MM-DD format
 */
export const uncompleteHabit = async (habitId: string, date: string) => {
    const habitRef = doc(db, 'habits', habitId);
    const habitDoc = await getDoc(habitRef);

    if (!habitDoc.exists()) throw new Error('Habit not found');

    const data = habitDoc.data();
    const completions: { date: string; time?: string }[] = data.completions || [];

    const updatedCompletions = completions.filter(c => c.date !== date);
    await updateDoc(habitRef, { completions: updatedCompletions });
};

/**
 * Retrieves all habits belonging to the currently authenticated user.
 * @returns Promise resolving to an array of user's habits
 */
export const getUserHabits = async (): Promise<Habit[]> => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const q = query(collection(db, 'habits'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as Habit[];
}

/**
 * Retrieves a single habit by its ID.
 * @param habitId - The habit's document ID
 * @returns Promise resolving to the habit or null if not found
 */
export const getHabit = async (habitId: string): Promise<Habit | null> => {
    const habitRef = doc(db, 'habits', habitId);
    const habitDoc = await getDoc(habitRef);

    if (habitDoc.exists()) {
        return {
            id: habitDoc.id,
            ...habitDoc.data()
        } as Habit;
    }

    return null;
}

/**
 * Updates an existing habit with new data.
 * Automatically sets the updatedAt timestamp.
 * @param habitId - The habit's document ID
 * @param habitData - Partial habit data to update
 */
export const updateHabit = async (habitId: string, habitData: Partial<Habit>) => {
    const habitRef = doc(db, 'habits', habitId);
    return await updateDoc(habitRef, {
        ...habitData,
        updatedAt: Timestamp.now(),
    });
}

/**
 * Permanently deletes a habit from the database.
 * @param habitId - The habit's document ID
 */
export const deleteHabit = async (habitId: string) => {
    return await deleteDoc(doc(db, 'habits', habitId));
}

