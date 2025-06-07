import React, { useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { updateHabit, getHabit, Habit } from "@/services/firestore/database-service";
import { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Calendar } from "react-native-calendars";
import Colors, { categoryColors } from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import WeekDaySelector from "@/components/WeekDaySelector";

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

export default function EditHabitModal() {
  const { habitId } = useLocalSearchParams<{ habitId: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<'weekly' | 'specific'>('weekly');
  const [selectedCategory, setSelectedCategory] = useState("Health");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHabit, setIsLoadingHabit] = useState(true);

  useEffect(() => {
    if (habitId) {
      loadHabit();
    }
  }, [habitId]);

  const loadHabit = async () => {
    try {
      const habit = await getHabit(habitId);
      if (habit) {
        setTitle(habit.title);
        setDescription(habit.description || "");
        setSelectedCategory(habit.category);
        
        // Determine schedule type based on existing data
        if (habit.scheduledDays && habit.scheduledDays.length > 0) {
          setScheduleType('weekly');
          setSelectedDays(habit.scheduledDays);
        } else if (habit.scheduledDates && habit.scheduledDates.length > 0) {
          setScheduleType('specific');
          setSelectedDates(habit.scheduledDates);
        } else {
          // Default to weekly if no scheduling info
          setScheduleType('weekly');
        }
      } else {
        Alert.alert("Error", "Habit not found");
        router.back();
      }
    } catch (error) {
      console.error("Error loading habit:", error);
      Alert.alert("Error", "Failed to load habit");
      router.back();
    } finally {
      setIsLoadingHabit(false);
    }
  };

  const handleUpdateHabit = async () => {
    if (!title) {
      Alert.alert("Error", "Please enter a title for your habit");
      return;
    }
    
    if (scheduleType === 'weekly' && selectedDays.length === 0) {
      Alert.alert("Error", "Please select at least one day of the week");
      return;
    }
    
    if (scheduleType === 'specific' && selectedDates.length === 0) {
      Alert.alert("Error", "Please select at least one date");
      return;
    }
    
    setIsLoading(true);
    try {
      const updateData: Partial<Habit> = {
        title,
        description,
        category: selectedCategory,
        icon: categoryIcons[selectedCategory],
      };

      // Clear both scheduling arrays first, then set the appropriate one
      updateData.scheduledDays = [];
      updateData.scheduledDates = [];
      
      if (scheduleType === 'weekly') {
        updateData.scheduledDays = selectedDays;
      } else {
        updateData.scheduledDates = selectedDates;
      }

      await updateHabit(habitId, updateData);
      Alert.alert("Success", "Habit updated successfully", [
        {
          text: "OK",
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error updating habit:", error);
      Alert.alert(
        "Error",
        error.message || "An error occurred while updating the habit"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingHabit) {
    return (
      <View style={createStyles(themeColors).container}>
        <Text style={createStyles(themeColors).title}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={createStyles(themeColors).container}>
      <ScrollView contentContainerStyle={createStyles(themeColors).scrollContent}>
        <Text style={createStyles(themeColors).title}>Edit habit</Text>
        <TextInput
          style={createStyles(themeColors).input}
          value={title}
          onChangeText={setTitle}
          placeholder="What habit do you want to edit?"
          placeholderTextColor={themeColors.placeholder}
        />

        <Text style={createStyles(themeColors).label}>Description (Optional)</Text>
        <TextInput
          style={createStyles(themeColors).input}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your habit"
          placeholderTextColor={themeColors.placeholder}
          multiline
          numberOfLines={4}
        />

        <Text style={createStyles(themeColors).label}>Category</Text>
        <View style={createStyles(themeColors).categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                createStyles(themeColors).categoryButton,
                selectedCategory === category && [createStyles(themeColors).categoryButtonSelected, { backgroundColor: categoryColors[category as keyof typeof categoryColors] }],
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Ionicons
                name={categoryIcons[category]}
                size={20}
                color={selectedCategory === category ? "white" : categoryColors[category as keyof typeof categoryColors]}
              />
              <Text
                style={[
                  { color: selectedCategory === category ? "white" : themeColors.text, marginLeft: 6 },
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={createStyles(themeColors).label}>Schedule</Text>
        <Text style={createStyles(themeColors).sublabel}>
          How often do you want to perform this habit?
        </Text>

        {/* Schedule Type Selector */}
        <View style={createStyles(themeColors).scheduleTypeContainer}>
          <TouchableOpacity
            style={[
              createStyles(themeColors).scheduleTypeButton,
              scheduleType === 'weekly' && createStyles(themeColors).scheduleTypeButtonSelected,
            ]}
            onPress={() => setScheduleType('weekly')}
          >
            <Ionicons 
              name="calendar" 
              size={20} 
              color={scheduleType === 'weekly' ? 'white' : themeColors.text} 
            />
            <Text style={[
              createStyles(themeColors).scheduleTypeText,
              scheduleType === 'weekly' && { color: 'white' }
            ]}>
              Weekly
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              createStyles(themeColors).scheduleTypeButton,
              scheduleType === 'specific' && createStyles(themeColors).scheduleTypeButtonSelected,
            ]}
            onPress={() => setScheduleType('specific')}
          >
            <Ionicons 
              name="calendar-outline" 
              size={20} 
              color={scheduleType === 'specific' ? 'white' : themeColors.text} 
            />
            <Text style={[
              createStyles(themeColors).scheduleTypeText,
              scheduleType === 'specific' && { color: 'white' }
            ]}>
              Specific Dates
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Schedule */}
        {scheduleType === 'weekly' && (
          <WeekDaySelector
            selectedDays={selectedDays}
            onDaysChange={setSelectedDays}
            themeColors={themeColors}
          />
        )}

        {/* Specific Dates Schedule */}
        {scheduleType === 'specific' && (
          <>
            <Text style={createStyles(themeColors).sublabel}>
              Select specific dates for this habit:
            </Text>
            <Calendar
              onDayPress={(day: any) => {
                const date = day.dateString;
                setSelectedDates((prev) =>
                  prev.includes(date)
                    ? prev.filter((d) => d !== date)
                    : [...prev, date]
                );
              }}
              markedDates={selectedDates.reduce((acc, date) => {
                acc[date] = { selected: true, selectedColor: themeColors.tint };
                return acc;
              }, {} as Record<string, any>)}
              theme={{
                backgroundColor: themeColors.background,
                calendarBackground: themeColors.card,
                textSectionTitleColor: themeColors.text,
                selectedDayBackgroundColor: themeColors.tint,
                selectedDayTextColor: '#ffffff',
                todayTextColor: themeColors.tint,
                dayTextColor: themeColors.text,
                textDisabledColor: themeColors.disabled,
                arrowColor: themeColors.tint,
                monthTextColor: themeColors.text,
                indicatorColor: themeColors.tint,
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '300',
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 13,
              }}
            />
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[createStyles(themeColors).updateButton, isLoading && createStyles(themeColors).updateButtonDisabled]}
        onPress={handleUpdateHabit}
        disabled={isLoading}
      >
        <Text style={createStyles(themeColors).updateButtonText}>
          {isLoading ? "Updating..." : "Update Habit"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: themeColors.background,
  },
  scrollContent: {
    paddingBottom: 100, // Space for the absolutely positioned button
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: themeColors.text,
  },
  input: {
    backgroundColor: themeColors.inputBackground,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: themeColors.text,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: themeColors.text,
  },
  sublabel: {
    fontSize: 14,
    color: themeColors.placeholder,
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: themeColors.card,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: 8,
    justifyContent: "space-between",
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeColors.card,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  categoryButtonSelected: {
    backgroundColor: themeColors.tint,
    borderColor: themeColors.tint,
  },
  scheduleTypeContainer: {
    flexDirection: "row",
    backgroundColor: themeColors.inputBackground,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  scheduleTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  scheduleTypeButtonSelected: {
    backgroundColor: themeColors.tint,
  },
  scheduleTypeText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: themeColors.text,
  },
  updateButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: themeColors.tint,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  updateButtonDisabled: {
    opacity: 0.5,
  },
  updateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
