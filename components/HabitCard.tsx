import React, { memo, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text as PaperText, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '@/services/firestore/database-service';
import { getProgress, getCurrentStreak } from '@/utils/habitUtils';
import { categoryColors } from '@/constants/Colors';
import dayjs from 'dayjs';

type ThemeColors = {
  background: string;
  text: string;
  tint: string;
  card: string;
  cardHeader: string;
  inputBackground: string;
  success: string;
  error: string;
  placeholder: string;
};

interface HabitCardProps {
  habit: Habit;
  onComplete: (id: string, specificDate?: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  themeColors: ThemeColors;
}

const HabitCard = memo(({ habit, onComplete, onDelete, onEdit, themeColors }: HabitCardProps) => {
  const today = dayjs().format("YYYY-MM-DD");
  
  // Memoize expensive calculations
  const progress = useMemo(() => getProgress(habit), [habit.completions, habit.scheduledDays, habit.scheduledDates, habit.createdAt]);
  const isCompletedToday = useMemo(() => 
    habit.completions?.some((c) => c.date === today), 
    [habit.completions, today]
  );

  // Get day abbreviations for the current week - memoized
  const weekDays = useMemo(() => {
    const startOfWeek = dayjs().startOf('week');
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = startOfWeek.add(i, 'day');
      days.push({
        dayAbbr: date.format('dd')[0], // M, T, W, T, F, S, S
        fullDay: date.format('dddd').toLowerCase(), // monday, tuesday, etc.
        date: date.format('YYYY-MM-DD'),
        isToday: date.isSame(dayjs(), 'day'),
        isPast: date.isBefore(dayjs(), 'day'),
        isCompleted: habit.completions?.some(c => c.date === date.format('YYYY-MM-DD'))
      });
    }
    return days;
  }, [habit.completions]);

  // Memoize callback handlers
  const handleEdit = useCallback(() => {
    if (habit.id) {
      onEdit(habit.id);
    } else {
      console.warn('Habit ID is missing');
    }
  }, [habit.id, onEdit]);

  const handleDelete = useCallback(() => {
    if (habit.id) {
      onDelete(habit.id);
    } else {
      console.warn('Habit ID is missing');
    }
  }, [habit.id, onDelete]);

  const handleComplete = useCallback((specificDate?: string) => {
    if (!habit.id) {
      console.error('Cannot complete habit: Habit ID is missing');
      return;
    }
    onComplete(habit.id, specificDate);
  }, [habit.id, onComplete]);

  const hasScheduledDays = habit.scheduledDays && habit.scheduledDays.length > 0;

  // If habit has specific scheduled days, show day-specific completion
  const renderDaySpecificCompletion = () => {
    if (!hasScheduledDays) return null;

    return (
      <View style={styles.dayCompletionContainer}>
        {weekDays.map((day, index) => {
          const isScheduled = habit.scheduledDays?.includes(day.fullDay);
          if (!isScheduled) return null;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                {
                  backgroundColor: day.isCompleted 
                    ? themeColors.success 
                    : day.isToday 
                      ? themeColors.tint + '20'
                      : themeColors.inputBackground,
                  borderColor: day.isToday ? themeColors.tint : 'transparent',
                  borderWidth: day.isToday ? 2 : 0,
                  opacity: day.isPast && !day.isCompleted ? 0.5 : 1,
                }
              ]}
              onPress={() => {
                if (!habit.id) {
                  console.error('Cannot complete habit: Habit ID is missing');
                  return;
                }
                onComplete(habit.id, day.date);
              }}
            >
              <PaperText style={[
                styles.dayButtonText,
                {
                  color: day.isCompleted 
                    ? 'white' 
                    : day.isToday 
                      ? themeColors.tint 
                      : themeColors.text,
                  fontWeight: day.isToday ? 'bold' : 'normal'
                }
              ]}>
                {day.dayAbbr}
              </PaperText>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Card
      style={[
        styles.habitCard,
        {
          backgroundColor: themeColors.card,
          shadowColor: themeColors.tint,
        },
      ]}
      elevation={2}
      mode="elevated"
    >
      <Card.Title
        title={habit.title}
        titleStyle={{ color: themeColors.text, fontWeight: "bold" }}
        left={(props) => (
          <Ionicons
            name={habit.icon}
            size={28}
            color={categoryColors[habit.category as keyof typeof categoryColors] || themeColors.tint}
            style={{ marginRight: 8 }}
          />
        )}
        right={(props) => (
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              {...props}
              icon="pencil-outline"
              iconColor={themeColors.tint}
              onPress={handleEdit}
            />
            <IconButton
              {...props}
              icon="delete-outline"
              iconColor={themeColors.error}
              onPress={handleDelete}
            />
          </View>
        )}
        style={{
          backgroundColor: themeColors.cardHeader,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          minHeight: 36,
        }}
      />
      <Card.Content>
        <PaperText style={{ marginBottom: 8, color: themeColors.text }}>
          {habit.description}
        </PaperText>
        <View style={styles.progressRow}>
          <View style={[styles.progressBarContainer, { backgroundColor: themeColors.inputBackground }]}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  backgroundColor: themeColors.success,
                  width: `${Math.round(progress * 100)}%`
                }
              ]} 
            />
          </View>
        </View>
        
        {/* Day-specific completion for scheduled habits */}
        {renderDaySpecificCompletion()}
        
        {/* General completion button for non-scheduled habits */}
        {!hasScheduledDays && (
          <View style={styles.habitFrequency}>
            <IconButton
              icon={isCompletedToday ? "check-circle" : "check-circle-outline"}
              iconColor={
                isCompletedToday ? themeColors.success : themeColors.placeholder
              }
              onPress={() => handleComplete()}
              size={36}
            />
          </View>
        )}
      </Card.Content>
    </Card>
  );
});

export default HabitCard;

const styles = StyleSheet.create({
  habitCard: {
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  habitFrequency: {
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "transparent",
    padding: 0,
    margin: 0,
  },
  dayCompletionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  dayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonText: {
    fontSize: 12,
    textAlign: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
