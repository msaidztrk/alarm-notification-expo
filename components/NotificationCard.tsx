import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { AlarmNotification } from '@/types/alarm';
import { CircleCheck as CheckCircle, Clock, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/services/ThemeProvider';

interface NotificationCardProps {
  notification: AlarmNotification;
  onComplete: (notificationId: string) => void;
}

export function NotificationCard({ notification, onComplete }: NotificationCardProps) {
  const { theme } = useTheme();
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.content}>
        <View style={styles.mainRow}>
          <View style={styles.leftSection}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <AlertCircle size={20} color="#FF9500" />
              </View>
              <View style={styles.titleSection}>
                <Text style={[styles.name, { color: theme.text }]}>{notification.alarmName}</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Active until {notification.endTime}
                </Text>
              </View>
            </View>

            <View style={styles.timeInfo}>
              <Clock size={12} color={theme.textSecondary} />
              <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                Started at {formatTime(notification.createdAt)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => onComplete(notification.id)}
          >
            <CheckCircle size={16} color="#ffffff" />
            <Text style={styles.completeText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  content: {
    padding: 12,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconContainer: {
    marginRight: 8,
  },
  titleSection: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 1,
  },
  subtitle: {
    fontSize: 13,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 80,
  },
  completeText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 12,
  },
});