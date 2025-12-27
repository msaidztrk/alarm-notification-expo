import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, ActivityIndicator, StyleSheet } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { NotificationService } from '@/services/NotificationService';
import { BackgroundTaskService } from '@/services/backgroundTaskService';
import { AlarmService } from '@/services/alarmService';
import { NavigationService } from '@/services/navigationService';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { LanguageProvider } from '@/services/LanguageProvider';
import { ThemeProvider, useTheme } from '@/services/ThemeProvider';

const ONBOARDING_KEY = '@onboarding_completed';

function RootLayoutContent() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useFrameworkReady();

  useEffect(() => {
    const checkOnboardingAndInitialize = async () => {
      try {
        // Check if onboarding is completed
        const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_KEY);

        if (onboardingCompleted !== 'true') {
          setShowOnboarding(true);
          setIsLoading(false);
          return;
        }

        // Initialize services only if onboarding is complete
        await initializeServices();
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsLoading(false);
      }
    };

    const initializeServices = async () => {
      console.log('Initializing notifications and background tasks...');

      // Android'de navigation bar'ı gizle
      if (Platform.OS === 'android') {
        try {
          await NavigationBar.setVisibilityAsync('hidden');
          await NavigationBar.setBehaviorAsync('overlay-swipe');
          await NavigationBar.setBackgroundColorAsync('transparent');
        } catch (error) {
          console.log('NavigationBar error:', error);
        }
      }

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

    checkOnboardingAndInitialize();

    return () => {
      notificationResponseSubscription.remove();
      // Uygulama kapanırken checker'ı durdur
      AlarmService.stopAlarmChecker();
    };
  }, []);

  // Redirect based on onboarding status
  useEffect(() => {
    if (!isLoading && showOnboarding) {
      router.replace('/onboarding');
    }
  }, [isLoading, showOnboarding]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" hidden={false} translucent backgroundColor="transparent" />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <RootLayoutContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
