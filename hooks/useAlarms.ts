import { useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AlarmService } from '@/services/alarmService';
import { NotificationService } from '@/services/NotificationService';
import { Alarm, AlarmNotification } from '@/types/alarm';

export function useAlarms() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [activeNotifications, setActiveNotifications] = useState<AlarmNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const loadAlarmsRef = useRef<(() => Promise<void>) | null>(null);
  const initializedRef = useRef(false);

  // Handle notification responses (when user taps notification)
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as any;
      
      if (data?.type === 'time_window_alarm' && data?.notificationId && typeof data.notificationId === 'string') {
        // Auto-complete notification when user taps it
        completeNotification(data.notificationId);
      }
      
      // Handle action responses (iOS)
      if (response.actionIdentifier === 'COMPLETE_ACTION' && data?.notificationId && typeof data.notificationId === 'string') {
        completeNotification(data.notificationId);
      }
    };

    NotificationService.setupNotificationResponseListener(handleNotificationResponse);
  }, []);

  const loadAlarms = useCallback(async () => {
    try {
      setLoading(true);
      
      // Only initialize clean state once on app launch
      if (!initializedRef.current) {
        console.log('First load - running initialization...');
        await AlarmService.initializeCleanState();
        initializedRef.current = true;
      }
      
      const loadedAlarms = await AlarmService.getAlarms();
      const notifications = await AlarmService.getActiveNotifications();
      setAlarms(loadedAlarms);
      setActiveNotifications(notifications);
    } catch (error) {
      console.error('Error loading alarms:', error);
    } finally {
      setLoading(false);
    }
  }, []); // Remove loading dependency to prevent loops

  // Store loadAlarms function in ref for use in checkActiveAlarms
  loadAlarmsRef.current = loadAlarms;

  const addAlarm = useCallback(async (alarmData: Omit<Alarm, 'id' | 'createdAt'>) => {
    try {
      await AlarmService.addAlarm(alarmData);
      await loadAlarms();
    } catch (error) {
      console.error('Error adding alarm:', error);
    }
  }, [loadAlarms]);

  const updateAlarm = useCallback(async (id: string, updates: Partial<Alarm>) => {
    try {
      await AlarmService.updateAlarm(id, updates);
      await loadAlarms();
    } catch (error) {
      console.error('Error updating alarm:', error);
    }
  }, [loadAlarms]);

  const deleteAlarm = useCallback(async (id: string) => {
    try {
      await AlarmService.deleteAlarm(id);
      await loadAlarms();
    } catch (error) {
      console.error('Error deleting alarm:', error);
    }
  }, [loadAlarms]);

  const completeNotification = useCallback(async (notificationId: string) => {
    try {
      await AlarmService.completeNotification(notificationId);
      await loadAlarms();
    } catch (error) {
      console.error('Error completing notification:', error);
    }
  }, [loadAlarms]);

  const checkActiveAlarms = useCallback(async () => {
    try {
      const currentTime = AlarmService.getCurrentTime();
      const loadedAlarms = await AlarmService.getAlarms();
      const currentActiveNotifications = await AlarmService.getActiveNotifications();
      
      // Reset daily completions if it's a new day
      await AlarmService.resetDailyCompletions();
      
      let hasChanges = false;
      
      for (const alarm of loadedAlarms) {
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
          console.log(`Creating notification for alarm: ${alarm.name} at ${currentTime}`);
          await AlarmService.createNotification(alarm);
          hasChanges = true;
        } else if (!isInWindow && existingNotification) {
          console.log(`Expiring notification for alarm: ${alarm.name} at ${currentTime}`);
          await AlarmService.expireNotification(existingNotification.id);
          hasChanges = true;
        } else if (isInWindow && existingNotification) {
          // Check if the system notification still exists, recreate if dismissed
          await NotificationService.recreateNotificationIfDismissed(alarm, existingNotification.id);
        }
      }
      
      // Only reload if there were actual changes
      if (hasChanges && loadAlarmsRef.current) {
        console.log(`Reloading alarms due to changes at ${currentTime}`);
        await loadAlarmsRef.current();
      }
    } catch (error) {
      console.error('Error checking active alarms:', error);
    }
  }, []); // No dependencies to prevent infinite loops

  useEffect(() => {
    loadAlarms();
  }, [loadAlarms]);

  useEffect(() => {
    // Check alarms immediately when component mounts and data is loaded
    if (!loading) {
      checkActiveAlarms();
    }
  }, [loading]); // Only depend on loading state for initial check

  useEffect(() => {
    // Set up interval to check every minute
    const interval = setInterval(() => {
      checkActiveAlarms();
    }, 60000);
    
    // Set up more frequent check for dismissed notifications (every 10 seconds)
    const dismissalCheckInterval = setInterval(async () => {
      const currentActiveNotifications = await AlarmService.getActiveNotifications();
      for (const notification of currentActiveNotifications) {
        const alarm = alarms.find(a => a.id === notification.alarmId);
        if (alarm && alarm.isActive && !AlarmService.isAlarmCompletedToday(alarm)) {
          await NotificationService.recreateNotificationIfDismissed(alarm, notification.id);
        }
      }
    }, 10000);
    
    return () => {
      clearInterval(interval);
      clearInterval(dismissalCheckInterval);
    };
  }, [alarms]); // Depend on alarms for the dismissal check

  return {
    alarms,
    activeNotifications,
    loading,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    completeNotification,
    checkActiveAlarms,
    refresh: loadAlarms,
  };
}