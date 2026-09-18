import {
  Baloo2_500Medium,
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/baloo-2';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './src/i18n';
import RootNavigator from './src/navigation/RootNavigator';
import { initAds } from './src/ads/ads';

export default function App() {
  const [fontsLoaded] = useFonts({
    Baloo2_500Medium,
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
  });

  React.useEffect(() => {
    initAds();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFF9F2', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#C1440E" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
