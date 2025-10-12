module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    // Conditionally disable reanimated for release builds to avoid Windows path issues
    ...(process.env.NODE_ENV === 'production' ? [] : ['react-native-reanimated/plugin']),
  ],
};