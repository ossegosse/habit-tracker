import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { addHabit } from "@/services/firestore/database-service";
import { useState, ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const categories = [
  "Health",
  "Fitness",
  "Productivity",
  "Learning",
  "Social",
  "Other",
];

type IconName = ComponentProps<typeof Ionicons>["name"];

const categoryIcons: {[key: string]: IconName} = {
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
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Health");
  const [isLoading, setIsLoading] = useState(false);

  const toggleDaySelection = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleCreateHabit = async () => {
    if (!title) {
      Alert.alert("Error", "Please enter a title for your habit");
      return;
    }
    if (selectedDays.length === 0) {
      Alert.alert("Error", "Please select at least one day of the week");
      return;
    }
    setIsLoading(true);
    try {
      await addHabit({
        title,
        description,
        frequency: selectedDays,
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

      <Text style={styles.label}>Frequency</Text>
      <Text style={styles.sublabel}>
        On which days do you want to perform this habit?
      </Text>

      <View style={styles.daysContainer}>
        {daysOfWeek.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDays.includes(day) && styles.dayButtonSelected,
            ]}
            onPress={() => toggleDaySelection(day)}
          >
            <Text
              style={[
                styles.dayButtonText,
                selectedDays.includes(day) && styles.dayButtonTextSelected,
              ]}
            >
              {day.substring(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
    
    /* height: '100%',
    gap: 15,
    justifyContent: 'flex-start', */
    /*  justifyContent: 'space-between', */
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
