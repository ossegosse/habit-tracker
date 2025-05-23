import { Text, View, StyleSheet, ActivityIndicator } from "react-native";
import LogoutButton from "@/components/LogoutButton";
import {
  getWeeklyCompletionStats,
  getCurrentStreak,
  getCompletionGraphData,
} from "@/utils/habitUtils";
import { useUserHabits } from "@/hooks/useUserHabits";
import { ProgressBar } from "react-native-paper";
import StreakCircle from "@/components/StreakCircle";
import CompletionPie from "@/components/CompletionPie";


export default function UserProfile() {
  const { habits, loading } = useUserHabits();
  const stats = getWeeklyCompletionStats(habits);


  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  const streak = habits.length > 0 ? getCurrentStreak(habits[0]) : 0;

  return (
    <View style={styles.container}>
      <Text>User</Text>
      <Text>Habit Statistis</Text>
      <View >
      <Text>Daily Completion</Text>
      <CompletionPie
        completed={stats.totalCompleted}
        total={stats.totalScheduled}
      />
  </View>
      <Text>Weekly Completion: {stats.percent.toFixed(0)}%</Text>
      <ProgressBar
        progress={stats.percent / 100}
        style={{ width: 200, marginVertical: 16 }}
      />
      <Text>
        Completed: {stats.totalCompleted} / {stats.totalScheduled}
      </Text>
      <Text>Current Streak (first habit): {streak} days</Text>
      <StreakCircle streak={streak} goal={7} />
      <LogoutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
});
