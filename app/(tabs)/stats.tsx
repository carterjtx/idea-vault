import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useIdeas } from '../../hooks/useIdeas';
import { useStreak } from '../../hooks/useStreak';
import { getWeeklyNudge, isClaudeConfigured } from '../../lib/claude';
import { isDemoMode } from '../../lib/demoMode';
import { MOCK_WEEKLY_NUDGE } from '../../lib/demoData';
import { Colors, Shadows } from '../../constants/theme';
import { isSmallScreen, isLargeScreen, fp } from '../../constants/responsive';
import { WeeklyNudge } from '../../lib/types';

function StatCard({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={22} color={iconColor} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function CategoryBar({
  category,
  count,
  maxCount,
}: {
  category: string;
  count: number;
  maxCount: number;
}) {
  const width = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <View style={styles.categoryRow}>
      <Text style={styles.categoryName}>{category}</Text>
      <View style={styles.categoryBarBg}>
        <View style={[styles.categoryBarFill, { width: `${width}%` }]} />
      </View>
      <Text style={styles.categoryCount}>{count}</Text>
    </View>
  );
}

export default function StatsScreen() {
  const { ideas, activeIdeas } = useIdeas();
  const { streak } = useStreak();
  const [nudge, setNudge] = useState<WeeklyNudge | null>(null);
  const router = useRouter();

  const totalIdeas = ideas.length;
  const analyzedCount = ideas.filter((i) => i.ai_score !== null).length;
  const planningCount = ideas.filter(
    (i) => i.status === 'In Planning' || i.status === 'Launched'
  ).length;
  const launchedCount = ideas.filter((i) => i.status === 'Launched').length;

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    ideas.forEach((idea) => {
      const cat = idea.category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));
  }, [ideas]);

  const maxCategoryCount = categoryBreakdown.length > 0 ? categoryBreakdown[0].count : 0;

  // Load weekly nudge once ideas are available
  useEffect(() => {
    if (activeIdeas.length === 0) return;

    // Demo mode: use mock nudge
    if (isDemoMode()) {
      setNudge(MOCK_WEEKLY_NUDGE);
      return;
    }

    if (!isClaudeConfigured) return;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const oldUnactioned = activeIdeas.filter(
      (i) =>
        (i.status === 'Raw' || i.status === 'Analyzed') &&
        new Date(i.created_at) < sevenDaysAgo
    );

    if (oldUnactioned.length === 0) return;

    let cancelled = false;
    getWeeklyNudge(
      oldUnactioned.map((i) => ({ id: i.id, title: i.title, description: i.description }))
    ).then((result) => {
      if (!cancelled) setNudge(result);
    }).catch(() => {
      // Non-critical — silently ignore
    });

    return () => { cancelled = true; };
  }, [activeIdeas]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stats</Text>
        <Text style={styles.headerSubtitle}>Your IdeaVault analytics</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak card */}
        <View style={styles.streakCard}>
          <View style={styles.streakTop}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View>
              <Text style={styles.streakNumber}>{streak.current_streak}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakBottom}>
            <View style={styles.streakStat}>
              <Text style={styles.streakStatValue}>{streak.longest_streak}</Text>
              <Text style={styles.streakStatLabel}>Best Streak</Text>
            </View>
            <View style={styles.streakStat}>
              <Text style={styles.streakStatValue}>
                {streak.last_logged
                  ? new Date(streak.last_logged).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : '—'}
              </Text>
              <Text style={styles.streakStatLabel}>Last Active</Text>
            </View>
          </View>
        </View>

        {/* Stat cards grid */}
        <View style={styles.statGrid}>
          <StatCard icon="bulb" iconColor={Colors.gold} label="Total Ideas" value={totalIdeas} />
          <StatCard icon="sparkles" iconColor={Colors.accent} label="Analyzed" value={analyzedCount} />
          <StatCard icon="map" iconColor={Colors.amber} label="In Planning" value={planningCount} />
          <StatCard icon="rocket" iconColor={Colors.success} label="Launched" value={launchedCount} />
        </View>

        {/* Idea of the Week */}
        {nudge && (
          <View style={styles.nudgeCard}>
            <View style={styles.nudgeHeader}>
              <Ionicons name="trophy" size={18} color={Colors.amber} />
              <Text style={styles.nudgeTitle}>Idea of the Week</Text>
            </View>
            <Text style={styles.nudgeMessage}>{nudge.nudge_message}</Text>
            <Pressable
              onPress={() => router.push(`/idea/${nudge.idea_id}` as any)}
              style={styles.nudgeButton}
            >
              <Text style={styles.nudgeButtonText}>View Idea</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.gold} />
            </Pressable>
          </View>
        )}

        {/* Category breakdown */}
        {categoryBreakdown.length > 0 && (
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            {categoryBreakdown.map(({ category, count }) => (
              <CategoryBar
                key={category}
                category={category}
                count={count}
                maxCount={maxCategoryCount}
              />
            ))}
          </View>
        )}
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
  headerSubtitle: {
    color: Colors.textDim,
    fontSize: 13,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  streakCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gold + '30',
    ...Shadows.cardGlow,
  },
  streakTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakEmoji: {
    fontSize: 40,
  },
  streakNumber: {
    color: Colors.gold,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  streakLabel: {
    color: Colors.textDim,
    fontSize: 13,
    fontWeight: '600',
  },
  streakDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  streakBottom: {
    flexDirection: 'row',
    gap: 24,
  },
  streakStat: {},
  streakStatValue: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  streakStatLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: isSmallScreen ? 12 : 16,
    borderWidth: 1,
    borderColor: Colors.border,
    width: isLargeScreen ? '23%' : '48%',
    flexGrow: 1,
    gap: 8,
    ...Shadows.card,
  },
  statValue: {
    color: Colors.text,
    fontSize: fp(28),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  nudgeCard: {
    backgroundColor: Colors.amber + '10',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.amber + '25',
  },
  nudgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  nudgeTitle: {
    color: Colors.amber,
    fontSize: 14,
    fontWeight: '700',
  },
  nudgeMessage: {
    color: Colors.textDim,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  nudgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  nudgeButtonText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '700',
  },
  categorySection: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  categoryName: {
    color: Colors.textDim,
    fontSize: 12,
    fontWeight: '600',
    width: 90,
  },
  categoryBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.navyLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 4,
  },
  categoryCount: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    width: 24,
    textAlign: 'right',
  },
});
