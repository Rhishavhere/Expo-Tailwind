import type { ExpoConfig } from 'expo/config';
const config: ExpoConfig = {
  name: 'Wayfarer', slug: 'wayfarer', version: '0.1.0', platforms: ['android'],
  orientation: 'portrait', scheme: 'wayfarer', userInterfaceStyle: 'light', newArchEnabled: true,
  android: { package: 'app.wayfarer.mobile', edgeToEdgeEnabled: true, predictiveBackGestureEnabled: true },
  plugins: ['expo-router', ['expo-splash-screen', { backgroundColor: '#F7F6F2' }]],
  experiments: { typedRoutes: true },
};
export default config;
