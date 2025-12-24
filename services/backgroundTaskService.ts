import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AlarmService } from './alarmService';
import { NotificationService } from './NotificationService';

const BACKGROUND_ALARM_TASK = 'background-alarm-check';

// Son bildirim yenileme zamanını takip et
let lastNotificationRefreshDate: string | null = null;

// Define the background task
TaskManager.defineTask(BACKGROUND_ALARM_TASK, async () => {
  try {
    console.log('[Background] Alarm check started');

    const currentTime = AlarmService.getCurrentTime();
    const alarms = await AlarmService.getAlarms();
    const currentActiveNotifications = await AlarmService.getActiveNotifications();

    console.log(`[Background] Check at ${currentTime} - found ${alarms.length} alarms`);

    // Reset daily completions if it's a new day
    await AlarmService.resetDailyCompletions();

    // DİNAMİK BİLDİRİM YENİLEME
    // Her yeni gün için bildirimleri yenile
    const today = new Date().toISOString().split('T')[0];
    if (lastNotificationRefreshDate !== today) {
      console.log('[Background] New day detected - refreshing notifications for all alarms');

      const activeAlarms = alarms.filter(a => a.isActive);
      await NotificationService.refreshNotificationsForNextDay(activeAlarms);

      lastNotificationRefreshDate = today;
    }

    let hasChanges = false;

    for (const alarm of alarms) {
      if (!alarm.isActive) {
        continue;
      }

      // Check if alarm is already completed for today
      if (AlarmService.isAlarmCompletedToday(alarm)) {
        continue;
      }

      const isInWindow = AlarmService.isAlarmInAnyTimeWindow(alarm, currentTime);
      const existingNotification = currentActiveNotifications.find(n =>
        n.alarmId === alarm.id && n.isActive
      );

      if (isInWindow && !existingNotification) {
        console.log(`[Background] Creating notification for alarm: ${alarm.name}`);
        await AlarmService.createNotification(alarm);
        hasChanges = true;
      } else if (!isInWindow && existingNotification) {
        console.log(`[Background] Expiring notification for alarm: ${alarm.name}`);
        await AlarmService.expireNotification(existingNotification.id);
        hasChanges = true;
      } else if (isInWindow && existingNotification) {
        // Ensure notification still exists, recreate if needed
        await NotificationService.recreateNotificationIfDismissed(alarm, existingNotification.id);
      }
    }

    console.log(`[Background] Task completed. Changes: ${hasChanges}`);

    return hasChanges ? BackgroundFetch.BackgroundFetchResult.NewData : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('[Background] Task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export class BackgroundTaskService {
  static async initialize(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return true;
    }

    try {
      const status = await BackgroundFetch.getStatusAsync();
      if (status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
        status === BackgroundFetch.BackgroundFetchStatus.Denied) {
        console.log('Background fetch is not available');
        return false;
      }

      await BackgroundFetch.registerTaskAsync(BACKGROUND_ALARM_TASK, {
        minimumInterval: 60000, // 1 minute minimum interval
        stopOnTerminate: false,
        startOnBoot: true,
      });

      console.log('Background task registered successfully');

      // İlk başlatmada bugünün tarihini kaydet
      lastNotificationRefreshDate = new Date().toISOString().split('T')[0];

      return true;
    } catch (error) {
      console.error('Failed to register background task:', error);
      return false;
    }
  }

  /**
   * Uygulama açılışında bildirimleri yenile
   */
  static async refreshNotificationsOnAppStart(): Promise<void> {
    try {
      const alarms = await AlarmService.getAlarms();
      const activeAlarms = alarms.filter(a => a.isActive);

      console.log('[AppStart] Refreshing notifications for active alarms...');

      for (const alarm of activeAlarms) {
        await NotificationService.scheduleRepeatingAlarmNotifications(alarm);
      }

      const total = await NotificationService.getAllScheduledNotifications();
      console.log(`[AppStart] Total scheduled notifications: ${total.length}`);
    } catch (error) {
      console.error('[AppStart] Error refreshing notifications:', error);
    }
  }

  static async unregister(): Promise<void> {
    if (Platform.OS !== 'web') {
      try {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_ALARM_TASK);
        console.log('Background task unregistered');
      } catch (error) {
        console.error('Failed to unregister background task:', error);
      }
    }
  }

  static async isRegistered(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    try {
      return await TaskManager.isTaskRegisteredAsync(BACKGROUND_ALARM_TASK);
    } catch (error) {
      console.error('Error checking task registration:', error);
      return false;
    }
  }

  static async getStatus(): Promise<string> {
    if (Platform.OS === 'web') return 'Not supported on web';

    try {
      const status = await BackgroundFetch.getStatusAsync();
      switch (status) {
        case BackgroundFetch.BackgroundFetchStatus.Available:
          return 'Available';
        case BackgroundFetch.BackgroundFetchStatus.Denied:
          return 'Denied';
        case BackgroundFetch.BackgroundFetchStatus.Restricted:
          return 'Restricted';
        default:
          return 'Unknown';
      }
    } catch (error) {
      console.error('Error getting background fetch status:', error);
      return 'Error';
    }
  }
}