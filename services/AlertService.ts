import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from '@/types/Alert';
import { NotificationService } from './NotificationService';

const ALERTS_STORAGE_KEY = 'alerts_storage';

export class AlertService {
  static async getAllAlerts(): Promise<Alert[]> {
    try {
      const alertsJson = await AsyncStorage.getItem(ALERTS_STORAGE_KEY);
      return alertsJson ? JSON.parse(alertsJson) : [];
    } catch (error) {
      console.error('Error getting alerts:', error);
      return [];
    }
  }

  static async saveAlert(alert: Alert): Promise<void> {
    try {
      const alerts = await this.getAllAlerts();
      const existingIndex = alerts.findIndex(a => a.id === alert.id);
      
      if (existingIndex >= 0) {
        alerts[existingIndex] = alert;
      } else {
        alerts.push(alert);
      }
      
      await AsyncStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
      
      // Schedule or cancel notification based on alert status
      if (alert.isActive && !alert.isDone) {
        await NotificationService.scheduleAlertNotification(alert);
      } else {
        await NotificationService.cancelAlertNotification(alert.id);
      }
    } catch (error) {
      console.error('Error saving alert:', error);
    }
  }

  static async deleteAlert(alertId: string): Promise<void> {
    try {
      const alerts = await this.getAllAlerts();
      const filteredAlerts = alerts.filter(alert => alert.id !== alertId);
      await AsyncStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(filteredAlerts));
      await NotificationService.cancelAlertNotification(alertId);
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  }

  static async markAlertAsDone(alertId: string): Promise<void> {
    try {
      const alerts = await this.getAllAlerts();
      const alertIndex = alerts.findIndex(alert => alert.id === alertId);
      
      if (alertIndex >= 0) {
        alerts[alertIndex] = {
          ...alerts[alertIndex],
          isDone: true,
          completedAt: new Date().toISOString(),
        };
        
        await AsyncStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
        await NotificationService.cancelAlertNotification(alertId);
      }
    } catch (error) {
      console.error('Error marking alert as done:', error);
    }
  }

  static async toggleAlertActive(alertId: string): Promise<void> {
    try {
      const alerts = await this.getAllAlerts();
      const alertIndex = alerts.findIndex(alert => alert.id === alertId);
      
      if (alertIndex >= 0) {
        const updatedAlert = {
          ...alerts[alertIndex],
          isActive: !alerts[alertIndex].isActive,
        };
        
        alerts[alertIndex] = updatedAlert;
        await AsyncStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
        
        // Update notification scheduling
        if (updatedAlert.isActive && !updatedAlert.isDone) {
          await NotificationService.scheduleAlertNotification(updatedAlert);
        } else {
          await NotificationService.cancelAlertNotification(alertId);
        }
      }
    } catch (error) {
      console.error('Error toggling alert active status:', error);
    }
  }
}