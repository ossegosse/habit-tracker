import { StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useUserHabits } from "@/hooks/useUserHabits";
import StreakCircle from "@/components/StreakCircle";
import CompletionCircle from "@/components/CompletionCircle";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { 
  getWeeklyCompletionStats, 
  getOverallCompletionStats, 
  getCurrentStreak 
} from "@/utils/habitUtils";

export default function StatisticsScreen() {
  const { habits, loading } = useUserHabits();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const weeklyStats = getWeeklyCompletionStats(habits);
  const overallStats = getOverallCompletionStats(habits);
  const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => getCurrentStreak(h))) : 0;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={themeColors.tint} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        {/* Quick Stats Overview */}
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Quick Stats
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: themeColors.tint }]}>
                {habits.length}
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.text }]}>
                Total Habits
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: themeColors.success }]}>
                {weeklyStats.percent.toFixed(0)}%
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.text }]}>
                This Week
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: themeColors.warning }]}>
                {overallStats.percent.toFixed(0)}%
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.text }]}>
                All Time
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly Progress Section */}
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            This Week's Progress
          </Text>
          <CompletionCircle 
            completed={weeklyStats.totalCompleted} 
            total={weeklyStats.totalScheduled} 
          />
          <Text style={[styles.statsText, { color: themeColors.text }]}>
            Completion Rate: {weeklyStats.percent.toFixed(0)}%
          </Text>
        </View>

        {/* Overall Progress Section */}
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Overall Progress
          </Text>
          <CompletionCircle 
            completed={overallStats.totalCompleted} 
            total={overallStats.totalScheduled} 
          />
          <Text style={[styles.statsText, { color: themeColors.text }]}>
            All-time Completion: {overallStats.percent.toFixed(0)}%
          </Text>
        </View>

        {/* Current Streak Section */}
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Longest Current Streak
          </Text>
          <StreakCircle streak={longestStreak} goal={7} />
        </View>

        {/* Simple Category Stats */}
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Habit Categories
          </Text>
          {habits.length > 0 ? (
            <View style={styles.categoryList}>
              {Array.from(new Set(habits.map(h => h.category))).map(category => {
                const categoryHabits = habits.filter(h => h.category === category);
                return (
                  <View key={category} style={styles.categoryItem}>
                    <Text style={[styles.categoryName, { color: themeColors.text }]}>
                      {category}
                    </Text>
                    <Text style={[styles.categoryCount, { color: themeColors.placeholder }]}>
                      {categoryHabits.length} habit{categoryHabits.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={[styles.noDataText, { color: themeColors.placeholder }]}>
              No habits created yet
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  statsText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },
  categoryList: {
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryCount: {
    fontSize: 14,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
