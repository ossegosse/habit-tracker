/**
 * Authentication service for Firebase Auth operations.
 * Provides user registration, login, logout, and state change monitoring.
 */

import { auth } from '../../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

/**
 * Registers a new user with email and password.
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise resolving to UserCredential
 */
export const registerUser = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Signs in an existing user with email and password.
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise resolving to UserCredential
 */
export const loginUser = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Signs out the currently authenticated user.
 * @returns Promise<boolean> - True if successful
 */
export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
        return true;
    } catch (error: any) {
        console.error("Error signing out:", error)
        throw error;
    }
};

/**
 * Subscribes to authentication state changes.
 * @param callback - Function called when auth state changes
 * @returns Unsubscribe function
 */
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
}