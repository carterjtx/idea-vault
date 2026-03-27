import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Streak } from '../lib/types';
import { isDemoMode } from '../lib/demoMode';
import { DEMO_STREAK } from '../lib/demoData';

const LOCAL_STREAK_KEY = 'ideavault_streak';

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function useStreak() {
  const [streak, setStreak] = useState<Streak>({
    user_id: '',
    current_streak: 0,
    last_logged: null,
    longest_streak: 0,
  });

  const loadStreak = useCallback(async () => {
    try {
      if (isDemoMode()) {
        setStreak(DEMO_STREAK);
        return;
      }

      if (!isSupabaseConfigured) {
        const stored = await AsyncStorage.getItem(LOCAL_STREAK_KEY);
        if (stored) setStreak(JSON.parse(stored));
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data, error } = await supabase
          .from('streaks')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (data && !error) {
          setStreak(data);
          await AsyncStorage.setItem(LOCAL_STREAK_KEY, JSON.stringify(data));
          return;
        }
      }

      // Fallback to local
      const stored = await AsyncStorage.getItem(LOCAL_STREAK_KEY);
      if (stored) {
        setStreak(JSON.parse(stored));
      }
    } catch {
      const stored = await AsyncStorage.getItem(LOCAL_STREAK_KEY);
      if (stored) {
        setStreak(JSON.parse(stored));
      }
    }
  }, []);

  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

  const logActivity = useCallback(async () => {
    const today = getTodayString();

    if (streak.last_logged === today) return; // Already logged today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak: number;
    if (streak.last_logged === yesterdayStr) {
      newStreak = streak.current_streak + 1;
    } else {
      newStreak = 1;
    }

    const updated: Streak = {
      ...streak,
      current_streak: newStreak,
      last_logged: today,
      longest_streak: Math.max(streak.longest_streak, newStreak),
    };

    setStreak(updated);
    await AsyncStorage.setItem(LOCAL_STREAK_KEY, JSON.stringify(updated));

    try {
      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          updated.user_id = session.user.id;
          await supabase
            .from('streaks')
            .upsert(updated, { onConflict: 'user_id' });
        }
      }
    } catch {
      // Saved locally, will sync later
    }
  }, [streak]);

  const hasLoggedToday = streak.last_logged === getTodayString();

  return {
    streak,
    logActivity,
    hasLoggedToday,
    loadStreak,
  };
}
