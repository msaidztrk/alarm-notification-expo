import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Alarm } from '@/types/alarm';

export class NotificationService {
  static async initialize(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return true;
    }

    let finalStatus = await Notifications.getPermissionsAsync();

    if (finalStatus.status !== 'granted') {
      finalStatus = await Notifications.requestPermissionsAsync();
    }

    if (finalStatus.status !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alarm', {
        name: 'Alarm notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#007AFF',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
        bypassDnd: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync('ALARM_CATEGORY', [
        {
          identifier: 'COMPLETE_ACTION',
          buttonTitle: 'Mark Complete',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
      ]);
    }

    return true;
  }

  static async scheduleAlarmNotification(alarm: Alarm, notificationId: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      console.log(`Scheduling notification for alarm: ${alarm.name}, ID: ${alarm.id}`);

      await this.cancelNotificationsForAlarm(alarm.id);

      const notificationRequest: any = {
        content: {
          title: `🔔 ${alarm.name}`,
          body: `Active until ${alarm.endTime}. Mark as done in the app to dismiss.`,
          data: {
            alarmId: alarm.id,
            notificationId,
            type: 'time_window_alarm',
            action: 'open_active_tab'
          },
          badge: 1,
          sound: alarm.soundEnabled ? 'default' : null,
          sticky: true,
          autoDismiss: false,
        },
        trigger: null,
        identifier: `alarm_${alarm.id}`,
      };

      if (Platform.OS === 'ios') {
        notificationRequest.content.categoryIdentifier = 'ALARM_CATEGORY';
        notificationRequest.content.interruptionLevel = 'timeSensitive';
      } else if (Platform.OS === 'android') {
        notificationRequest.content.channelId = 'alarm';
        notificationRequest.content.priority = 'max';
        notificationRequest.content.ongoing = true;
        notificationRequest.content.autoCancel = false;
        notificationRequest.content.dismissable = false;
        notificationRequest.content.localOnly = true;
        notificationRequest.content.timeoutAfter = null;
        notificationRequest.content.visibility = 'public';
      }

      const identifier = await Notifications.scheduleNotificationAsync(notificationRequest);

      console.log(`Notification scheduled with identifier: ${identifier}`);
      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * DİNAMİK BİLDİRİM SİSTEMİ
   * Sadece bugün ve yarın için bildirim oluşturur.
   * Her gün background task ile yeni günün bildirimleri eklenir.
   */
  static async scheduleRepeatingAlarmNotifications(alarm: Alarm): Promise<string[]> {
    if (Platform.OS === 'web') {
      return [];
    }

    try {
      const identifiers: string[] = [];
      const now = new Date();

      // Sadece BUGÜN ve YARIN için bildirim oluştur (2 gün)
      const DAYS_TO_SCHEDULE = 2;

      const timeWindows = alarm.timeWindows && alarm.timeWindows.length > 0
        ? alarm.timeWindows
        : alarm.startTime && alarm.endTime
          ? [{ id: 'default', startTime: alarm.startTime, endTime: alarm.endTime }]
          : [];

      if (timeWindows.length === 0) {
        console.warn(`No time windows found for alarm: ${alarm.name}`);
        return [];
      }

      console.log(`[Dynamic] Scheduling notifications for ${alarm.name} - Next ${DAYS_TO_SCHEDULE} days only`);

      for (let dayOffset = 0; dayOffset < DAYS_TO_SCHEDULE; dayOffset++) {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + dayOffset);
        targetDate.setHours(0, 0, 0, 0);

        // Weekly alarm kontrolü
        if (alarm.repeatType === 'weekly' && alarm.selectedDays) {
          const dayOfWeek = targetDate.getDay();
          if (!alarm.selectedDays.includes(dayOfWeek)) {
            continue;
          }
        }

        // Once/daily_today kontrolü - sadece bugün için
        if ((alarm.repeatType === 'daily_today' || (alarm as any).repeatType === 'once') && dayOffset > 0) {
          continue;
        }

        for (const window of timeWindows) {
          const scheduledCount = await this.scheduleWindowNotifications(
            alarm,
            targetDate,
            window,
            dayOffset
          );

          if (scheduledCount > 0) {
            console.log(`[Dynamic] Day ${dayOffset}: Scheduled ${scheduledCount} notifications for window ${window.startTime}-${window.endTime}`);
          }
        }
      }

      // Toplam zamanlanmış bildirimleri say
      const scheduled = await this.getScheduledNotificationsForAlarm(alarm.id);
      console.log(`[Dynamic] Total scheduled notifications for ${alarm.name}: ${scheduled.length}`);

      return identifiers;
    } catch (error) {
      console.error('Error scheduling repeating alarm notifications:', error);
      return [];
    }
  }

