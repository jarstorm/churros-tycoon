import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTranslation } from 'react-i18next';

import LocationScreen from '../screens/LocationScreen';
import RecipeScreen from '../screens/RecipeScreen';
import ShopScreen from '../screens/ShopScreen';
import SimulationScreen from '../screens/SimulationScreen';
import StandScreen from '../screens/StandScreen';
import UpgradesScreen from '../screens/UpgradesScreen';
import { FONT } from '../theme/type';

export type RootStackParamList = {
  Stand: undefined;
  Shop: undefined;
  Recipe: undefined;
  Upgrades: undefined;
  Location: undefined;
  Simulation: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#C1440E' },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontFamily: FONT.black, fontWeight: '800' },
        }}
      >
        <Stack.Screen name="Stand" component={StandScreen} options={{ title: t('nav.stand') }} />
        <Stack.Screen name="Shop" component={ShopScreen} options={{ title: t('nav.shop') }} />
        <Stack.Screen name="Recipe" component={RecipeScreen} options={{ title: t('nav.recipe') }} />
        <Stack.Screen name="Upgrades" component={UpgradesScreen} options={{ title: t('nav.upgrades') }} />
        <Stack.Screen name="Location" component={LocationScreen} options={{ title: t('nav.location') }} />
        <Stack.Screen name="Simulation" component={SimulationScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
