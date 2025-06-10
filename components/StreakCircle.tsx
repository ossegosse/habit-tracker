/**
 * StreakCircle - Visual indicator for habit streaks with goal tracking.
 * 
 * Features:
 * - Circular progress toward streak goal
 * - Fire emoji for motivation
 * - Goal achievement celebration
 * - Customizable goal (default: 7 days)
 */

import { View, Text } from 'react-native';
import * as Progress from 'react-native-progress';

type StreakCircleProps = {
  streak: number;
  goal?: number;
};

export default function StreakCircle({ streak, goal = 7 }: StreakCircleProps) {
  return (
    <View style={{ alignItems: 'center', marginVertical: 24 }}>
      <Progress.Circle
        size={100}
        progress={Math.min(streak / goal, 1)}
        showsText={true}
        formatText={() => `${streak}🔥`}
        color="#FF9800"
        borderWidth={0}
        thickness={8}
        unfilledColor="#FFE0B2"
      />
      <Text style={{ marginTop: 8, fontWeight: 'bold' }}>
        {streak >= goal ? "🔥 Streak Goal Reached!" : `Current Streak: ${streak} days`}
      </Text>
    </View>
  );
}