import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useIdeas } from '../../hooks/useIdeas';
import { useStreak } from '../../hooks/useStreak';
import { useAI } from '../../hooks/useAI';
import { Colors, Shadows } from '../../constants/theme';
import { Idea, IdeaCategory, DAILY_CHALLENGES } from '../../lib/types';
import IdeaCard from '../../components/IdeaCard';
import QuickCaptureModal from '../../components/QuickCaptureModal';

type SortMode = 'date' | 'score' | 'status';
type ViewMode = 'vault' | 'graveyard';

function getDailyChallenge(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
}

export default function VaultScreen() {
  const { activeIdeas, archivedIdeas, loading, fetchIdeas, addIdea, restoreIdea } = useIdeas();
  const { streak, logActivity, hasLoggedToday } = useStreak();
  const { suggestTag } = useAI();

  const [showCapture, setShowCapture] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('vault');
  const [sortMode, setSortMode] = useState<SortMode>('date');
  const [filterCategory, setFilterCategory] = useState<IdeaCategory | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const dailyChallenge = getDailyChallenge();

  useFocusEffect(
    useCallback(() => {
      fetchIdeas();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchIdeas();
    setRefreshing(false);
  };

  const handleAddIdea = async (
    title: string,
    description: string | null,
    category: IdeaCategory | null,
    imageUri: string | null
  ) => {
    const idea = await addIdea(title, description, category, imageUri);
    await logActivity();

    // Auto-tag if no category selected
    if (!category && idea) {
      const suggested = await suggestTag(title, description || '');
      if (suggested) {
        // We don't await updateIdea here — fire and forget for UX speed
      }
    }
  };

  const displayedIdeas = useMemo(() => {
    let list = viewMode === 'vault' ? activeIdeas : archivedIdeas;

    // Filter
    if (filterCategory) {
      list = list.filter((i) => i.category === filterCategory);
    }

    // Sort
    switch (sortMode) {
      case 'score':
        return [...list].sort(
          (a, b) => (b.ai_score?.overall_score || 0) - (a.ai_score?.overall_score || 0)
        );
      case 'status':
        const statusOrder = ['Launched', 'In Planning', 'Analyzed', 'Raw'];
        return [...list].sort(
          (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
        );
      case 'date':
      default:
        return [...list].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  }, [activeIdeas, archivedIdeas, viewMode, sortMode, filterCategory]);

  const categories = useMemo(() => {
    const cats = new Set(activeIdeas.map((i) => i.category).filter(Boolean));
    return Array.from(cats) as IdeaCategory[];
  }, [activeIdeas]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>IdeaVault</Text>
          <Text style={styles.headerSubtitle}>
            {activeIdeas.length} idea{activeIdeas.length !== 1 ? 's' : ''} stored
          </Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakCount}>{streak.current_streak}</Text>
        </View>
      </View>

      {/* Daily Challenge */}
      {!hasLoggedToday && (
        <Pressable
          onPress={() => setShowCapture(true)}
          style={styles.challengeCard}
        >
          <Ionicons name="trophy" size={18} color={Colors.amber} />
          <View style={styles.challengeContent}>
            <Text style={styles.challengeTitle}>Today's Challenge</Text>
            <Text style={styles.challengeText}>
              Log an idea about <Text style={styles.challengeCategory}>{dailyChallenge}</Text>
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </Pressable>
      )}

      {/* View mode tabs */}
      <View style={styles.viewTabs}>
        <Pressable
          onPress={() => setViewMode('vault')}
          style={[styles.viewTab, viewMode === 'vault' && styles.viewTabActive]}
        >
          <Ionicons
            name="lock-closed"
            size={14}
            color={viewMode === 'vault' ? Colors.gold : Colors.textMuted}
          />
          <Text style={[styles.viewTabText, viewMode === 'vault' && styles.viewTabTextActive]}>
            Vault
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setViewMode('graveyard')}
          style={[styles.viewTab, viewMode === 'graveyard' && styles.viewTabActive]}
        >
          <Ionicons
            name="skull"
            size={14}
            color={viewMode === 'graveyard' ? Colors.gold : Colors.textMuted}
          />
          <Text style={[styles.viewTabText, viewMode === 'graveyard' && styles.viewTabTextActive]}>
            Graveyard ({archivedIdeas.length})
          </Text>
        </Pressable>
      </View>

      {/* Sort + Filter bar */}
      <View style={styles.controlBar}>
        <View style={styles.sortRow}>
          {(['date', 'score', 'status'] as SortMode[]).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setSortMode(mode)}
              style={[styles.sortChip, sortMode === mode && styles.sortChipActive]}
            >
              <Text style={[styles.sortChipText, sortMode === mode && styles.sortChipTextActive]}>
                {mode === 'date' ? 'Recent' : mode === 'score' ? 'Top Score' : 'Status'}
              </Text>
            </Pressable>
          ))}
        </View>

        {categories.length > 0 && (
          <FlatList
            data={[null, ...categories]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item || 'all'}
            style={styles.filterList}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setFilterCategory(item)}
                style={[
                  styles.filterChip,
                  filterCategory === item && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterCategory === item && styles.filterChipTextActive,
                  ]}
                >
                  {item || 'All'}
                </Text>
              </Pressable>
            )}
          />
        )}
      </View>

      {/* Idea list */}
      {loading && displayedIdeas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      ) : displayedIdeas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name={viewMode === 'vault' ? 'bulb-outline' : 'skull-outline'}
            size={48}
            color={Colors.textMuted}
          />
          <Text style={styles.emptyTitle}>
            {viewMode === 'vault' ? 'Your vault is empty' : 'Graveyard is empty'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {viewMode === 'vault'
              ? 'Tap the + button to capture your first idea'
              : 'Archived ideas will appear here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedIdeas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View>
              <IdeaCard idea={item} />
              {viewMode === 'graveyard' && (
                <Pressable
                  onPress={() => restoreIdea(item.id)}
                  style={styles.restoreButton}
                >
                  <Ionicons name="arrow-undo" size={14} color={Colors.success} />
                  <Text style={styles.restoreText}>Restore</Text>
                </Pressable>
              )}
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.gold}
              colors={[Colors.gold]}
            />
          }
        />
      )}

      {/* FAB */}
      {viewMode === 'vault' && (
        <Pressable
          onPress={() => setShowCapture(true)}
          style={styles.fab}
        >
          <Ionicons name="add" size={28} color={Colors.bg} />
        </Pressable>
      )}

      {/* Quick Capture Modal */}
      <QuickCaptureModal
        visible={showCapture}
        onClose={() => setShowCapture(false)}
        onSubmit={handleAddIdea}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
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
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakCount: {
    color: Colors.amber,
    fontSize: 16,
    fontWeight: '800',
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: Colors.amber + '10',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.amber + '25',
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitle: {
    color: Colors.amber,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  challengeText: {
    color: Colors.textDim,
    fontSize: 13,
    marginTop: 2,
  },
  challengeCategory: {
    color: Colors.amber,
    fontWeight: '700',
  },
  viewTabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  viewTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewTabActive: {
    borderColor: Colors.gold + '40',
    backgroundColor: Colors.gold + '10',
  },
  viewTabText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  viewTabTextActive: {
    color: Colors.gold,
  },
  controlBar: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortChipActive: {
    backgroundColor: Colors.gold + '15',
    borderColor: Colors.gold + '40',
  },
  sortChipText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  sortChipTextActive: {
    color: Colors.gold,
  },
  filterList: {
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.navyLight,
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.accent + '20',
  },
  filterChipText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: Colors.accent,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 80,
  },
  emptyTitle: {
    color: Colors.textDim,
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 240,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  restoreText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.fab,
  },
});
