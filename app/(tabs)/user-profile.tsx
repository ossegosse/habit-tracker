import { Text, View, StyleSheet, ActivityIndicator } from "react-native";
import LogoutButton from "@/components/LogoutButton";
import {
  getWeeklyCompletionStats,
  getCurrentStreak,
  getOverallCompletionStats
} from "@/utils/habitUtils";
import { useUserHabits } from "@/hooks/useUserHabits";
import { ProgressBar } from "react-native-paper";
import StreakCircle from "@/components/StreakCircle";
import CompletionPie from "@/components/CompletionCircle";


export default function UserProfile() {
  const { habits, loading } = useUserHabits();
  const weeklyStats = getWeeklyCompletionStats(habits);
  const overallStats = getOverallCompletionStats(habits);
  const streak = habits.length > 0 ? getCurrentStreak(habits[0]) : 0;


  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontWeight: "bold", fontSize: 18 }}>Weekly Progress</Text>
      <CompletionPie completed={weeklyStats.totalCompleted} total={weeklyStats.totalScheduled} />
      <Text>Weekly Completion: {weeklyStats.percent.toFixed(0)}%</Text>

      <Text style={{ fontWeight: "bold", fontSize: 18, marginTop: 24 }}>Overall Progress</Text>
      <CompletionPie completed={overallStats.totalCompleted} total={overallStats.totalScheduled} />
      <Text>Overall Completion: {overallStats.percent.toFixed(0)}%</Text>

      <Text style={{ fontWeight: "bold", fontSize: 18, marginTop: 24 }}>Current Streak</Text>
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
