import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';

interface WeekDaySelectorProps {
  selectedDays: string[];
  onDaysChange: (days: string[]) => void;
  themeColors: any;
}

const WEEKDAYS = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

export default function WeekDaySelector({ selectedDays, onDaysChange, themeColors }: WeekDaySelectorProps) {
  // Memoize day toggle callback to prevent unnecessary re-renders
  const toggleDay = useCallback((day: string) => {
    if (selectedDays.includes(day)) {
      onDaysChange(selectedDays.filter(d => d !== day));
    } else {
      onDaysChange([...selectedDays, day]);
    }
  }, [selectedDays, onDaysChange]);

  // Memoize quick selection callbacks for performance
  const selectWeekdays = useCallback(() => {
    onDaysChange(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  }, [onDaysChange]);

  const selectWeekends = useCallback(() => {
    onDaysChange(['saturday', 'sunday']);
  }, [onDaysChange]);

  const selectAllDays = useCallback(() => {
    onDaysChange(WEEKDAYS.map(d => d.key));
  }, [onDaysChange]);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: themeColors.text }]}>
        Select Days of the Week
      </Text>
      <View style={styles.daysContainer}>
        {WEEKDAYS.map((day) => (
          <TouchableOpacity
            key={day.key}
            style={[
              styles.dayButton,
              selectedDays.includes(day.key) && [styles.dayButtonSelected, { backgroundColor: themeColors.tint }],
              { borderColor: themeColors.tint }
            ]}
            onPress={() => toggleDay(day.key)}
          >
            <Text
              style={[
                styles.dayButtonText,
                selectedDays.includes(day.key) 
                  ? [styles.dayButtonTextSelected, { color: themeColors.inputBackground }]
                  : { color: themeColors.text }
              ]}
            >
              {day.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Quick select options */}
      <View style={styles.quickSelectContainer}>
        <TouchableOpacity
          style={[styles.quickButton, { borderColor: themeColors.tint }]}
          onPress={selectWeekdays}
        >
          <Text style={[styles.quickButtonText, { color: themeColors.tint }]}>
            Weekdays
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickButton, { borderColor: themeColors.tint }]}
          onPress={selectWeekends}
        >
          <Text style={[styles.quickButtonText, { color: themeColors.tint }]}>
            Weekends
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickButton, { borderColor: themeColors.tint }]}
          onPress={selectAllDays}
        >
          <Text style={[styles.quickButtonText, { color: themeColors.tint }]}>
            Every Day
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonSelected: {
    borderWidth: 2,
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dayButtonTextSelected: {
    fontWeight: 'bold',
  },
  quickSelectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 16,
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
