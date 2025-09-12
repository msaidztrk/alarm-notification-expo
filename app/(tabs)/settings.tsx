import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert as AlertDialog,
  Switch,
} from 'react-native';
import { 
  Bell, 
  Trash2, 
  Shield, 
  Info,
  BellRing,
  Volume2
} from 'lucide-react-native';
import { AlertService } from '@/services/AlertService';
import { NotificationService } from '@/services/NotificationService';
import * as Notifications from 'expo-notifications';

export default function SettingsScreen() {
  const [alertCount, setAlertCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const alerts = await AlertService.getAllAlerts();
      setAlertCount(alerts.length);

      const { status } = await Notifications.getPermissionsAsync();
      setNotificationsEnabled(status === 'granted');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleRequestNotificationPermissions = async () => {
    try {
      const hasPermission = await NotificationService.requestPermissions();
      setNotificationsEnabled(hasPermission);
      
      if (hasPermission) {
        AlertDialog.alert(
          'Permissions Granted',
          'Notification permissions have been granted. Your alerts will now work properly.'
        );
      } else {
        AlertDialog.alert(
          'Permissions Denied',
          'Please enable notifications in your device settings to receive alerts.'
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const handleClearAllAlerts = () => {
    AlertDialog.alert(
      'Clear All Alerts',
      `Are you sure you want to delete all ${alertCount} alerts? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              const alerts = await AlertService.getAllAlerts();
              for (const alert of alerts) {
                await AlertService.deleteAlert(alert.id);
              }
              setAlertCount(0);
              AlertDialog.alert('Success', 'All alerts have been deleted.');
            } catch (error) {
              console.error('Error clearing alerts:', error);
              AlertDialog.alert('Error', 'Failed to delete alerts. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleTestNotification = async () => {
    try {
      const hasPermission = await NotificationService.requestPermissions();
      if (!hasPermission) {
        AlertDialog.alert('Error', 'Notification permissions are required to test notifications.');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'This is a test notification from Alert Manager!',
          data: { type: 'test' },
        },
        trigger: { seconds: 1 },
      });

      AlertDialog.alert('Test Sent', 'A test notification has been sent.');
    } catch (error) {
      console.error('Error sending test notification:', error);
      AlertDialog.alert('Error', 'Failed to send test notification.');
    }
  };

  const settingSections = [
    {
      title: 'Notifications',
      items: [
        {
          icon: <Bell size={20} color="#007AFF" />,
          title: 'Notification Permissions',
          subtitle: notificationsEnabled ? 'Enabled' : 'Disabled',
          action: 'toggle',
          value: notificationsEnabled,
          onPress: handleRequestNotificationPermissions,
        },
        {
          icon: <BellRing size={20} color="#34C759" />,
          title: 'Test Notification',
          subtitle: 'Send a test notification',
          action: 'button',
          onPress: handleTestNotification,
        },
      ],
    },
    {
      title: 'Data Management',
      items: [
        {
          icon: <Trash2 size={20} color="#FF3B30" />,
          title: 'Clear All Alerts',
          subtitle: `Delete all ${alertCount} alerts`,
          action: 'button',
          onPress: handleClearAllAlerts,
          disabled: alertCount === 0,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: <Info size={20} color="#8E8E93" />,
          title: 'Version',
          subtitle: '1.0.0',
          action: 'none',
        },
        {
          icon: <Shield size={20} color="#8E8E93" />,
          title: 'Privacy',
          subtitle: 'All data stored locally on your device',
          action: 'none',
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.title}
      style={[styles.settingItem, item.disabled && styles.disabledItem]}
      onPress={item.onPress}
      disabled={item.disabled || item.action === 'none'}
    >
      <View style={styles.settingIcon}>
        {item.icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, item.disabled && styles.disabledText]}>
          {item.title}
        </Text>
        <Text style={[styles.settingSubtitle, item.disabled && styles.disabledText]}>
          {item.subtitle}
        </Text>
      </View>
      {item.action === 'toggle' && (
        <Switch
          value={item.value}
          onValueChange={item.onPress}
          trackColor={{ false: '#E5E5EA', true: '#34C759' }}
          thumbColor="#FFFFFF"
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>
          Manage your alerts and app preferences
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How to Use Alert Manager</Text>
            <Text style={styles.infoText}>
              1. Create alerts with custom titles and times
            </Text>
            <Text style={styles.infoText}>
              2. Alerts will notify you daily at the specified time
            </Text>
            <Text style={styles.infoText}>
              3. Mark alerts as "done" to dismiss them
            </Text>
            <Text style={styles.infoText}>
              4. Pause and resume alerts as needed
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
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
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomColor: '#E5E5EA',
    borderBottomWidth: 0.5,
  },
  disabledItem: {
    opacity: 0.5,
  },
  settingIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  disabledText: {
    color: '#C7C7CC',
  },
  infoSection: {
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderLeftColor: '#007AFF',
    borderLeftWidth: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
    marginBottom: 8,
  },
});