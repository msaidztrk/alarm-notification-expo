import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert as AlertDialog,
} from 'react-native';
import { router } from 'expo-router';
import { Check, Clock, Plus } from 'lucide-react-native';
import { Alert } from '@/types/Alert';
import { AlertService } from '@/services/AlertService';
import { NotificationService } from '@/services/NotificationService';

export default function AddAlertScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('09:00');
  const [isLoading, setIsLoading] = useState(false);

  const handleTimeChange = (newTime: string) => {
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(newTime) || newTime === '') {
      setTime(newTime);
    }
  };

  const handleSaveAlert = async () => {
    if (!title.trim()) {
      AlertDialog.alert('Error', 'Please enter a title for your alert.');
      return;
    }

    if (!time.trim() || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      AlertDialog.alert('Error', 'Please enter a valid time (HH:MM format).');
      return;
    }

    setIsLoading(true);

    try {
      // Request notification permissions
      const hasPermission = await NotificationService.requestPermissions();
      if (!hasPermission) {
        AlertDialog.alert(
          'Notification Permission Required',
          'This app needs notification permissions to send you alerts. Please enable notifications in your device settings.'
        );
        setIsLoading(false);
        return;
      }

      const newAlert: Alert = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim() || undefined,
        time: time,
        isActive: true,
        isDone: false,
        createdAt: new Date().toISOString(),
      };

      await AlertService.saveAlert(newAlert);

      AlertDialog.alert(
        'Alert Created',
        `Your alert "${newAlert.title}" has been created and scheduled for ${newAlert.time} daily.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form
              setTitle('');
              setDescription('');
              setTime('09:00');
              // Navigate to alerts tab
              router.push('/(tabs)/');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving alert:', error);
      AlertDialog.alert('Error', 'Failed to create alert. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const predefinedTimes = [
    { label: '7:00 AM', value: '07:00' },
    { label: '9:00 AM', value: '09:00' },
    { label: '12:00 PM', value: '12:00' },
    { label: '3:00 PM', value: '15:00' },
    { label: '6:00 PM', value: '18:00' },
    { label: '9:00 PM', value: '21:00' },
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create New Alert</Text>
        <Text style={styles.headerSubtitle}>
          Set up a daily reminder that will persist until you mark it as done
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Alert Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter alert title"
              placeholderTextColor="#C7C7CC"
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add more details about this alert"
              placeholderTextColor="#C7C7CC"
              multiline
              numberOfLines={3}
              maxLength={300}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Schedule Time</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Time *</Text>
            <View style={styles.timeInputContainer}>
              <Clock size={20} color="#8E8E93" />
              <TextInput
                style={styles.timeInput}
                value={time}
                onChangeText={handleTimeChange}
                placeholder="09:00"
                placeholderTextColor="#C7C7CC"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>

          <Text style={styles.quickSelectLabel}>Quick Select:</Text>
          <View style={styles.predefinedTimesContainer}>
            {predefinedTimes.map((timeOption) => (
              <TouchableOpacity
                key={timeOption.value}
                style={[
                  styles.timeChip,
                  time === timeOption.value && styles.selectedTimeChip
                ]}
                onPress={() => setTime(timeOption.value)}
              >
                <Text style={[
                  styles.timeChipText,
                  time === timeOption.value && styles.selectedTimeChipText
                ]}>
                  {timeOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How Daily Alerts Work</Text>
            <Text style={styles.infoText}>
              • Your alert will appear as a notification every day at the specified time
            </Text>
            <Text style={styles.infoText}>
              • Notifications stay visible until you mark them as "done"
            </Text>
            <Text style={styles.infoText}>
              • You can pause or resume alerts anytime from the main screen
            </Text>
            <Text style={styles.infoText}>
              • Alerts work even when the app is closed or in the background
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.disabledButton]}
          onPress={handleSaveAlert}
          disabled={isLoading}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>
            {isLoading ? 'Creating...' : 'Create Alert'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E5EA',
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1C1C1E',
    borderColor: '#E5E5EA',
    borderWidth: 1,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderColor: '#E5E5EA',
    borderWidth: 1,
    gap: 12,
  },
  timeInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  quickSelectLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
    marginTop: 8,
  },
  predefinedTimesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5EA',
    borderWidth: 1,
  },
  selectedTimeChip: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  selectedTimeChipText: {
    color: '#FFFFFF',
  },
  infoSection: {
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    borderLeftColor: '#007AFF',
    borderLeftWidth: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
    marginBottom: 4,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E5EA',
    borderTopWidth: 0.5,
  },
  createButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#C7C7CC',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});