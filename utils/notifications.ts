import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
}

export async function scheduleDailyReminder(title: string, body: string) {
  await cancelDailyReminder();

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 18,
      minute: 0,
    },
  });
  
  return true;
}

export async function cancelDailyReminder() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function checkNotificationStatus() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return false;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.length > 0;
}
