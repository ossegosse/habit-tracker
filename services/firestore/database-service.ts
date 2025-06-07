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

export type Habit = {
    id?: string;
    title: string;
    description: string;
    scheduledDates?: string[];
    scheduledDays?: string[]; // Days of week: ['monday', 'tuesday', etc.]
    timers?: { start: string; end: string; intervalMinutes: number };
    createdAt?: Timestamp;
    updatedAt?: Timestamp; // Track when habit was last modified
    userId?: string;
    category: string;
    icon: ComponentProps<typeof Ionicons>["name"];
    completions?: { date: string; time?: string }[];
}

// Add a new habit to the database
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

// Marks a habit as completed
export const completeHabit = async (habitId: string, date: string) => {
    const habitRef = doc(db, 'habits', habitId);
    const habitDoc = await getDoc(habitRef);

    if (!habitDoc.exists()) throw new Error('Habit not found');

    const data = habitDoc.data();
    // completions should be an array of objects
    const completions: { date: string; time?: string }[] = data.completions || [];

    // Avoid duplicates
    if (!completions.some(c => c.date === date)) {
        completions.push({ date });
        await updateDoc(habitRef, { completions });
    }
};

// Marks a habit as uncompleted (removes completion for a specific date)
export const uncompleteHabit = async (habitId: string, date: string) => {
    const habitRef = doc(db, 'habits', habitId);
    const habitDoc = await getDoc(habitRef);

    if (!habitDoc.exists()) throw new Error('Habit not found');

    const data = habitDoc.data();
    const completions: { date: string; time?: string }[] = data.completions || [];

    // Remove the completion for the specific date
    const updatedCompletions = completions.filter(c => c.date !== date);
    await updateDoc(habitRef, { completions: updatedCompletions });
};

// Get all habits for the current user
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

// Get a single habit
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

// Update a habit
export const updateHabit = async (habitId: string, habitData: Partial<Habit>) => {
    const habitRef = doc(db, 'habits', habitId);
    return await updateDoc(habitRef, {
        ...habitData,
        updatedAt: Timestamp.now(),
    });
}

// Delete a habit
export const deleteHabit = async (habitId: string) => {
    return await deleteDoc(doc(db, 'habits', habitId));
}

