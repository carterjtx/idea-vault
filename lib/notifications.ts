import * as Notifications from 'expo-notifications';
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

    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch {
    return null;
  }
}

export async function scheduleWeeklyDigest(totalUnactioned: number, topIdeaTitle: string) {
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
}

export async function scheduleStreakReminder() {
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
}
