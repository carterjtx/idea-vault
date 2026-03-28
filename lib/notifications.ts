import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Check if running inside Expo Go (where push tokens require projectId).
 */
function getProjectId(): string | undefined {
  return Constants.expoConfig?.extra?.eas?.projectId ?? undefined;
}

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4A843',
      });
    }

    // getExpoPushTokenAsync requires a projectId in Expo Go
    const projectId = getProjectId();
    const token = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    return token.data;
  } catch {
    // Push tokens not available (e.g. simulator, Expo Go without projectId)
    return null;
  }
}

export async function scheduleWeeklyDigest(totalUnactioned: number, topIdeaTitle: string) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'IdeaVault Weekly Digest',
        body: `You have ${totalUnactioned} unactioned ideas. Your top idea this week: ${topIdeaTitle}`,
        data: { type: 'weekly_digest' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 2, // Monday
        hour: 9,
        minute: 0,
      },
    });
  } catch {
    // Scheduling not available — safe to ignore
  }
}

export async function scheduleStreakReminder() {
  try {
    // Cancel existing streak reminders before scheduling a new one
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.content.data?.type === 'streak_reminder') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Keep your streak alive!',
        body: "You haven't logged an idea today. Open IdeaVault and capture something great.",
        data: { type: 'streak_reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 0,
      },
    });
  } catch {
    // Scheduling not available — safe to ignore
  }
}
