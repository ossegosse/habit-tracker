/**
 * Main Habits Screen - Core functionality of the habit tracker app.
 * 
 * Features:
 * - Real-time habit loading and display
 * - Daily/All habits filtering
 * - Habit completion/un-completion
 * - Navigation to create/edit habits
 * - Optimized FlatList rendering
 * - Error handling and loading states
 */

import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { router } from "expo-router";
import { Habit, deleteHabit, completeHabit, uncompleteHabit } from "@/services/firestore/database-service";
import { useUserHabits } from "@/hooks/useUserHabits";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import dayjs from "dayjs";
import { useState, useMemo, useCallback } from "react";
import HabitCard from "@/components/HabitCard";
import { NotificationService } from "@/services/notification-service";
import { getCurrentStreak } from "@/utils/habitUtils";

export default function HabitScreen() {
  const { habits, loading, error, setHabits } = useUserHabits();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [selectedTab, setSelectedTab] = useState<"daily" | "all">("daily");
  
  // Memoized date calculations for performance
  const today = useMemo(() => dayjs().format("YYYY-MM-DD"), []);
  const todayDayOfWeek = useMemo(() => dayjs().format('dddd').toLowerCase(), []);
  
  const tabs = useMemo(() => [
    { key: "daily", label: "Today" },
    { key: "all", label: "All Habits" }
  ], []);
  
  // Filter habits based on selected tab and scheduling
  const filteredHabits = useMemo(() =>
    selectedTab === "daily"
      ? habits.filter((habit) => {
          // Check if habit is scheduled for today
          if (habit.scheduledDays && habit.scheduledDays.length > 0) {
            return habit.scheduledDays.includes(todayDayOfWeek);
          }
          
          if (habit.scheduledDates && habit.scheduledDates.length > 0) {
            return habit.scheduledDates.includes(today);
          }
          
          // Daily habits without specific scheduling
          return true;
        })
      : habits, [selectedTab, habits, todayDayOfWeek, today]);

  /**
   * Handles habit completion/un-completion with optimistic UI updates.
   * Sends notifications for streak achievements and completion encouragement.
   */
  const handleComplete = async (habitId: string, specificDate?: string) => {
    try {
      const dateToUse = specificDate || today;
      const habit = habits.find(h => h.id === habitId);
      const isAlreadyCompleted = habit?.completions?.some(c => c.date === dateToUse);
      
      if (isAlreadyCompleted) {
        // Uncomplete the habit
        await uncompleteHabit(habitId, dateToUse);
        
        // Update local state
        const updatedHabits = habits.map((habit) =>
          habit.id === habitId
            ? {
                ...habit,
                completions: (habit.completions ?? []).filter(c => c.date !== dateToUse),
              }
            : habit
        );
        setHabits(updatedHabits);
      } else {
        // Complete the habit
        await completeHabit(habitId, dateToUse);
        
        // Update local state
        const updatedHabits = habits.map((habit) =>
          habit.id === habitId
            ? {
                ...habit,
                completions: [
                  ...(habit.completions ?? []),
                  { date: dateToUse },
                ],
              }
            : habit
        );
        setHabits(updatedHabits);
        
        // Find the completed habit for notifications (only send on completion, not un-completion)
        const completedHabit = updatedHabits.find(h => h.id === habitId);
        if (completedHabit) {
          // Calculate current streak using the utility function
          const currentStreak = getCurrentStreak(completedHabit);
          
          // Send completion encouragement
          await NotificationService.sendCompletionNotification(
            completedHabit.title
          );
          
          // Check for milestone achievements
          if (currentStreak > 0 && [7, 14, 30, 60, 100].includes(currentStreak)) {
            await NotificationService.sendStreakMilestoneNotification(
              completedHabit.title,
              currentStreak
            );
          }
        }
      }
    } catch (error) {
      console.error("Error updating habit completion:", error);
      Alert.alert("Error", "Failed to update habit completion.");
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    Alert.alert("Delete Habit", "Are you sure you want to delete this habit?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteHabit(habitId);
            setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
          } catch (error) {
            console.error("Error deleting habit:", error);
            Alert.alert(
              "Error",
              "Failed to delete habit. Please try again later."
            );
          }
        },
      },
    ]);
  };

  const handleEditHabit = (habitId: string) => {
    router.push(`/edit-habit-modal?habitId=${habitId}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.tint} />
        <Text style={[{ marginTop: 16, color: themeColors.text }]}>Loading habits...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={80}
          color={themeColors.error}
        />
        <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
          Unable to Load Habits
        </Text>
        <Text style={[styles.emptyText, { color: themeColors.placeholder }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: themeColors.tint }]}
          onPress={() => {
            // The useUserHabits hook will automatically retry when the component re-renders
            setSelectedTab(selectedTab); // Trigger a state update to force re-render
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (habits.length === 0) {
    return (
      <View
        style={[styles.centered, { backgroundColor: themeColors.background }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            My Habits
          </Text>
        </View>

        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={80}
            color={themeColors.placeholder}
          />
          <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
            Start Building Great Habits
          </Text>
          <Text style={[styles.emptyText, { color: themeColors.placeholder }]}>
            Create your first habit to get started on your journey.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          My Habits
        </Text>
      </View>

      {/* Simple Tab Filter */}
      <View style={[styles.filterContainer, { backgroundColor: themeColors.inputBackground }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              selectedTab === tab.key && [styles.filterTabSelected, { backgroundColor: themeColors.tint }]
            ]}
            onPress={() => setSelectedTab(tab.key as "daily" | "all")}
          >
            <Text style={[
              styles.filterTabText,
              selectedTab === tab.key 
                ? { color: 'white' }
                : { color: themeColors.text }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredHabits}
        keyExtractor={(item, index) => item.id || `habit-${index}`}
        renderItem={({ item }) => (
          <HabitCard
            habit={item}
            onComplete={handleComplete}
            onDelete={handleDeleteHabit}
            onEdit={handleEditHabit}
            themeColors={themeColors}
          />
        )}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  createButton: {
    flex: 1,
    flexDirection: "column",
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterTabSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyButtons: {
    gap: 12,
    marginTop: 30,
    width: '100%',
    maxWidth: 280,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
