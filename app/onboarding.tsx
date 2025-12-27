import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/services/ThemeProvider';
import { useTranslation } from '@/services/LanguageProvider';
import { Clock, Bell, Sparkles, ChevronRight, Check } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const ONBOARDING_KEY = '@onboarding_completed';

interface SlideData {
  id: string;
  icon: React.ComponentType<any>;
  gradientColors: [string, string];
  titleKey: string;
  descriptionKey: string;
}

const slides: SlideData[] = [
  {
    id: '1',
    icon: Clock,
    gradientColors: ['#6366F1', '#818CF8'],
    titleKey: 'onboarding.slide1Title',
    descriptionKey: 'onboarding.slide1Description',
  },
  {
    id: '2',
    icon: Bell,
    gradientColors: ['#F97316', '#FB923C'],
    titleKey: 'onboarding.slide2Title',
    descriptionKey: 'onboarding.slide2Description',
  },
  {
    id: '3',
    icon: Sparkles,
    gradientColors: ['#10B981', '#34D399'],
    titleKey: 'onboarding.slide3Title',
    descriptionKey: 'onboarding.slide3Description',
  },
];

export default function OnboardingScreen() {
  const { theme, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      router.replace('/(tabs)');
    }
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item, index }: { item: SlideData; index: number }) => {
    const IconComponent = item.icon;
    
    return (
      <View style={[styles.slide, { backgroundColor: theme.background }]}>
        {/* Background decorative elements */}
        <View style={styles.decorativeContainer}>
          <View style={[styles.decorativeCircle, styles.circle1, { backgroundColor: item.gradientColors[0], opacity: 0.08 }]} />
          <View style={[styles.decorativeCircle, styles.circle2, { backgroundColor: item.gradientColors[1], opacity: 0.05 }]} />
          <View style={[styles.decorativeCircle, styles.circle3, { backgroundColor: item.gradientColors[0], opacity: 0.03 }]} />
        </View>

        {/* Content */}
        <View style={styles.slideContent}>
          {/* Icon Container */}
          <LinearGradient
            colors={item.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <IconComponent size={64} color="#FFFFFF" strokeWidth={1.5} />
          </LinearGradient>

          {/* Text Content */}
          <Text style={[styles.title, { color: theme.text }]}>
            {t(item.titleKey)}
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {t(item.descriptionKey)}
          </Text>
        </View>

        {/* Step indicator */}
        <View style={[styles.stepBadge, { backgroundColor: item.gradientColors[0] + '20' }]}>
          <Text style={[styles.stepText, { color: item.gradientColors[0] }]}>
            {index + 1} / {slides.length}
          </Text>
        </View>
      </View>
    );
  };

  const renderPaginationDots = () => (
    <View style={styles.paginationContainer}>
      {slides.map((slide, index) => (
        <View
          key={slide.id}
          style={[
            styles.dot,
            {
              backgroundColor: index === currentIndex 
                ? slides[currentIndex].gradientColors[0]
                : isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
              width: index === currentIndex ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );

  const isLastSlide = currentIndex === slides.length - 1;
  const currentGradient = slides[currentIndex].gradientColors;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Skip button */}
      {!isLastSlide && (
        <TouchableOpacity
          style={[styles.skipButton, { top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 60 }]}
          onPress={handleSkip}
        >
          <Text style={[styles.skipText, { color: theme.textSecondary }]}>
            {t('onboarding.skip')}
          </Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Bottom section */}
      <View style={[styles.bottomSection, { backgroundColor: theme.background }]}>
        {renderPaginationDots()}

        {/* Action Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={isLastSlide ? handleComplete : handleNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={currentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionButtonGradient}
          >
            <Text style={styles.actionButtonText}>
              {isLastSlide ? t('onboarding.getStarted') : t('onboarding.next')}
            </Text>
            {isLastSlide ? (
              <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
            ) : (
              <ChevronRight size={20} color="#FFFFFF" strokeWidth={2.5} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 400,
    height: 400,
    bottom: -150,
    left: -150,
  },
  circle3: {
    width: 200,
    height: 200,
    top: '40%',
    right: -50,
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.8,
  },
  stepBadge: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 60,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 40 : 50,
    paddingTop: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
