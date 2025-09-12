import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Alert } from '@/types/Alert';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      if (Device.isDevice) {
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
          await Notifications.setNotificationChannelAsync('alerts', {
            name: 'Alert Notifications',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#007AFF',
            sound: 'default',
          });
        }
        
        return true;
      } else {
        console.log('Must use physical device for Push Notifications');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async scheduleAlertNotification(alert: Alert): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }

      // Cancel existing notification if any
      await this.cancelAlertNotification(alert.id);

      // Parse time
      const [hours, minutes] = alert.time.split(':').map(Number);
      
      // Create trigger for daily notifications
      const trigger: Notifications.NotificationTriggerInput = {
        hour: hours,
        minute: minutes,
        repeats: true,
      };

      const notificationId = await Notifications.scheduleNotificationAsync({
        identifier: alert.id,
        content: {
          title: alert.title,
          body: alert.description || 'Daily Alert',
          data: {
            alertId: alert.id,
            type: 'alert',
          },
          categoryIdentifier: 'alert',
          sticky: true, // Makes notification persistent on Android
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  static async cancelAlertNotification(alertId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(alertId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  static async cancelAllAlertNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  static async setupNotificationCategories(): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        await Notifications.setNotificationCategoryAsync('alert', [
          {
            identifier: 'mark_done',
            buttonTitle: 'Mark Done',
            options: {
              opensAppToForeground: true,
            },
          },
          {
            identifier: 'snooze',
            buttonTitle: 'Snooze',
            options: {
              opensAppToForeground: false,
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error setting up notification categories:', error);
    }
  }
}