/**
 * Premium Design System
 * Modern, glassmorphism-inspired color palette with dark mode support
 */

export const Colors = {
    light: {
        // Primary - Deep Indigo
        primary: '#6366F1',
        primaryLight: '#818CF8',
        primaryDark: '#4F46E5',

        // Success - Mint Green
        success: '#10B981',
        successLight: '#34D399',
        successDark: '#059669',

        // Accent - Soft Orange
        accent: '#F97316',
        accentLight: '#FB923C',
        accentDark: '#EA580C',

        // Surfaces
        background: '#F8FAFC',
        surface: '#FFFFFF',
        surfaceElevated: '#FFFFFF',
        surfaceGlass: 'rgba(255, 255, 255, 0.8)',

        // Text
        text: '#0F172A',
        textSecondary: '#64748B',
        textMuted: '#94A3B8',

        // Borders
        border: '#E2E8F0',
        borderLight: '#F1F5F9',

        // Status
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',

        // Gradients (start, end)
        gradientPrimary: ['#6366F1', '#8B5CF6'],
        gradientSuccess: ['#10B981', '#34D399'],
        gradientAccent: ['#F97316', '#FBBF24'],
        gradientSurface: ['#F8FAFC', '#FFFFFF'],
    },
    dark: {
        // Primary - Deep Indigo
        primary: '#818CF8',
        primaryLight: '#A5B4FC',
        primaryDark: '#6366F1',

        // Success - Mint Green
        success: '#34D399',
        successLight: '#6EE7B7',
        successDark: '#10B981',

        // Accent - Soft Orange
        accent: '#FB923C',
        accentLight: '#FDBA74',
        accentDark: '#F97316',

        // Surfaces
        background: '#0F172A',
        surface: '#1E293B',
        surfaceElevated: '#334155',
        surfaceGlass: 'rgba(30, 41, 59, 0.8)',

        // Text
        text: '#F8FAFC',
        textSecondary: '#94A3B8',
        textMuted: '#64748B',

        // Borders
        border: '#334155',
        borderLight: '#475569',

        // Status
        error: '#F87171',
        warning: '#FBBF24',
        info: '#60A5FA',

        // Gradients (start, end)
        gradientPrimary: ['#6366F1', '#8B5CF6'],
        gradientSuccess: ['#10B981', '#34D399'],
        gradientAccent: ['#F97316', '#FBBF24'],
        gradientSurface: ['#1E293B', '#334155'],
    },
} as const;

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
} as const;

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
} as const;

export const Shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
    },
    glow: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    }),
} as const;

export const Typography = {
    // Display
    displayLarge: {
        fontSize: 48,
        fontWeight: '300' as const,
        letterSpacing: -1,
        lineHeight: 56,
    },
    displayMedium: {
        fontSize: 38,
        fontWeight: '300' as const,
        letterSpacing: -0.5,
        lineHeight: 44,
    },

    // Headlines
    headlineLarge: {
        fontSize: 28,
        fontWeight: '600' as const,
        letterSpacing: -0.3,
        lineHeight: 36,
    },
    headlineMedium: {
        fontSize: 24,
        fontWeight: '600' as const,
        letterSpacing: -0.2,
        lineHeight: 32,
    },
    headlineSmall: {
        fontSize: 20,
        fontWeight: '600' as const,
        letterSpacing: 0,
        lineHeight: 28,
    },

    // Body
    bodyLarge: {
        fontSize: 18,
        fontWeight: '400' as const,
        letterSpacing: 0,
        lineHeight: 26,
    },
    bodyMedium: {
        fontSize: 16,
        fontWeight: '400' as const,
        letterSpacing: 0,
        lineHeight: 24,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400' as const,
        letterSpacing: 0.1,
        lineHeight: 20,
    },

    // Labels
    labelLarge: {
        fontSize: 14,
        fontWeight: '600' as const,
        letterSpacing: 0.5,
        lineHeight: 20,
    },
    labelMedium: {
        fontSize: 12,
        fontWeight: '500' as const,
        letterSpacing: 0.5,
        lineHeight: 16,
    },
    labelSmall: {
        fontSize: 10,
        fontWeight: '500' as const,
        letterSpacing: 0.5,
        lineHeight: 14,
    },
} as const;

export const Animation = {
    spring: {
        type: 'spring' as const,
        damping: 15,
        stiffness: 150,
        mass: 1,
    },
    springBouncy: {
        type: 'spring' as const,
        damping: 10,
        stiffness: 200,
        mass: 0.8,
    },
    timing: {
        fast: 150,
        normal: 300,
        slow: 500,
    },
} as const;
