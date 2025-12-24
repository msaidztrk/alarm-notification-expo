import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlarmNotification } from '@/types/alarm';
import { CircleCheck as CheckCircle, Clock, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/services/ThemeProvider';

interface NotificationCardProps {
  notification: AlarmNotification;
  onComplete: (notificationId: string) => void;
}

export function NotificationCard({ notification, onComplete }: NotificationCardProps) {
  const { theme, isDarkMode } = useTheme();

  // Premium colors
  const colors = {
    accent: isDarkMode ? '#FB923C' : '#F97316',
    success: '#10B981',
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.cardBg,
        borderColor: colors.border,
      }
    ]}>
      {/* Accent bar */}
      <LinearGradient
        colors={['#F97316', '#FBBF24'] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.accentBar}
      />

      <View style={styles.content}>
        <View style={styles.mainRow}>
          <View style={styles.leftSection}>
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                <AlertCircle size={18} color={colors.accent} />
              </View>
              <View style={styles.titleSection}>
                <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                  {notification.alarmName}
                </Text>
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
            style={styles.completeButtonWrapper}
            onPress={() => onComplete(notification.id)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#34D399'] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.completeButton}
            >
              <CheckCircle size={16} color="#ffffff" />
              <Text style={styles.completeText}>Done</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  content: {
    padding: 14,
    paddingLeft: 18,
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
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleSection: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
  },
  completeButtonWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 6,
  },
  completeText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
});