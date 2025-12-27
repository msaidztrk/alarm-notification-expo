import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/services/LanguageProvider';
import { useTheme } from '@/services/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Plus, Bell, Settings } from 'lucide-react-native';

interface TabIconProps {
  icon: React.ComponentType<any>;
  focused: boolean;
  color: string;
  isAddButton?: boolean;
}

function TabIcon({ icon: Icon, focused, color, isAddButton }: TabIconProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.1 : 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [focused]);

  if (isAddButton) {
    return (
      <Animated.View style={[styles.addButtonContainer, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={['#818CF8', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addButtonGradient}
        >
          <Icon size={22} color="#FFFFFF" strokeWidth={2.5} />
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
      <Icon
        size={22}
        color={color}
        strokeWidth={focused ? 2.5 : 2}
      />
    </Animated.View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  const tabBarBackground = isDarkMode
    ? 'rgba(20, 20, 30, 0.98)'
    : 'rgba(255, 255, 255, 0.98)';

  const activeColor = '#818CF8';
  const inactiveColor = isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.45)';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom + 16,
          left: 20,
          right: 20,
          height: 64,
          backgroundColor: tabBarBackground,
          borderRadius: 32,
          borderTopWidth: 0,
          paddingHorizontal: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 10,
          borderWidth: 1,
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
        },
        tabBarItemStyle: {
          height: 64,
          paddingVertical: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarShowLabel: true,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.alarms'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Clock} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Plus} focused={focused} color={color} isAddButton />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t('tabs.notifications'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Bell} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Settings} focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 28,
  },
  addButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});