  /**
   * Belirli bir gün ve zaman penceresi için bildirimleri zamanlar
   */
  private static async scheduleWindowNotifications(
    alarm: Alarm,
    targetDate: Date,
    window: { id: string; startTime: string; endTime: string },
    dayOffset: number
  ): Promise<number> {
    const now = new Date();
    const [startHour, startMinute] = window.startTime.split(':').map(Number);
    const [endHour, endMinute] = window.endTime.split(':').map(Number);

    const startTime = new Date(targetDate);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(targetDate);
    endTime.setHours(endHour, endMinute, 0, 0);

    // Gece yarısını geçen zaman pencereleri
    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    // Eğer başlangıç zamanı geçmişse, şu anki zamandan başla
    let effectiveStartTime = startTime;
    if (startTime < now && dayOffset === 0) {
      // Bugün için: Bir sonraki interval zamanını hesapla
      const intervalMs = alarm.notificationInterval * 60 * 1000;
      const timeSinceStart = now.getTime() - startTime.getTime();
      const intervalsElapsed = Math.ceil(timeSinceStart / intervalMs);
      effectiveStartTime = new Date(startTime.getTime() + (intervalsElapsed * intervalMs));
    }

    // Eğer effective start time end time'dan sonraysa, bildirim zamanlamayı atla
    if (effectiveStartTime >= endTime) {
      return 0;
    }

    // Bildirim sayısını hesapla
    const durationMs = endTime.getTime() - effectiveStartTime.getTime();
    const intervalMs = alarm.notificationInterval * 60 * 1000;
    const notificationCount = Math.floor(durationMs / intervalMs) + 1;

    let scheduledCount = 0;

    for (let i = 0; i < notificationCount; i++) {
      const notificationTime = new Date(effectiveStartTime.getTime() + (i * intervalMs));

      if (notificationTime > endTime || notificationTime < now) {
        continue;
      }

      const identifier = `alarm_${alarm.id}_${targetDate.toISOString().split('T')[0]}_${window.id}_${i}`;

      const notificationRequest: any = {
        content: {
          title: `🔔 ${alarm.name}`,
          body: `Active until ${window.endTime}. Mark as done in the app to dismiss.`,
          data: {
            alarmId: alarm.id,
            notificationId: identifier,
            type: 'time_window_alarm',
            action: 'open_active_tab',
            windowId: window.id
          },
          badge: 1,
          sound: alarm.soundEnabled ? 'default' : null,
        },
        trigger: {
          type: 'date',
          date: notificationTime,
        },
        identifier,
      };

      if (Platform.OS === 'ios') {
        notificationRequest.content.categoryIdentifier = 'ALARM_CATEGORY';
        notificationRequest.content.interruptionLevel = 'timeSensitive';
      } else if (Platform.OS === 'android') {
        notificationRequest.content.channelId = 'alarm';
        notificationRequest.content.priority = 'max';
      }

      try {
        await Notifications.scheduleNotificationAsync(notificationRequest);
        scheduledCount++;
      } catch (error) {
        console.error(`Error scheduling notification at ${notificationTime}:`, error);
      }
    }

    return scheduledCount;
  }

  /**
   * Belirli bir alarm için zamanlanmış bildirimleri getirir
   */
  static async getScheduledNotificationsForAlarm(alarmId: string): Promise<Notifications.NotificationRequest[]> {
    if (Platform.OS === 'web') {
      return [];
    }

    try {
      const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
      return allScheduled.filter(n => n.identifier.includes(alarmId));
    } catch (error) {
      console.error('Error getting scheduled notifications for alarm:', error);
      return [];
    }
  }

  /**
   * Ertesi gün için bildirimleri yeniler (Background Task tarafından çağrılır)
   */
  static async refreshNotificationsForNextDay(alarms: Alarm[]): Promise<void> {
    console.log('[Dynamic] Refreshing notifications for next day...');

    for (const alarm of alarms) {
      if (!alarm.isActive) continue;

      // Eski bildirimleri temizle (geçmiş günler)
      await this.cleanupExpiredNotifications(alarm.id);

      // Yeni günün bildirimlerini ekle
      await this.scheduleRepeatingAlarmNotifications(alarm);
    }

    console.log('[Dynamic] Notification refresh complete');
  }

