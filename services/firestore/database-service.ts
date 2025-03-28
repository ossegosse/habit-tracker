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

export type Habit = {
    id?: string;
    title: string;
    description: string;
    frequency: string[];
    createdAt?: Timestamp;
    userId?: string;
}

// Add a new habit to the database
export const addHabit = async (habitData: Omit<Habit, 'id' | 'userId' | 'createdAt'>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    return await addDoc(collection(db, 'habits'), {
        ...habitData,
        userId: user.uid,
        createdAt: Timestamp.now()
    });
}

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
    return await updateDoc(habitRef, habitData);
}

// Delete a habit
export const deleteHabit = async (habitId: string) => {
    return await deleteDoc(doc(db, 'habits', habitId));
}

