import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { NotificationService } from '@/services/NotificationService';
import { BackgroundTaskService } from '@/services/backgroundTaskService';
import { AlarmService } from '@/services/alarmService';
import { NavigationService } from '@/services/navigationService';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { LanguageProvider } from '@/services/LanguageProvider';
import { ThemeProvider } from '@/services/ThemeProvider';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    const initializeServices = async () => {
      console.log('Initializing notifications and background tasks...');

      // Initialize notifications
      const hasNotificationPermission = await NotificationService.initialize();
      console.log('Notification permission granted:', hasNotificationPermission);

      // Clean up any out-of-window notifications
      await AlarmService.cleanupOutOfWindowNotifications();

      // Initialize daily cleanup for today-only alarms
      await AlarmService.initializeDailyCleanup();

      // Initialize background tasks
      const hasBackgroundPermission = await BackgroundTaskService.initialize();
      console.log('Background task permission granted:', hasBackgroundPermission);

      const backgroundStatus = await BackgroundTaskService.getStatus();
      console.log('Background fetch status:', backgroundStatus);

      // Configure deep linking
      NavigationService.configureDeepLinking();

      if (!hasNotificationPermission) {
        Alert.alert(
          'Notifications Required',
          'This app needs notification permissions to send you alarm reminders. Please enable notifications in your device settings.',
          [{ text: 'OK' }]
        );
      }

      if (!hasBackgroundPermission) {
        Alert.alert(
          'Background Processing',
          'For alarms to work when the app is closed, please allow background app refresh in your device settings.',
          [
            { text: 'OK' },
            {
              text: 'Settings',
              onPress: () => {
                // On Android, you might want to guide users to battery optimization settings
                console.log('Guide user to background app settings');
              }
            }
          ]
        );
      }

      // 2 dakikada bir alarm kontrolü başlat
      AlarmService.startAlarmChecker();
    };

    // Setup notification response listener
    const notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response received:', response);
        const data = response.notification.request.content.data;
        NavigationService.handleNotificationNavigation(data);
      }
    );

    initializeServices();

    return () => {
      notificationResponseSubscription.remove();
      // Uygulama kapanırken checker'ı durdur
      AlarmService.stopAlarmChecker();
    };
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </LanguageProvider>
    </ThemeProvider>
  );
}
