import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AlarmCard } from '@/components/AlarmCard';
import { useAlarms } from '@/hooks/useAlarms';
import { NotificationService } from '@/services/NotificationService';
import { Alarm } from '@/types/alarm';
import { useTranslation } from '@/services/LanguageProvider';
import { useTheme } from '@/services/ThemeProvider';

export default function AlarmsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { alarms, loading, updateAlarm, deleteAlarm, refresh, checkActiveAlarms } = useAlarms();

  // Tab'a odaklanıldığında verileri yenile
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleToggleAlarm = async (id: string, isActive: boolean) => {
    await updateAlarm(id, { isActive });
  };

  const handleDeleteAlarm = async (id: string) => {
    await deleteAlarm(id);
  };

  const handleEditAlarm = (alarm: Alarm) => {
    // For now, we'll implement basic editing by toggling active state
    // In a full implementation, this would navigate to an edit screen
    console.log('Edit alarm:', alarm);
  };

  const handleTestNotifications = async () => {
    console.log('Testing notifications...');
    // Force check active alarms
    await checkActiveAlarms();
    
        // Also test a direct notification
    const testAlarm: Alarm = {
      id: 'test_' + Date.now(),
      name: 'Test Notification',
      startTime: '00:00',
      endTime: '23:59',
      isActive: true,
      repeatType: 'daily',
      notificationInterval: 15,
      createdAt: Date.now()
    };
    
    await NotificationService.scheduleAlarmNotification(testAlarm, 'test_notification');
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{t('alarms.noAlarms')}</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        {t('alarms.addFirstAlarm')}
      </Text>
    </View>
  );

  const renderAlarmCard = ({ item }: { item: Alarm }) => (
    <AlarmCard
      alarm={item}
      onToggle={handleToggleAlarm}
      onDelete={handleDeleteAlarm}
      onEdit={handleEditAlarm}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={alarms}
        renderItem={renderAlarmCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={refresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7,
  },
});