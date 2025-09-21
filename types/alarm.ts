export interface Alarm {
  id: string;
  name: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isActive: boolean;
  repeatType: 'daily' | 'once'; // Tekrar türü eklendi
  notificationInterval: 5 | 10 | 15 | 30 | 60; // Dakika cinsinden notification aralığı (60 = 1 saat)
  createdAt: number;
  completedToday?: boolean;
  lastCompletedDate?: string; // YYYY-MM-DD format
  lastNotificationId?: string;
}

export interface AlarmNotification {
  id: string;
  alarmId: string;
  alarmName: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  completedAt?: number;
  expiredAt?: number;
  createdAt: number;
  lastNotificationId?: string;
  completedForToday?: boolean;
}