import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NotificationCard } from '@/components/NotificationCard';
import { useAlarms } from '@/hooks/useAlarms';
import { AlarmNotification } from '@/types/alarm';
import { useTranslation } from '@/services/LanguageProvider';
import { useTheme } from '@/services/ThemeProvider';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { activeNotifications, loading, completeNotification, refresh } = useAlarms();

  // Tab'a odaklanıldığında verileri yenile
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleCompleteNotification = async (notificationId: string) => {
    await completeNotification(notificationId);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{t('notifications.noNotifications')}</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        When your alarms are in their active time windows, notifications will appear here
      </Text>
    </View>
  );

  const renderNotificationCard = ({ item }: { item: AlarmNotification }) => (
    <NotificationCard
      notification={item}
      onComplete={handleCompleteNotification}
    />
  );

  return (
    <SafeAreaView style={[
      styles.container,
      {
        backgroundColor: theme.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }
    ]}>
      <FlatList
        data={activeNotifications}
        renderItem={renderNotificationCard}
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
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});