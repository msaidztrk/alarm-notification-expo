import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Alarm, AlarmNotification } from '@/types/alarm';
import { NotificationService } from './notificationService';

const ALARMS_STORAGE_KEY = 'time_window_alarms';
const NOTIFICATIONS_STORAGE_KEY = 'alarm_notifications';

export class AlarmService {
  static async initializeCleanState(): Promise<void> {
    // Clear all existing notifications to start fresh
    await NotificationService.clearAllNotifications();
    
    // Mark all stored notifications as expired to prevent duplicates
    const notifications = await this.getAllNotifications();
    const cleanedNotifications = notifications.map(n => ({
      ...n,
      isActive: false,
      expiredAt: n.expiredAt || Date.now()
    }));
    await this.saveNotifications(cleanedNotifications);
    
    // Force cleanup of any notifications outside time windows
    await this.cleanupOutOfWindowNotifications();
    
    // Reschedule all active alarms for background operation
    await this.rescheduleAllAlarms();
  }

  static async cleanupOutOfWindowNotifications(): Promise<void> {
    try {
      const currentTime = this.getCurrentTime();
      const activeNotifications = await this.getActiveNotifications();
      const alarms = await this.getAlarms();
      
      for (const notification of activeNotifications) {
        const alarm = alarms.find(a => a.id === notification.alarmId);
        if (alarm && !this.isTimeInWindow(currentTime, alarm.startTime, alarm.endTime)) {
          console.log(`Cleaning up out-of-window notification for ${alarm.name}`);
          await this.expireNotification(notification.id);
        }
      }
    } catch (error) {
      console.error('Error cleaning up out-of-window notifications:', error);
    }
  }

  static async rescheduleAllAlarms(): Promise<void> {
    try {
      console.log('Rescheduling all active alarms...');
      const alarms = await this.getAlarms();
      
      for (const alarm of alarms) {
        if (alarm.isActive && !this.isAlarmCompletedToday(alarm)) {
          await this.scheduleAlarmNotifications(alarm);
        }
      }
      
      console.log(`Rescheduled ${alarms.filter(a => a.isActive).length} active alarms`);
    } catch (error) {
      console.error('Error rescheduling alarms:', error);
    }
  }

