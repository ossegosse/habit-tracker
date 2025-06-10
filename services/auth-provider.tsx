/**
 * AuthProvider - Global authentication context for user session management.
 * 
 * Features:
 * - Real-time authentication state tracking
 * - Loading state management during auth changes
 * - Automatic session persistence
 * - Clean subscription management
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthChanges } from './firestore/auth-service';

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges((user) => {
            setUser(user);
            setIsLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Custom hook for accessing authentication context.
 * @returns AuthContextType containing user and loading state
 * @throws Error if used outside AuthProvider
 */

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}