import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { addHabit } from "@/services/firestore/database-service";
import { useState, ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Calendar } from "react-native-calendars";

const categories = [
  "Health",
  "Fitness",
  "Productivity",
  "Learning",
  "Social",
  "Other",
];

type IconName = ComponentProps<typeof Ionicons>["name"];

const categoryIcons: { [key: string]: IconName } = {
  Health: "heart",
  Fitness: "barbell",
  Productivity: "checkmark-circle",
  Learning: "book",
  Social: "people",
  Other: "ellipsis-horizontal",
};

export default function ModalScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Health");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateHabit = async () => {
    if (!title) {
      Alert.alert("Error", "Please enter a title for your habit");
      return;
    }
    if (selectedDates.length === 0) {
      Alert.alert("Error", "Please select at least one day of the week");
      return;
    }
    setIsLoading(true);
    try {
      await addHabit({
        title,
        description,
        scheduledDates: selectedDates,
        category: selectedCategory,
        icon: categoryIcons[selectedCategory],
      });
      Alert.alert("Success", "Habit created successfully", [
        {
          text: "OK",
          onPress: () => {
            router.replace("/(tabs)");
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error creating habit:", error);
      Alert.alert(
        "Error",
        error.message || "An error occurred while creating the habit"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Create new habit</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="What habit do you want to create?"
          placeholderTextColor={"#888"}
        />

        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your habit"
          placeholderTextColor={"#888"}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}> Category</Text>
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonSelected,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Ionicons
                name={categoryIcons[category]}
                size={20}
                color={selectedCategory === category ? "white" : "#333"}
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category &&
                    styles.categoryButtonTextSelected,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Dates</Text>
        <Text style={styles.sublabel}>
          On which dates do you want to perform this habit?
        </Text>

        <Calendar
          onDayPress={(day) => {
            const date = day.dateString;
            setSelectedDates((prev) =>
              prev.includes(date)
                ? prev.filter((d) => d !== date)
                : [...prev, date]
            );
          }}
          markedDates={selectedDates.reduce((acc, date) => {
            acc[date] = { selected: true, selectedColor: "green" };
            return acc;
          }, {} as Record<string, any>)}
        />
      </ScrollView>

      <TouchableOpacity
        style={[styles.createButton, isLoading && styles.createButtonDisabled]}
        onPress={handleCreateHabit}
        disabled={isLoading}
      >
        <Text style={styles.createButtonText}>
          {isLoading ? "Creating..." : "Create Habit"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "black",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "black",
  },
  sublabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    justifyContent: "space-between",
  },
  dayButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 8,
    margin: 4,
  },
  dayButtonSelected: {
    backgroundColor: "green",
    borderColor: "green",
  },
  dayButtonText: {
    color: "#333",
  },
  dayButtonTextSelected: {
    color: "white",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    justifyContent: "space-between",
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  categoryButtonSelected: {
    backgroundColor: "green",
    borderColor: "green",
  },
  categoryButtonText: {
    color: "#333",
    marginLeft: 6,
  },
  categoryButtonTextSelected: {
    color: "white",
  },
  createButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "green",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
