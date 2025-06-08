import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Habit } from "@/services/firestore/database-service";
import { auth, db } from "@/config/firebase";
import { useAuth } from "@/services/auth-provider";

export function useUserHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setHabits([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(collection(db, "habits"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q, 
      (querySnapshot) => {
        try {
          const habitsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Habit[];
          setHabits(habitsData);
          setError(null);
        } catch (err) {
          console.error("Error processing habits data:", err);
          setError("Failed to load habits");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error in habits listener:", err);
        setError("Failed to load habits");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { habits, loading, error, setHabits };
}