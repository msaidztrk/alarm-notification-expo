import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { Alarm } from '@/types/alarm';
import { AlarmService } from '@/services/alarmService';
import { Trash2, Clock } from 'lucide-react-native';
import { useTranslation } from '@/services/LanguageProvider';
import { useTheme } from '@/services/ThemeProvider';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (alarm: Alarm) => void;
}

export function AlarmCard({ alarm, onToggle, onDelete, onEdit }: AlarmCardProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const currentTime = AlarmService.getCurrentTime();
  const isCurrentlyActive = AlarmService.isTimeInWindow(
    currentTime,
    alarm.startTime,
    alarm.endTime
  );

  const getStatusColor = () => {
    return alarm.isActive ? '#34C759' : '#8A8A8E';
  };

  const getStatusText = () => {
    return alarm.isActive ? 'Scheduled' : 'Off';
  };

  const getRepeatText = () => {
    // Simple repeat text based on your alarm data structure
    return 'Every Day'; // You can customize this based on your alarm repeat logic
  };

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        { backgroundColor: theme.card },
        { opacity: alarm.isActive ? 1 : 0.5 }
      ]}
      onPress={() => onEdit(alarm)}
      activeOpacity={0.7}
    >
      {/* Main content */}
      <View style={styles.mainContent}>
        <View style={styles.timeSection}>
          <View style={styles.startTimeContainer}>
            <Text style={[styles.timeText, { color: theme.text }]}>
              {alarm.startTime}
            </Text>
            <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>
              START
            </Text>
          </View>
          
          <Text style={[styles.timeSeparator, { color: theme.textSecondary }]}>
            -
          </Text>
          
          <View style={styles.endTimeContainer}>
            <Text style={[styles.timeText, { color: theme.text }]}>
              {alarm.endTime}
            </Text>
            <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>
              END
            </Text>
          </View>
        </View>
        
        <View style={styles.switchContainer}>
          <Switch
            value={alarm.isActive}
            onValueChange={(value) => onToggle(alarm.id, value)}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor='#FFFFFF'
            style={styles.switch}
          />
        </View>
      </View>

      {/* Bottom section */}
      <View style={[styles.bottomSection, { borderTopColor: theme.border }]}>
        <Text style={[styles.alarmName, { color: theme.text }]}>
          {alarm.name}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(alarm.id)}
        >
          <Trash2 size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  timeSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  startTimeContainer: {
    alignItems: 'center',
  },
  endTimeContainer: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 38,
    fontWeight: '300',
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  timeLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '300',
  },
  switchContainer: {
    alignItems: 'center',
    paddingLeft: 16,
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 0.33,
  },
  alarmName: {
    fontSize: 18,
    flex: 1,
    fontWeight: '400',
  },
  deleteButton: {
    padding: 4,
    paddingLeft: 16,
  },
});