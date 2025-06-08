import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationData {
  habitId: string;
  habitTitle: string;
  reminderTime: string;
  scheduledDays?: string[];
  customFrequency?: number;
  customUnit?: 'days' | 'weeks' | 'months';
}

export class NotificationService {
  
  static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  static async scheduleHabitReminder(data: NotificationData): Promise<string[]> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }

      const notificationIds: string[] = [];
      
      if (data.scheduledDays && data.scheduledDays.length > 0) {
        // Schedule for specific days of the week
        for (const day of data.scheduledDays) {
          try {
            const notificationId = await this.scheduleWeeklyNotification(data, day);
            notificationIds.push(notificationId);
          } catch (dayError) {
            console.error(`Failed to schedule notification for ${day}:`, dayError);
            // Continue with other days even if one fails
          }
        }
      } else if (data.customFrequency && data.customUnit) {
        // Schedule for custom frequency
        try {
          const notificationId = await this.scheduleCustomNotification(data);
          notificationIds.push(notificationId);
        } catch (customError) {
          console.error('Failed to schedule custom notification:', customError);
          throw customError;
        }
      }

      if (notificationIds.length === 0) {
        throw new Error('Failed to schedule any notifications');
      }

      return notificationIds;
    } catch (error) {
      console.error('Error in scheduleHabitReminder:', error);
      throw error;
    }
  }

  private static async scheduleWeeklyNotification(
    data: NotificationData, 
    dayOfWeek: string
  ): Promise<string> {
    const dayMap: { [key: string]: number } = {
      'sunday': 1,
      'monday': 2,
      'tuesday': 3,
      'wednesday': 4,
      'thursday': 5,
      'friday': 6,
      'saturday': 7,
    };

    const [hours, minutes] = data.reminderTime.split(':').map(Number);
    
    const trigger: Notifications.WeeklyTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: dayMap[dayOfWeek],
      hour: hours,
      minute: minutes,
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Habit Reminder 🎯",
        body: `Time to work on: ${data.habitTitle}`,
        data: { habitId: data.habitId },
        sound: true,
      },
      trigger,
    });

    return notificationId;
  }

  private static async scheduleCustomNotification(data: NotificationData): Promise<string> {
    const [hours, minutes] = data.reminderTime.split(':').map(Number);
    
    // Calculate next occurrence of the specified time
    const now = new Date();
    const nextNotification = new Date();
    nextNotification.setHours(hours, minutes, 0, 0);
    
    // If the time has passed today, schedule for tomorrow
    if (nextNotification <= now) {
      nextNotification.setDate(nextNotification.getDate() + 1);
    }

    // For custom intervals, we'll use DATE trigger for the first notification
    // and handle repeating through the app logic rather than notification system
    const trigger: Notifications.DateTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextNotification,
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Habit Reminder 🎯",
        body: `Time to work on: ${data.habitTitle}`,
        data: { 
          habitId: data.habitId,
          customFrequency: data.customFrequency,
          customUnit: data.customUnit 
        },
        sound: true,
      },
      trigger,
    });

    return notificationId;
  }

  static async cancelNotifications(notificationIds: string[]): Promise<void> {
    for (const id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Immediate notification for habit completion encouragement
  static async sendCompletionNotification(habitTitle: string): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Great Job! 🎉",
        body: `You completed: ${habitTitle}. Keep up the streak!`,
        sound: true,
      },
      trigger: null, // Send immediately
    });
  }

  // Streak milestone notifications
  static async sendStreakMilestoneNotification(habitTitle: string, streakCount: number): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    const milestones = [7, 14, 30, 60, 100];
    if (milestones.includes(streakCount)) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${streakCount} Day Streak! 🔥`,
          body: `Amazing! You've maintained ${habitTitle} for ${streakCount} days straight!`,
          sound: true,
        },
        trigger: null,
      });
    }
  }
}
