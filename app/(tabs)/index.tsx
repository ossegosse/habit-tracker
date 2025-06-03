import { ActivityIndicator, Alert, FlatList, StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { Link } from "expo-router";
import { Habit, deleteHabit, completeHabit } from "@/services/firestore/database-service";
import { useUserHabits } from "@/hooks/useUserHabits";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Card, Text as PaperText, IconButton, ProgressBar, Button } from "react-native-paper";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import dayjs from "dayjs";
import { getProgress } from "@/utils/habitUtils";
import { useState } from "react";

export default function HabitScreen() {
  const { habits, loading, setHabits } = useUserHabits();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const today = dayjs().format("YYYY-MM-DD");
  const [selectedTab, setSelectedTab] = useState<"daily" | "all">("daily");
  const filteredHabits =
    selectedTab === "daily"
      ? habits.filter((habit) => habit.scheduledDates?.includes(today))
      : habits;

  const handleComplete = async (habitId: string) => {
    try {
      await completeHabit(habitId, today);
      setHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              completions: [
                ...(habit.completions ?? []),
                { date: today },
              ],
            }
          : habit
      )
    );
    } catch (error) {
      console.error("Error completing habit:", error);
      Alert.alert("Error", "Failed to mark habit as complete.");
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
        <Text style={[styles.emptyText, { color: themeColors.placeholder }]}>
          You don't have any habits yet.
        </Text>
        <Link href="/create-habit-modal" style={styles.createButton}>
          <MaterialCommunityIcons
            name="plus-circle"
            size={50}
            color={themeColors.success}
          />
        </Link>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        <Button
          mode={selectedTab === "daily" ? "contained" : "outlined"}
          onPress={() => setSelectedTab("daily")}
          style={{ flex: 1, marginRight: 4, height: 40, borderWidth: 0 }}
          buttonColor={
            selectedTab === "daily" ? themeColors.tint : themeColors.card
          }
          textColor={
            selectedTab === "daily"
              ? themeColors.inputBackground
              : themeColors.text
          }
        >
          Today
        </Button>
        <Button
          mode={selectedTab === "all" ? "contained" : "outlined"}
          onPress={() => setSelectedTab("all")}
          style={{ flex: 1, marginLeft: 4, height: 40, borderWidth: 0}}
          buttonColor={
            selectedTab === "all" ? themeColors.tint : themeColors.card
          }
          textColor={
            selectedTab === "all"
              ? themeColors.inputBackground
              : themeColors.text
          }
        >
          All Habits
        </Button>
      </View>
      <FlatList
        data={filteredHabits}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={({ item }) => {
          const progress = getProgress(item);
          const isCompletedToday = item.completions?.some(
            (c) => c.date === today
          );

          return (
            <Card
              style={[
                styles.habitCard,
                {
                  backgroundColor: themeColors.card,
                  shadowColor: themeColors.tint,
                },
              ]}
              elevation={2}
              mode="elevated"
            >
              <Card.Title
                title={item.title}
                titleStyle={{ color: themeColors.text, fontWeight: "bold" }}
                left={(props) => (
                  <Ionicons
                    name={item.icon}
                    size={28}
                    color={themeColors.tint}
                    style={{ marginRight: 8 }}
                  />
                )}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="delete-outline"
                    iconColor={themeColors.error}
                    onPress={() => item.id && handleDeleteHabit(item.id)}
                  />
                )}
                style={{
                  backgroundColor: themeColors.cardHeader,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  minHeight: 36,
                }}
              />
              <Card.Content>
                <PaperText style={{ marginBottom: 8, color: themeColors.text }}>
                  {item.description}
                </PaperText>
                <View style={styles.progressRow}>
                  <ProgressBar
                    progress={progress}
                    color={themeColors.success}
                    style={{
                      maxWidth: "100%",
                      flex: 1,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: themeColors.inputBackground,
                      marginRight: 8,
                    }}
                  />
                  
                </View>
                <View style={styles.habitFrequency}>
                <IconButton
                    icon={
                      isCompletedToday ? "check-circle" : "check-circle-outline"
                    }
                    iconColor={
                      isCompletedToday
                        ? themeColors.success
                        : themeColors.placeholder
                    }
                    disabled={isCompletedToday}
                    onPress={() => handleComplete(item.id)}
                    size={36}
                  />
                  </View>
              </Card.Content>
            </Card>
          );
        }}
      />
      <Link href="/create-habit-modal" style={styles.createButton}>
        <MaterialCommunityIcons
          name="plus-circle"
          size={50}
          color={themeColors.success}
        />
      </Link>
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
  createButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  habitCard: {
  borderRadius: 10,
  marginBottom: 12,
  elevation: 2,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 1.41,
},
   progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  habitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  habitDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  habitFrequency: {
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "transparent",
    padding: 0,
    margin: 0,
  },
});
