import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { NotificationService } from '@/services/NotificationService';
import { AlertService } from '@/services/AlertService';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Initialize notification categories
    NotificationService.setupNotificationCategories();

    // Handle notification interactions
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const { actionIdentifier, notification } = response;
        const alertId = notification.request.content.data?.alertId;

        if (alertId && actionIdentifier === 'mark_done') {
          await AlertService.markAlertAsDone(alertId as string);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}