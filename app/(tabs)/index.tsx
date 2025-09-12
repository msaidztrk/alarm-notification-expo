import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert as AlertDialog,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Clock, Check, Pause, Play, Trash2, CreditCard as Edit3, Bell } from 'lucide-react-native';
import { Alert } from '@/types/Alert';
import { AlertService } from '@/services/AlertService';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAlerts = async () => {
    try {
      const allAlerts = await AlertService.getAllAlerts();
      setAlerts(allAlerts.sort((a, b) => a.time.localeCompare(b.time)));
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAlerts();
    }, [])
  );

  const handleToggleActive = async (alertId: string) => {
    try {
      await AlertService.toggleAlertActive(alertId);
      await loadAlerts();
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const handleMarkDone = async (alertId: string) => {
    try {
      await AlertService.markAlertAsDone(alertId);
      await loadAlerts();
    } catch (error) {
      console.error('Error marking alert as done:', error);
    }
  };

  const handleDelete = async (alert: Alert) => {
    AlertDialog.alert(
      'Delete Alert',
      `Are you sure you want to delete "${alert.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AlertService.deleteAlert(alert.id);
              await loadAlerts();
            } catch (error) {
              console.error('Error deleting alert:', error);
            }
          },
        },
      ]
    );
  };

  const renderAlertItem = ({ item }: { item: Alert }) => (
    <View style={[
      styles.alertCard,
      item.isDone && styles.doneCard,
      !item.isActive && styles.inactiveCard
    ]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <Text style={[
            styles.alertTitle,
            item.isDone && styles.doneText,
            !item.isActive && styles.inactiveText
          ]}>
            {item.title}
          </Text>
          {item.description && (
            <Text style={[
              styles.alertDescription,
              item.isDone && styles.doneText,
              !item.isActive && styles.inactiveText
            ]}>
              {item.description}
            </Text>
          )}
          <View style={styles.timeContainer}>
            <Clock size={16} color="#8E8E93" />
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        </View>
        
        <View style={styles.statusBadge}>
          {item.isDone ? (
            <View style={styles.doneBadge}>
              <Check size={16} color="#FFFFFF" />
            </View>
          ) : item.isActive ? (
            <View style={styles.activeBadge} />
          ) : (
            <View style={styles.pausedBadge} />
          )}
        </View>
      </View>

      <View style={styles.alertActions}>
        {!item.isDone && (
          <>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.toggleButton,
                item.isActive ? styles.pauseButton : styles.playButton
              ]}
              onPress={() => handleToggleActive(item.id)}
            >
              {item.isActive ? (
                <Pause size={16} color="#FFFFFF" />
              ) : (
                <Play size={16} color="#FFFFFF" />
              )}
              <Text style={styles.actionButtonText}>
                {item.isActive ? 'Pause' : 'Resume'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.doneButton]}
              onPress={() => handleMarkDone(item.id)}
            >
              <Check size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Done</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Trash2 size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const activeAlerts = alerts.filter(alert => !alert.isDone);
  const completedAlerts = alerts.filter(alert => alert.isDone);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Alerts</Text>
        <Text style={styles.headerSubtitle}>
          {activeAlerts.length} active • {completedAlerts.length} completed
        </Text>
      </View>

      <FlatList
        data={alerts}
        renderItem={renderAlertItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell size={64} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>No Alerts Yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the "Add Alert" tab to create your first alert
            </Text>
          </View>
        }
      />
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
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  doneCard: {
    opacity: 0.7,
    backgroundColor: '#F8F9FA',
  },
  inactiveCard: {
    backgroundColor: '#FAFAFA',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  alertInfo: {
    flex: 1,
    marginRight: 12,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
    lineHeight: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  doneText: {
    color: '#C7C7CC',
    textDecorationLine: 'line-through',
  },
  inactiveText: {
    color: '#C7C7CC',
  },
  statusBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
  },
  pausedBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF9500',
  },
  doneBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  toggleButton: {
    backgroundColor: '#007AFF',
  },
  playButton: {
    backgroundColor: '#34C759',
  },
  pauseButton: {
    backgroundColor: '#FF9500',
  },
  doneButton: {
    backgroundColor: '#34C759',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 40,
  },
});