import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TimePickerModal } from '@/components/TimePickerModal';
import { useAlarms } from '@/hooks/useAlarms';
import { Clock, Plus, AlarmClock, Info, ChevronRight, Bell, Calendar, Trash2, X } from 'lucide-react-native';
import { useTranslation } from '@/services/LanguageProvider';
import { useTheme } from '@/services/ThemeProvider';
import { TimeWindow } from '@/types/alarm';

export default function AddAlarmScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { addAlarm } = useAlarms();
  const [name, setName] = useState('');
  const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([
    { id: '1', startTime: '09:00', endTime: '17:00' }
  ]);
  const [repeatType, setRepeatType] = useState<'daily' | 'once'>('daily');
  const [notificationInterval, setNotificationInterval] = useState<5 | 10 | 15 | 30 | 60>(15);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingTimeWindow, setEditingTimeWindow] = useState<{ windowId: string; type: 'start' | 'end' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);

  // Tab'a odaklanıldığında form'u temizle
  useFocusEffect(
    React.useCallback(() => {
      setName('');
      setTimeWindows([{ id: '1', startTime: '09:00', endTime: '17:00' }]);
      setRepeatType('daily');
      setNotificationInterval(15);
      setIsSubmitting(false);
      setIsNameFocused(false);
    }, [])
  );

  const addTimeWindow = () => {
    const newId = Date.now().toString();
    setTimeWindows([...timeWindows, { id: newId, startTime: '09:00', endTime: '17:00' }]);
  };

  const removeTimeWindow = (id: string) => {
    if (timeWindows.length === 1) {
      Alert.alert(t('common.error'), t('addAlarm.atLeastOneTimeWindow'));
      return;
    }
    setTimeWindows(timeWindows.filter(window => window.id !== id));
  };

  const updateTimeWindow = (id: string, field: 'startTime' | 'endTime', value: string) => {
    setTimeWindows(timeWindows.map(window => 
      window.id === id ? { ...window, [field]: value } : window
    ));
  };

  const openTimePicker = (windowId: string, type: 'start' | 'end') => {
    setEditingTimeWindow({ windowId, type });
    setShowTimePicker(true);
  };

  const handleTimeSelect = (time: string) => {
    if (editingTimeWindow) {
      updateTimeWindow(
        editingTimeWindow.windowId, 
        editingTimeWindow.type === 'start' ? 'startTime' : 'endTime', 
        time
      );
    }
    setShowTimePicker(false);
    setEditingTimeWindow(null);
  };

  const calculateDuration = (start: string, end: string) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    let startMinutes = startHour * 60 + startMinute;
    let endMinutes = endHour * 60 + endMinute;
    
    // Handle overnight time window
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60; // Add 24 hours
    }
    
    const diffMinutes = endMinutes - startMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  const handleCreateAlarm = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('addAlarm.enterAlarmName'));
      return;
    }

    // Validate all time windows
    for (const window of timeWindows) {
      if (window.startTime === window.endTime) {
        Alert.alert(t('common.error'), t('addAlarm.startEndTimeSame'));
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Use first time window for backward compatibility
      const firstWindow = timeWindows[0];
      
      await addAlarm({
        name: name.trim(),
        startTime: firstWindow.startTime,
        endTime: firstWindow.endTime,
        timeWindows: timeWindows,
        isActive: true,
        repeatType,
        notificationInterval,
      });

      // Reset form
      setName('');
      setTimeWindows([{ id: '1', startTime: '09:00', endTime: '17:00' }]);
      setRepeatType('daily');
      setNotificationInterval(15);

      Alert.alert(t('common.success'), t('addAlarm.alarmCreatedSuccessfully'));
    } catch (error) {
      console.error('Error creating alarm:', error);
      Alert.alert(t('common.error'), t('addAlarm.failedToCreateAlarm'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    keyboardAvoid: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    form: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 100,
    },
    section: {
      marginBottom: 32,
    },
    sectionLabel: {
      fontSize: 16,
      fontWeight: '400',
      color: theme.text,
      marginBottom: 8,
    },
    nameInputContainer: {
      backgroundColor: theme.card,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 8,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: isNameFocused ? theme.primary : theme.border,
    },
    textInput: {
      fontSize: 16,
      color: theme.text,
      paddingBottom: 8,
    },
    charCount: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'right',
    },
    timeSelector: {
      backgroundColor: theme.card,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    timeSelectorLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    timeIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    timeSelectorLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 4,
    },
    timeSelectorValue: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
    },
    durationDisplay: {
      backgroundColor: theme.primary + '15',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    durationText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.primary,
    },
    timeCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      alignItems: 'center',
    },
    timeText: {
      fontSize: 18,
      fontWeight: '400',
      color: theme.text,
    },
    repeatOptionSelected: {
      backgroundColor: theme.primary + '10',
      borderWidth: 1,
      borderColor: theme.primary,
    },
    repeatTextSelected: {
      color: theme.primary,
      fontWeight: '500',
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.textSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioButtonSelected: {
      borderColor: theme.primary,
    },
    radioButtonInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.primary,
    },
    repeatOption: {
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      marginBottom: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    repeatOptionLast: {
      borderBottomWidth: 0,
    },
    repeatText: {
      fontSize: 16,
      color: theme.text,
    },
    infoSection: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    infoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.primary,
      marginLeft: 8,
    },
    infoList: {
      gap: 12,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    infoBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.primary,
      marginTop: 8,
      marginRight: 12,
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    bottomContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.card,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 34,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    createButton: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    disabledButton: {
      backgroundColor: theme.border,
      shadowOpacity: 0,
      elevation: 0,
    },
    createButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 8,
    },
    createButtonTextDisabled: {
      color: theme.textSecondary,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    addTimeWindowButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.primary + '15',
      borderRadius: 8,
      gap: 4,
    },
    addTimeWindowText: {
      color: theme.primary,
      fontSize: 14,
      fontWeight: '500',
    },
    timeWindowCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    timeWindowHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    timeWindowTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    removeTimeWindowButton: {
      padding: 4,
    },
    timeWindowTimes: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    timeWindowTimeSection: {
      flex: 1,
    },
    timeWindowTimeLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 6,
    },
    timeWindowTimeButton: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    timeWindowTimeValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    timeWindowSeparator: {
      paddingTop: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Form */}
          <View style={styles.form}>
            {/* Alarm Name Section */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('addAlarm.alarmName')}</Text>
              <View style={styles.nameInputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('addAlarm.alarmNamePlaceholder')}
                  placeholderTextColor={theme.textSecondary}
                  maxLength={50}
                  autoCapitalize="words"
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                />
                <Text style={styles.charCount}>{name.length}/50</Text>
              </View>
            </View>

            {/* Time Windows Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>{t('addAlarm.timeWindows')}</Text>
                <TouchableOpacity 
                  style={styles.addTimeWindowButton}
                  onPress={addTimeWindow}
                >
                  <Plus size={18} color={theme.primary} />
                  <Text style={styles.addTimeWindowText}>{t('addAlarm.addTimeWindow')}</Text>
                </TouchableOpacity>
              </View>

              {timeWindows.map((window, index) => (
                <View key={window.id} style={styles.timeWindowCard}>
                  <View style={styles.timeWindowHeader}>
                    <Text style={styles.timeWindowTitle}>
                      {t('addAlarm.timeWindow')} {index + 1}
                    </Text>
                    {timeWindows.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeTimeWindow(window.id)}
                        style={styles.removeTimeWindowButton}
                      >
                        <Trash2 size={18} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.timeWindowTimes}>
                    <View style={styles.timeWindowTimeSection}>
                      <Text style={styles.timeWindowTimeLabel}>{t('addAlarm.startTime')}</Text>
                      <TouchableOpacity
                        style={styles.timeWindowTimeButton}
                        onPress={() => openTimePicker(window.id, 'start')}
                      >
                        <Clock size={16} color={theme.primary} />
                        <Text style={styles.timeWindowTimeValue}>{window.startTime}</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.timeWindowSeparator}>
                      <ChevronRight size={20} color={theme.textSecondary} />
                    </View>

                    <View style={styles.timeWindowTimeSection}>
                      <Text style={styles.timeWindowTimeLabel}>{t('addAlarm.endTime')}</Text>
                      <TouchableOpacity
                        style={styles.timeWindowTimeButton}
                        onPress={() => openTimePicker(window.id, 'end')}
                      >
                        <Clock size={16} color={theme.primary} />
                        <Text style={styles.timeWindowTimeValue}>{window.endTime}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.durationDisplay}>
                    <Text style={styles.durationText}>
                      {t('addAlarm.duration')}: {calculateDuration(window.startTime, window.endTime)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Repeat Section */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('addAlarm.repeat')}</Text>
              
              <TouchableOpacity
                style={[styles.repeatOption, repeatType === 'daily' && styles.repeatOptionSelected]}
                onPress={() => setRepeatType('daily')}
              >
                <Text style={[styles.repeatText, repeatType === 'daily' && styles.repeatTextSelected]}>
                  {t('addAlarm.daily')}
                </Text>
                <View style={[styles.radioButton, repeatType === 'daily' && styles.radioButtonSelected]}>
                  {repeatType === 'daily' && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.repeatOption, repeatType === 'once' && styles.repeatOptionSelected]}
                onPress={() => setRepeatType('once')}
              >
                <Text style={[styles.repeatText, repeatType === 'once' && styles.repeatTextSelected]}>
                  {t('addAlarm.once')}
                </Text>
                <View style={[styles.radioButton, repeatType === 'once' && styles.radioButtonSelected]}>
                  {repeatType === 'once' && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>
            </View>

            {/* Notification Interval Section */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('addAlarm.notificationInterval')}</Text>
              
              <TouchableOpacity
                style={[styles.repeatOption, notificationInterval === 5 && styles.repeatOptionSelected]}
                onPress={() => setNotificationInterval(5)}
              >
                <Text style={[styles.repeatText, notificationInterval === 5 && styles.repeatTextSelected]}>
                  {t('addAlarm.every5Minutes')}
                </Text>
                <View style={[styles.radioButton, notificationInterval === 5 && styles.radioButtonSelected]}>
                  {notificationInterval === 5 && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.repeatOption, notificationInterval === 10 && styles.repeatOptionSelected]}
                onPress={() => setNotificationInterval(10)}
              >
                <Text style={[styles.repeatText, notificationInterval === 10 && styles.repeatTextSelected]}>
                  {t('addAlarm.every10Minutes')}
                </Text>
                <View style={[styles.radioButton, notificationInterval === 10 && styles.radioButtonSelected]}>
                  {notificationInterval === 10 && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.repeatOption, notificationInterval === 15 && styles.repeatOptionSelected]}
                onPress={() => setNotificationInterval(15)}
              >
                <Text style={[styles.repeatText, notificationInterval === 15 && styles.repeatTextSelected]}>
                  {t('addAlarm.every15Minutes')}
                </Text>
                <View style={[styles.radioButton, notificationInterval === 15 && styles.radioButtonSelected]}>
                  {notificationInterval === 15 && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.repeatOption, notificationInterval === 30 && styles.repeatOptionSelected]}
                onPress={() => setNotificationInterval(30)}
              >
                <Text style={[styles.repeatText, notificationInterval === 30 && styles.repeatTextSelected]}>
                  {t('addAlarm.every30Minutes')}
                </Text>
                <View style={[styles.radioButton, notificationInterval === 30 && styles.radioButtonSelected]}>
                  {notificationInterval === 30 && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.repeatOption, notificationInterval === 60 && styles.repeatOptionSelected]}
                onPress={() => setNotificationInterval(60)}
              >
                <Text style={[styles.repeatText, notificationInterval === 60 && styles.repeatTextSelected]}>
                  {t('addAlarm.every1Hour')}
                </Text>
                <View style={[styles.radioButton, notificationInterval === 60 && styles.radioButtonSelected]}>
                  {notificationInterval === 60 && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>
            </View>

            {/* Info Section */}
            <View style={styles.section}>
              <View style={styles.infoSection}>
                <View style={styles.infoHeader}>
                  <Info size={20} color={theme.primary} />
                  <Text style={styles.infoTitle}>{t('addAlarm.howItWorks')}</Text>
                </View>
                <View style={styles.infoList}>
                  <View style={styles.infoItem}>
                    <View style={styles.infoBullet} />
                    <Text style={styles.infoText}>{t('addAlarm.infoPoint1')}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <View style={styles.infoBullet} />
                    <Text style={styles.infoText}>{t('addAlarm.infoPoint2')}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <View style={styles.infoBullet} />
                    <Text style={styles.infoText}>{t('addAlarm.infoPoint3')}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.createButton, (isSubmitting || !name.trim()) && styles.disabledButton]}
            onPress={handleCreateAlarm}
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? (
              <Text style={styles.createButtonText}>
                {t('addAlarm.creating')}
              </Text>
            ) : (
              <>
                <Plus size={22} color="#ffffff" />
                <Text style={[styles.createButtonText, !name.trim() && styles.createButtonTextDisabled]}>
                  {t('addAlarm.createAlarm')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <TimePickerModal
        isVisible={showTimePicker}
        onClose={() => {
          setShowTimePicker(false);
          setEditingTimeWindow(null);
        }}
        onTimeSelect={handleTimeSelect}
        initialTime={
          editingTimeWindow 
            ? timeWindows.find(w => w.id === editingTimeWindow.windowId)?.[
                editingTimeWindow.type === 'start' ? 'startTime' : 'endTime'
              ] || '09:00'
            : '09:00'
        }
        title={
          editingTimeWindow?.type === 'start' 
            ? t('addAlarm.selectStartTime') 
            : t('addAlarm.selectEndTime')
        }
      />
    </SafeAreaView>
  );
}