  /**
   * Geçmiş günlere ait bildirimleri temizler
   */
  private static async cleanupExpiredNotifications(alarmId: string): Promise<void> {
    try {
      const scheduled = await this.getScheduledNotificationsForAlarm(alarmId);
      const now = new Date();

      for (const notification of scheduled) {
        const trigger = notification.trigger as any;
        if (trigger?.date) {
          const triggerDate = new Date(trigger.date);
          if (triggerDate < now) {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
    }
  }

  static async cancelNotificationsForAlarm(alarmId: string): Promise<void> {
    if (Platform.OS !== 'web') {
      try {
        const canonical = `alarm_${alarmId}`;
        try {
          await Notifications.cancelScheduledNotificationAsync(canonical);
        } catch (e) { }
        try {
          await Notifications.dismissNotificationAsync(canonical);
        } catch (e) { }

        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const req of scheduled) {
          const id = (req as any).identifier || (req as any).id || '';
          if (id && id.includes(alarmId)) {
            try {
              await Notifications.cancelScheduledNotificationAsync(id);
            } catch (err) {
              console.warn(`Failed cancelling scheduled notification ${id}:`, err);
            }
          }
        }

        const presented = await Notifications.getPresentedNotificationsAsync();
        for (const p of presented) {
          const pid = p.request.identifier;
          if (pid && pid.includes(alarmId)) {
            try {
              await Notifications.dismissNotificationAsync(pid);
            } catch (err) {
              console.warn(`Failed dismissing presented notification ${pid}:`, err);
            }
          }
        }
      } catch (error) {
        console.error('Error canceling notifications for alarm:', error);
      }
    }
  }

  static async cancelNotification(identifier: string): Promise<void> {
    if (Platform.OS !== 'web' && identifier) {
      try {
        try {
          await Notifications.cancelScheduledNotificationAsync(identifier);
        } catch (e) { }
        try {
          await Notifications.dismissNotificationAsync(identifier);
        } catch (e) { }

        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const req of scheduled) {
          const id = (req as any).identifier || (req as any).id || '';
          if (id && identifier && id.includes(identifier)) {
            try {
              await Notifications.cancelScheduledNotificationAsync(id);
            } catch (err) {
              console.warn(`Failed cancelling fallback scheduled notification ${id}:`, err);
            }
          }
        }
      } catch (error) {
        console.error('Error canceling notification:', error);
      }
    }
  }

  static async dismissNotification(identifier: string): Promise<void> {
    if (Platform.OS !== 'web' && identifier) {
      try {
        await Notifications.dismissNotificationAsync(identifier);
      } catch (error) {
        console.error('Error dismissing notification:', error);
      }
    }
  }

  static async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    if (Platform.OS === 'web') {
      return [];
    }
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  static async getAllDeliveredNotifications(): Promise<Notifications.Notification[]> {
    if (Platform.OS === 'web') {
      return [];
    }
    try {
      return await Notifications.getPresentedNotificationsAsync();
    } catch (error) {
      console.error('Error getting delivered notifications:', error);
      return [];
    }
  }

  static async clearAllNotifications(): Promise<void> {
    if (Platform.OS !== 'web') {
      await Notifications.dismissAllNotificationsAsync();
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  }

  static async setupNotificationResponseListener(
    onNotificationResponse: (response: Notifications.NotificationResponse) => void
  ): Promise<void> {
    if (Platform.OS !== 'web') {
      Notifications.addNotificationResponseReceivedListener(onNotificationResponse);

      Notifications.addNotificationReceivedListener(async (notification) => {
        const data = notification.request.content.data as any;
        if (data?.type === 'time_window_alarm') {
          console.log('Alarm notification received - ensuring it stays persistent');
        }
      });
    }
  }

  static async recreateNotificationIfDismissed(alarm: Alarm, notificationId: string): Promise<void> {
    if (Platform.OS !== 'web') {
      if (!alarm.isActive) {
        return;
      }

      const presentedNotifications = await Notifications.getPresentedNotificationsAsync();
      const expectedId = `alarm_${alarm.id}`;
      const exists = presentedNotifications.some(n => n.request.identifier === expectedId || n.request.identifier.includes(alarm.id));

      if (!exists) {
        console.log(`Notification for alarm ${alarm.name} was dismissed, recreating...`);
        await this.scheduleAlarmNotification(alarm, notificationId);
      }
    }
  }
}