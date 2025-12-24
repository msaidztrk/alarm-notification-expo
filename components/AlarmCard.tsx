import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Alarm } from '@/types/alarm';
import { AlarmService } from '@/services/alarmService';
import { Trash2, Bell, Calendar } from 'lucide-react-native';
import { useTranslation } from '@/services/LanguageProvider';
import { useTheme } from '@/services/ThemeProvider';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (alarm: Alarm) => void;
  onToggleSound?: (id: string, soundEnabled: boolean) => void;
}

export const AlarmCard = React.memo(function AlarmCard({ alarm, onToggle, onDelete, onEdit, onToggleSound }: AlarmCardProps) {
  const { t } = useTranslation();
  const { theme, isDarkMode } = useTheme();

  const currentTime = useMemo(() => AlarmService.getCurrentTime(), []);
  const isCurrentlyActive = useMemo(() => AlarmService.isAlarmInAnyTimeWindow(alarm, currentTime), [alarm, currentTime]);

  const getRepeatText = useMemo(() => {
    if (alarm.repeatType === 'daily_today' || (alarm as any).repeatType === 'once') {
      return t('addAlarm.once');
    }

    if (alarm.repeatType === 'weekly' && alarm.selectedDays) {
      const dayNames = [
        t('addAlarm.sun'),
        t('addAlarm.mon'),
        t('addAlarm.tue'),
        t('addAlarm.wed'),
        t('addAlarm.thu'),
        t('addAlarm.fri'),
        t('addAlarm.sat'),
      ];

      if (alarm.selectedDays.length === 7) {
        return t('addAlarm.daily');
      }

      const weekdays = [1, 2, 3, 4, 5];
      if (weekdays.every(day => alarm.selectedDays!.includes(day)) && alarm.selectedDays.length === 5) {
        return t('addAlarm.weekdays');
      }

      const weekend = [0, 6];
      if (weekend.every(day => alarm.selectedDays!.includes(day)) && alarm.selectedDays.length === 2) {
        return t('addAlarm.weekend');
      }

      return alarm.selectedDays
        .sort((a, b) => a - b)
        .map(day => dayNames[day])
        .join(', ');
    }

    return t('addAlarm.daily');
  }, [alarm.repeatType, alarm.selectedDays, t]);

  const getTimeWindows = useMemo(() => {
    if (!alarm) {
      return [{ id: 'default', startTime: '09:00', endTime: '17:00' }];
    }

    if (alarm.timeWindows && alarm.timeWindows.length > 0) {
      return alarm.timeWindows;
    }

    const startTime = alarm.startTime || '09:00';
    const endTime = alarm.endTime || '17:00';

    return [{ id: 'default', startTime, endTime }];
  }, [alarm]);

  // Premium color palette
  const colors = {
    primary: isDarkMode ? '#818CF8' : '#6366F1',
    accent: isDarkMode ? '#FB923C' : '#F97316',
    success: '#10B981',
    error: '#EF4444',
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    border: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
          opacity: alarm.isActive ? 1 : 0.6,
        }
      ]}
      onPress={() => onEdit(alarm)}
      activeOpacity={0.85}
    >
      {/* Active gradient indicator */}
      {alarm.isActive && isCurrentlyActive && (
        <LinearGradient
          colors={['#10B981', '#34D399'] as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.activeIndicator}
        />
      )}

      {/* Main content */}
      <View style={styles.mainContent}>
        <View style={styles.leftContent}>
          <View style={styles.timeWindowsContainer}>
            {getTimeWindows.map((window, index) => (
              <View key={window.id} style={styles.timeSection}>
                {/* Start Time */}
                <View style={styles.timeBlock}>
                  <Text style={[
                    styles.timeText,
                    { color: alarm.isActive ? colors.primary : theme.textSecondary }
                  ]}>
                    {window.startTime}
                  </Text>
                  {index === 0 && (
                    <View style={[styles.timeBadge, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.timeBadgeText, { color: colors.primary }]}>START</Text>
                    </View>
                  )}
                </View>

                {/* Separator */}
                <View style={styles.separatorContainer}>
                  <View style={[styles.separatorLine, { backgroundColor: theme.border }]} />
                  <View style={[styles.separatorDot, { backgroundColor: alarm.isActive ? colors.primary : theme.textSecondary }]} />
                  <View style={[styles.separatorLine, { backgroundColor: theme.border }]} />
                </View>

                {/* End Time */}
                <View style={styles.timeBlock}>
                  <Text style={[
                    styles.timeText,
                    { color: alarm.isActive ? colors.accent : theme.textSecondary }
                  ]}>
                    {window.endTime}
                  </Text>
                  {index === 0 && (
                    <View style={[styles.timeBadge, { backgroundColor: colors.accent + '20' }]}>
                      <Text style={[styles.timeBadgeText, { color: colors.accent }]}>END</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.switchContainer}>
          <Switch
            value={alarm.isActive}
            onValueChange={(value) => onToggle(alarm.id, value)}
            trackColor={{ false: isDarkMode ? '#374151' : '#E5E5EA', true: colors.success }}
            thumbColor='#FFFFFF'
            style={styles.switch}
          />
        </View>
      </View>

      {/* Bottom section */}
      <View style={[styles.bottomSection, { borderTopColor: colors.border }]}>
        <View style={styles.infoSection}>
          <Text style={[styles.alarmName, { color: theme.text }]} numberOfLines={1}>
            {alarm.name}
          </Text>
          <View style={styles.metaRow}>
            <Calendar size={12} color={theme.textSecondary} />
            <Text style={[styles.repeatText, { color: theme.textSecondary }]}>
              {getRepeatText}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {onToggleSound && (
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: alarm.soundEnabled ? colors.success + '15' : 'transparent' }]}
              onPress={() => onToggleSound(alarm.id, !alarm.soundEnabled)}
            >
              <Bell size={18} color={alarm.soundEnabled ? colors.success : theme.textSecondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.error + '10' }]}
            onPress={() => onDelete(alarm.id)}
          >
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  leftContent: {
    flex: 1,
  },
  timeWindowsContainer: {
    gap: 12,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBlock: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  timeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  separatorLine: {
    width: 10,
    height: 1,
  },
  separatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  switchContainer: {
    alignItems: 'center',
    paddingLeft: 16,
  },
  switch: {
    transform: [{ scaleX: 1.15 }, { scaleY: 1.15 }],
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  infoSection: {
    flex: 1,
    gap: 4,
  },
  alarmName: {
    fontSize: 17,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  repeatText: {
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});