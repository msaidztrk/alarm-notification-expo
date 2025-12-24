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
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { AlarmCard } from '@/components/AlarmCard';
import { useAlarms } from '@/hooks/useAlarms';
import { NotificationService } from '@/services/NotificationService';
import { Alarm } from '@/types/alarm';
import { useTranslation } from '@/services/LanguageProvider';
import { useTheme } from '@/services/ThemeProvider';
import { Clock, Bell, Plus } from 'lucide-react-native';

export default function AlarmsScreen() {
  const { t } = useTranslation();
  const { theme, isDarkMode } = useTheme();
  const { alarms, loading, updateAlarm, deleteAlarm, refresh, checkActiveAlarms } = useAlarms();

  // Premium colors
  const colors = {
    primary: isDarkMode ? '#818CF8' : '#6366F1',
    accent: isDarkMode ? '#FB923C' : '#F97316',
    success: '#10B981',
  };

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleToggleAlarm = async (id: string, isActive: boolean) => {
    await updateAlarm(id, { isActive });
  };

  const handleToggleSound = async (id: string, soundEnabled: boolean) => {
    await updateAlarm(id, { soundEnabled });
  };

  const handleDeleteAlarm = async (id: string) => {
    await deleteAlarm(id);
  };

  const handleEditAlarm = (alarm: Alarm) => {
    console.log('Edit alarm:', alarm);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={isDarkMode
          ? ['rgba(99, 102, 241, 0.15)', 'transparent'] as [string, string]
          : ['rgba(99, 102, 241, 0.08)', 'transparent'] as [string, string]
        }
        style={styles.headerGradient}
      />
      <View style={styles.headerContent}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {t('alarms.title')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {alarms.length} {alarms.length === 1 ? 'alarm' : 'alarms'}
          </Text>
        </View>

        <View style={[styles.headerIconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Clock size={24} color={colors.primary} />
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      {/* Decorative circles */}
      <View style={[styles.decorativeCircle, styles.circle1, { backgroundColor: colors.primary, opacity: 0.08 }]} />
      <View style={[styles.decorativeCircle, styles.circle2, { backgroundColor: colors.accent, opacity: 0.06 }]} />

      {/* Icon */}
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '15' }]}>
        <Bell size={48} color={colors.primary} />
      </View>

      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        {t('alarms.noAlarms')}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        {t('alarms.addFirstAlarm')}
      </Text>

      {/* Hint */}
      <View style={styles.hintContainer}>
        <Plus size={20} color={colors.primary} />
        <Text style={[styles.hintText, { color: colors.primary }]}>
          Tap + to add your first alarm
        </Text>
      </View>
    </View>
  );

  const renderAlarmCard = ({ item }: { item: Alarm }) => (
    <AlarmCard
      alarm={item}
      onToggle={handleToggleAlarm}
      onDelete={handleDeleteAlarm}
      onEdit={handleEditAlarm}
      onToggleSound={handleToggleSound}
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
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <FlatList
        data={alarms}
        renderItem={renderAlarmCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          alarms.length === 0 && styles.emptyListContainer,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={theme.card}
          />
        }
        ListHeaderComponent={alarms.length > 0 ? renderHeader : null}
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
    paddingBottom: 120,
  },
  emptyListContainer: {
    flex: 1,
  },

  // Header
  headerContainer: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  circle1: {
    width: 200,
    height: 200,
  },
  circle2: {
    width: 280,
    height: 280,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    gap: 8,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '500',
  },
});