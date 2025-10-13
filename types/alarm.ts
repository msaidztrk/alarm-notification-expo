export interface TimeWindow {
  id: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface Alarm {
  id: string;
  name: string;
  startTime: string; // HH:MM format (backward compatibility - first time window)
  endTime: string; // HH:MM format (backward compatibility - first time window)
  timeWindows?: TimeWindow[]; // Multiple time windows support
  isActive: boolean;
  repeatType: 'daily' | 'daily_today' | 'weekly'; // Tekrar türü - daily_today: sadece bugün için, gece yarısı otomatik silinir
  selectedDays?: number[]; // 0=Pazar, 1=Pazartesi, 2=Salı, ..., 6=Cumartesi
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