  static async getAlarms(): Promise<Alarm[]> {
    try {
      const data = await AsyncStorage.getItem(ALARMS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting alarms:', error);
      return [];
    }
  }

  static async saveAlarms(alarms: Alarm[]): Promise<void> {
    try {
      await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
    } catch (error) {
      console.error('Error saving alarms:', error);
    }
  }

  static async addAlarm(alarm: Omit<Alarm, 'id' | 'createdAt'>): Promise<Alarm> {
    const newAlarm: Alarm = {
      ...alarm,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };

    const alarms = await this.getAlarms();
    alarms.push(newAlarm);
    await this.saveAlarms(alarms);
    
    // Schedule future notifications for this alarm
    if (newAlarm.isActive) {
      await this.scheduleAlarmNotifications(newAlarm);
    }
    
    return newAlarm;
  }

  static async updateAlarm(id: string, updates: Partial<Alarm>): Promise<void> {
    const alarms = await this.getAlarms();
    const index = alarms.findIndex(alarm => alarm.id === id);
    if (index !== -1) {
      const oldAlarm = alarms[index];
      alarms[index] = { ...alarms[index], ...updates };
      await this.saveAlarms(alarms);
      
      // Update scheduled notifications if alarm status or times changed
      if (updates.isActive !== undefined || updates.startTime || updates.endTime) {
        await this.cancelScheduledNotifications(id);
        if (alarms[index].isActive) {
          await this.scheduleAlarmNotifications(alarms[index]);
        }
      }
    }
  }

  static async scheduleAlarmNotifications(alarm: Alarm): Promise<void> {
    try {
      console.log(`Scheduling future notifications for alarm: ${alarm.name}`);
      await NotificationService.scheduleRepeatingAlarmNotifications(alarm);
    } catch (error) {
      console.error('Error scheduling alarm notifications:', error);
    }
  }

  static async cancelScheduledNotifications(alarmId: string): Promise<void> {
    try {
      // Cancel all scheduled notifications for this alarm
      for (let i = 0; i < 7; i++) {
        const identifier = `alarm_${alarmId}_day_${i}`;
        await NotificationService.cancelNotification(identifier);
      }
      console.log(`Cancelled scheduled notifications for alarm: ${alarmId}`);
    } catch (error) {
      console.error('Error cancelling scheduled notifications:', error);
    }
  }

  static async deleteAlarm(id: string): Promise<void> {
    // Cancel any notifications for this alarm first
    await NotificationService.cancelNotificationsForAlarm(id);
    await this.cancelScheduledNotifications(id);
    
    const alarms = await this.getAlarms();
    const filtered = alarms.filter(alarm => alarm.id !== id);
    await this.saveAlarms(filtered);
    
    // Also clean up any related notifications
    const notifications = await this.getAllNotifications();
    const filteredNotifications = notifications.filter(n => n.alarmId !== id);
    await this.saveNotifications(filteredNotifications);
  }

  static async getActiveNotifications(): Promise<AlarmNotification[]> {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const notifications: AlarmNotification[] = data ? JSON.parse(data) : [];
      
      // Filter out expired notifications
      const now = Date.now();
      const active = notifications.filter(notification => 
        notification.isActive && !notification.completedAt && !notification.expiredAt
      );
      
      return active;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  static async saveNotifications(notifications: AlarmNotification[]): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  static async createNotification(alarm: Alarm): Promise<AlarmNotification> {
    // First check if there's already an active notification for this alarm
    const existingNotifications = await this.getActiveNotifications();
    const existingNotification = existingNotifications.find(n => 
      n.alarmId === alarm.id && n.isActive
    );
    
    if (existingNotification) {
      // Return existing notification instead of creating a duplicate
      return existingNotification;
    }

    const notification: AlarmNotification = {
      id: `${alarm.id}_${Date.now()}`,
      alarmId: alarm.id,
      alarmName: alarm.name,
      startTime: alarm.startTime,
      endTime: alarm.endTime,
      isActive: true,
      createdAt: Date.now(),
    };

    const notifications = await this.getAllNotifications();
    notifications.push(notification);
    await this.saveNotifications(notifications);

    // Schedule system notification
    const systemNotificationId = await NotificationService.scheduleAlarmNotification(alarm, notification.id);
    if (systemNotificationId) {
      notification.lastNotificationId = systemNotificationId;
      // Update the notification with the system ID
      const updatedNotifications = notifications.map(n => 
        n.id === notification.id ? notification : n
      );
      await this.saveNotifications(updatedNotifications);
    }

    return notification;
  }

  static async completeNotification(notificationId: string): Promise<void> {
    const notifications = await this.getAllNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      const notification = notifications[index];
      
      // Cancel system notification using alarm-based identifier
      await NotificationService.cancelNotificationsForAlarm(notification.alarmId);
      
      notifications[index] = {
        ...notification,
        isActive: false,
        completedAt: Date.now(),
        completedForToday: true,
      };
      await this.saveNotifications(notifications);
      
      // Get the alarm to check its repeat type
      const alarms = await this.getAlarms();
      const alarm = alarms.find(a => a.id === notification.alarmId);
      
      if (alarm?.repeatType === 'once') {
        // If it's a one-time alarm, delete it completely
        await this.deleteAlarm(notification.alarmId);
      } else {
        // For recurring alarms, just mark as completed for today
        await this.markAlarmCompletedForToday(notification.alarmId);
      }
    }
  }

  static async markAlarmCompletedForToday(alarmId: string): Promise<void> {
    const alarms = await this.getAlarms();
    const index = alarms.findIndex(alarm => alarm.id === alarmId);
    if (index !== -1) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      alarms[index] = {
        ...alarms[index],
        completedToday: true,
        lastCompletedDate: today,
      };
      await this.saveAlarms(alarms);
    }
  }

  static isAlarmCompletedToday(alarm: Alarm): boolean {
    if (!alarm.completedToday || !alarm.lastCompletedDate) return false;
    
    const today = new Date().toISOString().split('T')[0];
    return alarm.lastCompletedDate === today;
  }

  static async resetDailyCompletions(): Promise<void> {
    const alarms = await this.getAlarms();
    const today = new Date().toISOString().split('T')[0];
    
    const updatedAlarms = alarms.map(alarm => ({
      ...alarm,
      completedToday: alarm.lastCompletedDate === today ? alarm.completedToday : false,
    }));
    
    await this.saveAlarms(updatedAlarms);
  }

  static async expireNotification(notificationId: string): Promise<void> {
    const notifications = await this.getAllNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      const notification = notifications[index];
      
      // Cancel system notification using alarm-based identifier
      await NotificationService.cancelNotificationsForAlarm(notification.alarmId);
      
      notifications[index] = {
        ...notification,
        isActive: false,
        expiredAt: Date.now(),
      };
      await this.saveNotifications(notifications);
    }
  }

  static async getAllNotifications(): Promise<AlarmNotification[]> {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting all notifications:', error);
      return [];
    }
  }

  static isTimeInWindow(currentTime: string, startTime: string, endTime: string): boolean {
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const currentMinutes = currentHour * 60 + currentMinute;
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    console.log(`Time window check: Current=${currentTime} (${currentMinutes}min), Window=${startTime}-${endTime} (${startMinutes}-${endMinutes}min)`);

    if (endMinutes < startMinutes) {
      // Time window crosses midnight
      const result = currentMinutes >= startMinutes || currentMinutes <= endMinutes;
      console.log(`Midnight crossing: ${result}`);
      return result;
    } else {
      // Normal time window within same day
      const result = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      console.log(`Normal window: ${result}`);
      return result;
    }
  }

  static getCurrentTime(): string {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    console.log(`Current time: ${timeString}`);
    return timeString;
  }
}