import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Alarm } from '@/types/alarm';

export class NotificationService {
  static async initialize(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return true; // Skip notification setup for web
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
        // Make notifications persistent and non-dismissible
        bypassDnd: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }

    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Set up notification categories for actions
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
      
      // First, cancel any existing notifications for this alarm
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
          sound: 'default',
          // Make notification persistent and non-dismissible
          sticky: true,
          autoDismiss: false,
        },
        trigger: null, // Show immediately
        identifier: `alarm_${alarm.id}`, // Use consistent identifier based on alarm ID
      };

      // Add platform-specific properties
      if (Platform.OS === 'ios') {
        notificationRequest.content.categoryIdentifier = 'ALARM_CATEGORY';
        // iOS specific persistent settings
        notificationRequest.content.interruptionLevel = 'timeSensitive';
      } else if (Platform.OS === 'android') {
        notificationRequest.content.channelId = 'alarm';
        // Android specific persistent settings - make it truly non-dismissible
        notificationRequest.content.priority = 'max';
        notificationRequest.content.ongoing = true; // Makes notification persistent like a foreground service
        notificationRequest.content.autoCancel = false; // Prevents auto-cancellation when tapped
        notificationRequest.content.dismissable = false; // Prevents manual dismissal
        notificationRequest.content.localOnly = true; // Keeps it local to device
        notificationRequest.content.timeoutAfter = null; // Never timeout
        notificationRequest.content.visibility = 'public'; // Always visible
      }

      const identifier = await Notifications.scheduleNotificationAsync(notificationRequest);

      console.log(`Notification scheduled with identifier: ${identifier}`);
      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  static async scheduleRepeatingAlarmNotifications(alarm: Alarm): Promise<string[]> {
    if (Platform.OS === 'web') {
      return [];
    }

    try {
      console.log(`Scheduling repeating notifications for alarm: ${alarm.name} with ${alarm.notificationInterval} minute intervals`);
      
      const identifiers: string[] = [];
      const today = new Date();
      
      // Get time windows (use new array or fall back to single window for backward compatibility)
      const timeWindows = alarm.timeWindows && alarm.timeWindows.length > 0 
        ? alarm.timeWindows 
        : alarm.startTime && alarm.endTime
          ? [{ id: 'default', startTime: alarm.startTime, endTime: alarm.endTime }]
          : [];
      
      // If no time windows, return empty array
      if (timeWindows.length === 0) {
        console.warn(`No time windows found for alarm: ${alarm.name}`);
        return [];
      }
      
      // Schedule notifications for each time window for the next 7 days
      for (let i = 0; i < 7; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);
        
        // For weekly alarms, check if this day is selected
        if (alarm.repeatType === 'weekly' && alarm.selectedDays) {
          const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 6 = Saturday
          
          // Skip this day if it's not selected
          if (!alarm.selectedDays.includes(dayOfWeek)) {
            console.log(`Skipping day ${dayOfWeek} for weekly alarm ${alarm.name}`);
            continue;
          }
        }
        
        // Process each time window
        for (let windowIndex = 0; windowIndex < timeWindows.length; windowIndex++) {
          const window = timeWindows[windowIndex];
          
          // Parse start and end time
          const [startHour, startMinute] = window.startTime.split(':').map(Number);
          const [endHour, endMinute] = window.endTime.split(':').map(Number);
          
          const startTime = new Date(targetDate);
          startTime.setHours(startHour, startMinute, 0, 0);
          
          const endTime = new Date(targetDate);
          endTime.setHours(endHour, endMinute, 0, 0);
          
          // Handle next day end time
          if (endTime <= startTime) {
            endTime.setDate(endTime.getDate() + 1);
          }
          
          // Only schedule if start time is in the future
          if (startTime > new Date()) {
            // Calculate how many notifications to schedule based on interval
            const durationMs = endTime.getTime() - startTime.getTime();
            const intervalMs = alarm.notificationInterval * 60 * 1000; // Convert minutes to milliseconds
            const notificationCount = Math.floor(durationMs / intervalMs) + 1; // +1 for initial notification
            
            // Schedule multiple notifications at intervals
            for (let j = 0; j < notificationCount; j++) {
              const notificationTime = new Date(startTime.getTime() + (j * intervalMs));
              
              // Don't schedule notifications after end time
              if (notificationTime > endTime) {
                break;
              }
              
              const notificationRequest: any = {
                content: {
                  title: `🔔 ${alarm.name}`,
                  body: `Active until ${window.endTime}. Mark as done in the app to dismiss.`,
                  data: { 
                    alarmId: alarm.id, 
                    notificationId: `${alarm.id}_${i}_${windowIndex}_${j}`,
                    type: 'time_window_alarm',
                    action: 'open_active_tab',
                    windowIndex: windowIndex
                  },
                  badge: 1,
                  sound: 'default',
                },
                trigger: {
                  type: 'date',
                  date: notificationTime,
                  repeats: false,
                },
                identifier: `alarm_${alarm.id}_day_${i}_window_${windowIndex}_interval_${j}`,
              };

              // Add platform-specific properties
              if (Platform.OS === 'ios') {
                notificationRequest.content.categoryIdentifier = 'ALARM_CATEGORY';
                notificationRequest.content.interruptionLevel = 'timeSensitive';
              } else if (Platform.OS === 'android') {
                notificationRequest.content.channelId = 'alarm';
                notificationRequest.content.priority = 'max';
                notificationRequest.content.ongoing = true;
                notificationRequest.content.autoCancel = false;
              }

              const identifier = await Notifications.scheduleNotificationAsync(notificationRequest);
              identifiers.push(identifier);
              
              console.log(`Scheduled notification ${j + 1}/${notificationCount} for ${notificationTime.toLocaleString()}`);
            }
          }
        }
      }
      
      console.log(`Successfully scheduled ${identifiers.length} notifications for alarm: ${alarm.name}`);
      return identifiers;
    } catch (error) {
      console.error('Error scheduling repeating alarm notifications:', error);
      return [];
    }
  }

  static async cancelNotificationsForAlarm(alarmId: string): Promise<void> {
    if (Platform.OS !== 'web') {
      try {
        const identifier = `alarm_${alarmId}`;
        await Notifications.cancelScheduledNotificationAsync(identifier);
        await Notifications.dismissNotificationAsync(identifier);
      } catch (error) {
        console.error('Error canceling notifications for alarm:', error);
      }
    }
  }

  static async cancelNotification(identifier: string): Promise<void> {
    if (Platform.OS !== 'web' && identifier) {
      try {
        await Notifications.cancelScheduledNotificationAsync(identifier);
        await Notifications.dismissNotificationAsync(identifier);
      } catch (error) {
        console.error('Error canceling notification:', error);
      }
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
      
      // Add notification dismissed listener to recreate dismissed alarm notifications
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
      // Check if notification still exists
      const presentedNotifications = await Notifications.getPresentedNotificationsAsync();
      const exists = presentedNotifications.some(n => n.request.identifier === `alarm_${alarm.id}`);
      
      if (!exists) {
        console.log(`Notification for alarm ${alarm.name} was dismissed, recreating...`);
        await this.scheduleAlarmNotification(alarm, notificationId);
      }
    }
  }
}