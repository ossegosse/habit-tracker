import { View, Text } from "react-native";
import * as Progress from "react-native-progress";
import { Ionicons } from "@expo/vector-icons";

type CompletionCircleProps = {
  completed: number;
  total: number;
};

export default function CompletionCircle({ completed, total }: CompletionCircleProps) {
  const progress = total === 0 ? 0 : Math.min(completed / total, 1);

  return (
    <View style={{ alignItems: "center", marginVertical: 24 }}>
      <Progress.Circle
        size={100}
        progress={progress}
        showsText={true}
        formatText={() => <Ionicons name="checkmark-done" size={32} color="#4CAF50" />}
        color="#4CAF50"
        borderWidth={0}
        thickness={8}
        unfilledColor="#E0E0E0"
      />
      <Text style={{ marginTop: 8, fontWeight: "bold" }}>
        {completed} / {total} completed
      </Text>
    </View>
  );
}