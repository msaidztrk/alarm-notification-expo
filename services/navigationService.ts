import { router } from 'expo-router';
import * as Linking from 'expo-linking';

export class NavigationService {
  /**
   * Navigate to the active notifications tab
   */
  static navigateToActiveTab(): void {
    try {
      console.log('Navigating to active notifications tab');
      // Navigate to the notifications tab
      router.push('/notifications');
    } catch (error) {
      console.error('Error navigating to active tab:', error);
      // Fallback navigation
      this.navigateToActiveTabFallback();
    }
  }

  /**
   * Fallback navigation method using deep linking
   */
  static navigateToActiveTabFallback(): void {
    try {
      const url = Linking.createURL('/notifications');
      console.log('Fallback navigation URL:', url);
      Linking.openURL(url);
    } catch (error) {
      console.error('Error with fallback navigation:', error);
    }
  }

  /**
   * Handle notification response and navigate accordingly
   */
  static handleNotificationNavigation(data: any): void {
    if (data?.action === 'open_active_tab' && data?.type === 'time_window_alarm') {
      console.log('Handling notification tap - navigating to active tab');
      // Small delay to ensure app is fully loaded
      setTimeout(() => {
        this.navigateToActiveTab();
      }, 500);
    }
  }

  /**
   * Configure deep linking for the app
   */
  static configureDeepLinking(): void {
    // The deep linking configuration is handled by expo-router automatically
    // but we can add additional handling here if needed
    const url = Linking.createURL('/notifications');
    console.log('Deep link URL for notifications:', url);
  }
}