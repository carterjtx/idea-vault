import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/theme';
import "../global.css";

const ONBOARDING_KEY = 'ideavault_onboarding_complete';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkInitialRoute();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inOnboarding = segments[0] === 'onboarding';
    const inAuth = segments[0] === '(auth)';

    if (needsOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    }
  }, [isReady, needsOnboarding, segments]);

  async function checkInitialRoute() {
    try {
      const onboardingDone = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!onboardingDone) {
        setNeedsOnboarding(true);
      }
    } catch {
      // Default to showing onboarding on error
      setNeedsOnboarding(true);
    } finally {
      setIsReady(true);
    }
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="onboarding/index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="idea/[id]"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
    </>
  );
}
