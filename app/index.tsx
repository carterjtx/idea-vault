import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/theme';
import { loadDemoModeState } from '../lib/demoMode';

const ONBOARDING_KEY = 'ideavault_onboarding_complete';

export default function Index() {
  const [route, setRoute] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const isDemo = await loadDemoModeState();
        if (isDemo) {
          setRoute('/(tabs)/vault');
          return;
        }
        const done = await AsyncStorage.getItem(ONBOARDING_KEY);
        setRoute(done ? '/(auth)/login' : '/onboarding');
      } catch {
        setRoute('/onboarding');
      }
    })();
  }, []);

  if (!route) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  return <Redirect href={route as any} />;
}
