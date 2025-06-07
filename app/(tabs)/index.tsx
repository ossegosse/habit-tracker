import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { Link, router } from "expo-router";
import { Habit, deleteHabit, completeHabit, uncompleteHabit } from "@/services/firestore/database-service";
import { useUserHabits } from "@/hooks/useUserHabits";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Button } from "react-native-paper";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import dayjs from "dayjs";
import { useState } from "react";
import HabitCard from "@/components/HabitCard";
import { NotificationService } from "@/services/notification-service";

export default function HabitScreen() {
  const { habits, loading, setHabits } = useUserHabits();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const today = dayjs().format("YYYY-MM-DD");
  const [selectedTab, setSelectedTab] = useState<"daily" | "all">("daily");
  
  const tabs = [
    { key: "daily", label: "Today" },
    { key: "all", label: "All Habits" }
  ];
  
  const filteredHabits =
    selectedTab === "daily"
      ? habits.filter((habit) => {
          // Check if habit is scheduled for today
          const todayDayOfWeek = dayjs().format('dddd').toLowerCase(); // 'monday', 'tuesday', etc.
          
          // For weekly habits, check if today's day is in scheduledDays
          if (habit.scheduledDays && habit.scheduledDays.length > 0) {
            return habit.scheduledDays.includes(todayDayOfWeek);
          }
          
          // For habits with specific dates, check scheduledDates
          if (habit.scheduledDates && habit.scheduledDates.length > 0) {
            return habit.scheduledDates.includes(today);
          }
          
          // For daily habits without specific scheduling, show every day
          return true;
        })
      : habits;

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
          // Calculate current streak
          const currentStreak = calculateStreak(completedHabit);
          
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

  // Helper function to calculate streak
  const calculateStreak = (habit: Habit): number => {
    if (!habit.completions || habit.completions.length === 0) return 0;
    
    const sortedCompletions = habit.completions
      .map(c => dayjs(c.date))
      .sort((a, b) => b.valueOf() - a.valueOf());
    
    let streak = 0;
    let currentDate = dayjs();
    
    for (const completion of sortedCompletions) {
      if (completion.isSame(currentDate, 'day')) {
        streak++;
        currentDate = currentDate.subtract(1, 'day');
      } else if (completion.isSame(currentDate.add(1, 'day'), 'day')) {
        // Skip if we're checking yesterday and today is already counted
        continue;
      } else {
        break;
      }
    }
    
    return streak;
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
      <View style={styles.container}>
        <ActivityIndicator />
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
        keyExtractor={(item) => item.id || Math.random().toString()}
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
  // Header styles
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
  // Filter styles
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
  // Empty state styles
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
});
