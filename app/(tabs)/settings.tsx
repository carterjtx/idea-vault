import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useIdeas } from '../../hooks/useIdeas';
import { isDemoMode, disableDemoMode } from '../../lib/demoMode';
import { registerForPushNotifications, scheduleWeeklyDigest, scheduleStreakReminder } from '../../lib/notifications';
import { Colors } from '../../constants/theme';

export default function SettingsScreen() {
  const { ideas, archivedIdeas } = useIdeas();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser({ email: session.user.email });
    });
  }, []);

  const handleToggleWeeklyDigest = async (value: boolean) => {
    setWeeklyDigest(value);
    if (value) {
      await registerForPushNotifications();
      const rawIdeas = ideas.filter((i) => i.status === 'Raw' || i.status === 'Analyzed');
      if (rawIdeas.length > 0) {
        await scheduleWeeklyDigest(rawIdeas.length, rawIdeas[0].title);
      }
    }
  };

  const handleToggleStreakReminders = async (value: boolean) => {
    setStreakReminders(value);
    if (value) {
      await registerForPushNotifications();
      await scheduleStreakReminder();
    }
  };

  const handleExportJSON = async () => {
    try {
      const data = JSON.stringify(ideas, null, 2);
      await Share.share({ message: data, title: 'IdeaVault Export (JSON)' });
    } catch {
      Alert.alert('Export Failed', 'Could not export your ideas.');
    }
  };

  const handleExportText = async () => {
    try {
      const text = ideas
        .map(
          (idea) =>
            `${idea.title}\nCategory: ${idea.category || 'None'} | Status: ${idea.status} | Score: ${idea.ai_score?.overall_score ?? 'N/A'}\n${idea.description || ''}\n${'—'.repeat(30)}`
        )
        .join('\n\n');
      await Share.share({ message: text, title: 'IdeaVault Export' });
    } catch {
      Alert.alert('Export Failed', 'Could not export your ideas.');
    }
  };

  const handleClearGraveyard = () => {
    if (archivedIdeas.length === 0) {
      Alert.alert('Empty', 'The graveyard is already empty.');
      return;
    }
    Alert.alert(
      'Clear Graveyard',
      `This will permanently remove ${archivedIdeas.length} archived idea${archivedIdeas.length !== 1 ? 's' : ''}. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            Alert.alert('Cleared', 'Graveyard has been emptied.');
          },
        },
      ]
    );
  };

  const handleExitDemo = async () => {
    Alert.alert(
      'Exit Demo Mode',
      'This will clear demo data and return to the login screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit Demo',
          style: 'destructive',
          onPress: async () => {
            await disableDemoMode();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Demo Banner */}
        {isDemoMode() && (
          <View style={styles.demoBanner}>
            <Ionicons name="play-circle" size={18} color={Colors.gold} />
            <View style={styles.demoBannerContent}>
              <Text style={styles.demoBannerTitle}>Demo Mode Active</Text>
              <Text style={styles.demoBannerText}>
                You're exploring with sample data. AI features use mock responses.
              </Text>
            </View>
          </View>
        )}

        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="person" size={18} color={Colors.textDim} />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Email</Text>
              <Text style={styles.rowValue}>
                {user?.email || 'Guest Mode'}
              </Text>
            </View>
          </View>

          {!user && (
            <Pressable
              onPress={() => router.push('/(auth)/login')}
              style={styles.signInRow}
            >
              <Ionicons name="log-in" size={18} color={Colors.gold} />
              <Text style={styles.signInText}>Sign in to sync your ideas</Text>
            </Pressable>
          )}
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabel}>
              <Ionicons name="mail" size={18} color={Colors.textDim} />
              <View>
                <Text style={styles.rowLabel}>Weekly Digest</Text>
                <Text style={styles.rowHint}>Monday 9am summary of your ideas</Text>
              </View>
            </View>
            <Switch
              value={weeklyDigest}
              onValueChange={handleToggleWeeklyDigest}
              trackColor={{ false: Colors.border, true: Colors.gold + '60' }}
              thumbColor={weeklyDigest ? Colors.gold : Colors.textMuted}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={styles.toggleLabel}>
              <Ionicons name="flame" size={18} color={Colors.textDim} />
              <View>
                <Text style={styles.rowLabel}>Streak Reminders</Text>
                <Text style={styles.rowHint}>Daily reminder at 8pm</Text>
              </View>
            </View>
            <Switch
              value={streakReminders}
              onValueChange={handleToggleStreakReminders}
              trackColor={{ false: Colors.border, true: Colors.gold + '60' }}
              thumbColor={streakReminders ? Colors.gold : Colors.textMuted}
            />
          </View>
        </View>

        {/* Data */}
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.card}>
          <Pressable onPress={handleExportJSON} style={styles.actionRow}>
            <Ionicons name="code-slash" size={18} color={Colors.textDim} />
            <Text style={styles.rowLabel}>Export as JSON</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable onPress={handleExportText} style={styles.actionRow}>
            <Ionicons name="document-text" size={18} color={Colors.textDim} />
            <Text style={styles.rowLabel}>Export as Plain Text</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable onPress={handleClearGraveyard} style={styles.actionRow}>
            <Ionicons name="trash" size={18} color={Colors.danger} />
            <Text style={[styles.rowLabel, styles.dangerLabel]}>
              Clear Graveyard ({archivedIdeas.length})
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </Pressable>
        </View>

        {/* Subscription placeholder */}
        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={styles.proCard}>
          <View style={styles.proHeader}>
            <Ionicons name="diamond" size={20} color={Colors.gold} />
            <Text style={styles.proTitle}>IdeaVault Pro</Text>
          </View>
          <Text style={styles.proDescription}>
            Unlimited AI analyses, priority support, and advanced analytics.
          </Text>
          <Pressable style={styles.proButton}>
            <Text style={styles.proButtonText}>Coming Soon</Text>
          </Pressable>
        </View>

        {/* Exit demo / Sign out */}
        {isDemoMode() && (
          <Pressable onPress={handleExitDemo} style={styles.signOutButton}>
            <Ionicons name="exit" size={18} color={Colors.danger} />
            <Text style={styles.signOutText}>Exit Demo Mode</Text>
          </Pressable>
        )}
        {user && !isDemoMode() && (
          <Pressable onPress={handleSignOut} style={styles.signOutButton}>
            <Ionicons name="log-out" size={18} color={Colors.danger} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        )}

        <Text style={styles.version}>IdeaVault v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 20,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  dangerLabel: {
    color: Colors.danger,
  },
  rowValue: {
    color: Colors.textDim,
    fontSize: 13,
    marginTop: 2,
  },
  rowHint: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  signInText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  proCard: {
    backgroundColor: Colors.gold + '10',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.gold + '30',
  },
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  proTitle: {
    color: Colors.gold,
    fontSize: 16,
    fontWeight: '800',
  },
  proDescription: {
    color: Colors.textDim,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  proButton: {
    backgroundColor: Colors.gold + '20',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gold + '40',
  },
  proButtonText: {
    color: Colors.goldDim,
    fontSize: 14,
    fontWeight: '700',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.danger + '30',
  },
  signOutText: {
    color: Colors.danger,
    fontSize: 15,
    fontWeight: '600',
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.gold + '10',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.gold + '30',
    marginTop: 8,
  },
  demoBannerContent: {
    flex: 1,
  },
  demoBannerTitle: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '700',
  },
  demoBannerText: {
    color: Colors.textDim,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 18,
  },
  version: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
  },
});
