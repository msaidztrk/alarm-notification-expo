module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    // react-native-reanimated/plugin removed due to Windows path length issues
    // If you need reanimated, install it and uncomment the line below:
    // 'react-native-reanimated/plugin',
  ],
};