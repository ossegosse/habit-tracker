import { StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { Link } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function HabitScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HEJ</Text>
      <Link href="/create-habit-modal" style={styles.createButton}>
        <MaterialCommunityIcons name="plus-circle" size={50} color="green" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  createButton: {
    flex: 1,
    flexDirection: "column",
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
