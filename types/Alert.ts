export interface Alert {
  id: string;
  title: string;
  description?: string;
  time: string; // Format: "HH:MM"
  isActive: boolean;
  isDone: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface NotificationData {
  alertId: string;
  title: string;
  description?: string;
}