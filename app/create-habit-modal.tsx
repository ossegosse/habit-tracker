/**
 * Create Habit Modal - Comprehensive habit creation interface.
 * 
 * Features:
 * - Multiple scheduling options (weekly, custom frequency, specific dates)
 * - Category selection with icons
 * - Form validation
 * - Time reminders and target counts
 * - Modern UI with theme support
 */

import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { addHabit } from "@/services/firestore/database-service";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import WeekDaySelector from "@/components/WeekDaySelector";
import Colors, { categoryColors } from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import DateTimePicker from '@react-native-community/datetimepicker';
import { NotificationService } from "@/services/notification-service";
import { categories, categoryIcons } from "@/constants/HabitCategories";
import { validateHabitTitle, validateCustomFrequency, validateTargetCount } from "@/utils/validation";

export default function ModalScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const params = useLocalSearchParams();
  
  // Basic habit information
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Health");
  const [isLoading, setIsLoading] = useState(false);
  
  // Advanced scheduling options
  const [scheduleType, setScheduleType] = useState<'weekly' | 'custom' | 'specific'>('weekly');
  const [customFrequency, setCustomFrequency] = useState(1);
  const [customUnit, setCustomUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const [hasTimeReminder, setHasTimeReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [targetCount, setTargetCount] = useState<number | undefined>(undefined);
  const [hasTargetCount, setHasTargetCount] = useState(false);

  /**
   * Handles habit creation with comprehensive validation.
   * Schedules notifications if time reminders are enabled.
   */
  const handleCreateHabit = async () => {
    const titleValidation = validateHabitTitle(title);
    if (!titleValidation.isValid) {
      Alert.alert("Error", titleValidation.error);
      return;
    }
    
    // Validate scheduling based on type
    if (scheduleType === 'weekly' && selectedDays.length === 0) {
      Alert.alert("Error", "Please select at least one day for your habit");
      return;
    }
    
    // Custom frequency validation
    if (scheduleType === 'custom') {
      const frequencyValidation = validateCustomFrequency(customFrequency);
      if (!frequencyValidation.isValid) {
        Alert.alert("Error", frequencyValidation.error);
        return;
      }
    }
    
    // Validate target count
    if (hasTargetCount) {
      const targetValidation = validateTargetCount(targetCount);
      if (!targetValidation.isValid) {
        Alert.alert("Error", targetValidation.error);
        return;
      }
    }
    
    setIsLoading(true);
    try {
      const habitData = {
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory,
        icon: categoryIcons[selectedCategory],
        scheduleType,
        ...(scheduleType === 'weekly' && { scheduledDays: selectedDays }),
        ...(scheduleType === 'custom' && { 
          customFrequency, 
          customUnit,
          nextDueDate: new Date().toISOString()
        }),
        ...(hasTimeReminder && { 
          reminderTime: reminderTime.toTimeString().slice(0, 5)
        }),
        ...(hasTargetCount && targetCount && { targetCount }),
      };
      
      const createdHabit = await addHabit(habitData);
      
      // Schedule notifications if reminders are enabled
      if (hasTimeReminder && createdHabit?.id) {
        try {
          const notificationData = {
            habitId: createdHabit.id,
            habitTitle: title,
            reminderTime: reminderTime.toTimeString().slice(0, 5),
            ...(scheduleType === 'weekly' && { scheduledDays: selectedDays }),
            ...(scheduleType === 'custom' && { 
              customFrequency, 
              customUnit 
            }),
          };
          
          await NotificationService.scheduleHabitReminder(notificationData);
        } catch (notificationError) {
          console.warn("Failed to schedule notifications:", notificationError);
          // Don't block habit creation if notifications fail
        }
      }
      
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
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.title, { color: themeColors.text }]}>Create new habit</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: themeColors.inputBackground,
            color: themeColors.text,
            borderColor: themeColors.border
          }]}
          value={title}
          onChangeText={setTitle}
          placeholder="What habit do you want to create?"
          placeholderTextColor={themeColors.placeholder}
        />

        <Text style={[styles.label, { color: themeColors.text }]}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: themeColors.inputBackground,
            color: themeColors.text,
            borderColor: themeColors.border
          }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your habit"
          placeholderTextColor={themeColors.placeholder}
          multiline
          numberOfLines={4}
        />

        <Text style={[styles.label, { color: themeColors.text }]}> Category</Text>
        <View style={[styles.categoriesContainer, { backgroundColor: themeColors.inputBackground }]}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && [styles.categoryButtonSelected, { backgroundColor: categoryColors[category as keyof typeof categoryColors] }],
                { borderColor: themeColors.border }
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
                  styles.categoryButtonText,
                  selectedCategory === category
                    ? { color: "white" }
                    : { color: themeColors.text },
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: themeColors.text }]}>Schedule</Text>
        <Text style={[styles.sublabel, { color: themeColors.placeholder }]}>
          How often do you want to perform this habit?
        </Text>

        {/* Schedule Type Selector */}
        <View style={[styles.scheduleTypeContainer, { backgroundColor: themeColors.inputBackground }]}>
          <TouchableOpacity
            style={[
              styles.scheduleTypeButton,
              scheduleType === 'weekly' && [styles.scheduleTypeButtonSelected, { backgroundColor: themeColors.tint }]
            ]}
            onPress={() => setScheduleType('weekly')}
          >
            <Ionicons 
              name="calendar" 
              size={20} 
              color={scheduleType === 'weekly' ? 'white' : themeColors.text} 
            />
            <Text style={[
              styles.scheduleTypeText,
              scheduleType === 'weekly' 
                ? { color: 'white' }
                : { color: themeColors.text }
            ]}>
              Weekly
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.scheduleTypeButton,
              scheduleType === 'custom' && [styles.scheduleTypeButtonSelected, { backgroundColor: themeColors.tint }]
            ]}
            onPress={() => setScheduleType('custom')}
          >
            <Ionicons 
              name="repeat" 
              size={20} 
              color={scheduleType === 'custom' ? 'white' : themeColors.text} 
            />
            <Text style={[
              styles.scheduleTypeText,
              scheduleType === 'custom' 
                ? { color: 'white' }
                : { color: themeColors.text }
            ]}>
              Custom
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

        {/* Custom Frequency */}
        {scheduleType === 'custom' && (
          <View style={[styles.customFrequencyContainer, { backgroundColor: themeColors.inputBackground }]}>
            <Text style={[styles.customFrequencyLabel, { color: themeColors.text }]}>
              Repeat every:
            </Text>
            <View style={styles.customFrequencyInputs}>
              <TextInput
                style={[styles.frequencyInput, { 
                  backgroundColor: themeColors.background,
                  color: themeColors.text,
                  borderColor: themeColors.border
                }]}
                value={customFrequency.toString()}
                onChangeText={(text) => setCustomFrequency(parseInt(text) || 1)}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor={themeColors.placeholder}
              />
              <View style={styles.unitSelector}>
                {(['days', 'weeks', 'months'] as const).map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitButton,
                      customUnit === unit && [styles.unitButtonSelected, { backgroundColor: themeColors.tint }],
                      { borderColor: themeColors.border }
                    ]}
                    onPress={() => setCustomUnit(unit)}
                  >
                    <Text style={[
                      styles.unitButtonText,
                      customUnit === unit 
                        ? { color: 'white' }
                        : { color: themeColors.text }
                    ]}>
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Target Count */}
        <View style={[styles.optionRow, { backgroundColor: themeColors.inputBackground }]}>
          <View style={styles.optionLeft}>
            <Text style={[styles.optionTitle, { color: themeColors.text }]}>Target Count</Text>
            <Text style={[styles.optionSubtitle, { color: themeColors.placeholder }]}>
              Set a daily target (e.g., 8 glasses of water)
            </Text>
          </View>
          <Switch
            value={hasTargetCount}
            onValueChange={setHasTargetCount}
            trackColor={{ false: themeColors.border, true: themeColors.tint }}
            thumbColor={hasTargetCount ? 'white' : '#f4f3f4'}
          />
        </View>

        {hasTargetCount && (
          <TextInput
            style={[styles.input, { 
              backgroundColor: themeColors.inputBackground,
              color: themeColors.text,
              borderColor: themeColors.border
            }]}
            value={targetCount?.toString() || ''}
            onChangeText={(text) => setTargetCount(parseInt(text) || undefined)}
            placeholder="Enter target count"
            placeholderTextColor={themeColors.placeholder}
            keyboardType="numeric"
          />
        )}

        {/* Time Reminder */}
        <View style={[styles.optionRow, { backgroundColor: themeColors.inputBackground }]}>
          <View style={styles.optionLeft}>
            <Text style={[styles.optionTitle, { color: themeColors.text }]}>Time Reminder</Text>
            <Text style={[styles.optionSubtitle, { color: themeColors.placeholder }]}>
              Get notified at a specific time
            </Text>
          </View>
          <Switch
            value={hasTimeReminder}
            onValueChange={setHasTimeReminder}
            trackColor={{ false: themeColors.border, true: themeColors.tint }}
            thumbColor={hasTimeReminder ? 'white' : '#f4f3f4'}
          />
        </View>

        {hasTimeReminder && (
          <TouchableOpacity
            style={[styles.timeButton, { 
              backgroundColor: themeColors.inputBackground,
              borderColor: themeColors.border
            }]}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time" size={20} color={themeColors.tint} />
            <Text style={[styles.timeButtonText, { color: themeColors.text }]}>
              {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        )}

        {showTimePicker && (
          <DateTimePicker
            value={reminderTime}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                setReminderTime(selectedTime);
              }
            }}
          />
        )}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.createButton, 
          isLoading && styles.createButtonDisabled,
          { backgroundColor: themeColors.tint }
        ]}
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
  },
  scrollContent: {
    paddingBottom: 100, // Space for the absolutely positioned button
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 8,
  },
  sublabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: "space-between",
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  categoryButtonSelected: {
    borderWidth: 1,
  },
  categoryButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  
  scheduleTypeContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  scheduleTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  scheduleTypeButtonSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleTypeText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  
  customFrequencyContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  customFrequencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  customFrequencyInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  frequencyInput: {
    width: 60,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  unitSelector: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  unitButtonSelected: {
    borderWidth: 1,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionLeft: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
  },
  
  // Time Button
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  timeButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  
  createButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
