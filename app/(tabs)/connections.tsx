import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useIdeas } from '../../hooks/useIdeas';
import { useAI } from '../../hooks/useAI';
import { Colors, Shadows } from '../../constants/theme';
import { IdeaLink } from '../../lib/types';

export default function ConnectionsScreen() {
  const { activeIdeas, updateIdea } = useIdeas();
  const { linkIdeas, linking } = useAI();
  const [links, setLinks] = useState<IdeaLink[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  // Build link data from existing linked_idea_ids
  const existingLinks = useMemo(() => {
    const linkSet: { from: string; to: string; fromTitle: string; toTitle: string }[] = [];
    const seen = new Set<string>();

    activeIdeas.forEach((idea) => {
      if (idea.linked_idea_ids) {
        idea.linked_idea_ids.forEach((linkedId) => {
          const key = [idea.id, linkedId].sort().join('-');
          if (!seen.has(key)) {
            seen.add(key);
            const linked = activeIdeas.find((i) => i.id === linkedId);
            if (linked) {
              linkSet.push({
                from: idea.id,
                to: linkedId,
                fromTitle: idea.title,
                toTitle: linked.title,
              });
            }
          }
        });
      }
    });

    return linkSet;
  }, [activeIdeas]);

  const handleFindConnections = async () => {
    const ideaSummaries = activeIdeas.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
    }));

    const result = await linkIdeas(ideaSummaries);
    setLinks(result);
    setHasSearched(true);

    // Update ideas with new links
    for (const link of result) {
      const ideaA = activeIdeas.find((i) => i.id === link.idea_a_id);
      const ideaB = activeIdeas.find((i) => i.id === link.idea_b_id);

      if (ideaA && !ideaA.linked_idea_ids.includes(link.idea_b_id)) {
        await updateIdea(link.idea_a_id, {
          linked_idea_ids: [...ideaA.linked_idea_ids, link.idea_b_id],
        });
      }
      if (ideaB && !ideaB.linked_idea_ids.includes(link.idea_a_id)) {
        await updateIdea(link.idea_b_id, {
          linked_idea_ids: [...ideaB.linked_idea_ids, link.idea_a_id],
        });
      }
    }
  };

  const allDisplayLinks = [
    ...existingLinks.map((l) => ({
      ...l,
      reason: 'Previously linked',
      isExisting: true,
    })),
    ...links
      .filter(
        (l) =>
          !existingLinks.some(
            (e) =>
              (e.from === l.idea_a_id && e.to === l.idea_b_id) ||
              (e.from === l.idea_b_id && e.to === l.idea_a_id)
          )
      )
      .map((l) => ({
        from: l.idea_a_id,
        to: l.idea_b_id,
        fromTitle:
          activeIdeas.find((i) => i.id === l.idea_a_id)?.title || 'Unknown',
        toTitle:
          activeIdeas.find((i) => i.id === l.idea_b_id)?.title || 'Unknown',
        reason: l.reason,
        isExisting: false,
      })),
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connections</Text>
        <Text style={styles.headerSubtitle}>
          {allDisplayLinks.length} link{allDisplayLinks.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* AI Suggest Button */}
      {activeIdeas.length >= 2 && (
        <Pressable
          onPress={handleFindConnections}
          style={[styles.aiButton, linking && styles.aiButtonDisabled]}
          disabled={linking}
        >
          {linking ? (
            <>
              <ActivityIndicator color={Colors.bg} size="small" />
              <Text style={styles.aiButtonText}>Finding connections...</Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles" size={18} color={Colors.bg} />
              <Text style={styles.aiButtonText}>AI Suggest Links</Text>
            </>
          )}
        </Pressable>
      )}

      {/* Links list */}
      {allDisplayLinks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="git-network-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No connections yet</Text>
          <Text style={styles.emptySubtitle}>
            {activeIdeas.length < 2
              ? 'Add at least 2 ideas to find connections'
              : 'Tap "AI Suggest Links" to discover connections between your ideas'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={allDisplayLinks}
          keyExtractor={(item, index) => `${item.from}-${item.to}-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.linkCard}>
              <View style={styles.linkIdeas}>
                <Pressable
                  onPress={() => router.push(`/idea/${item.from}`)}
                  style={styles.linkIdeaChip}
                >
                  <Text style={styles.linkIdeaText} numberOfLines={1}>
                    {item.fromTitle}
                  </Text>
                </Pressable>

                <View style={styles.linkConnector}>
                  <View style={styles.linkLine} />
                  <Ionicons name="link" size={16} color={Colors.accent} />
                  <View style={styles.linkLine} />
                </View>

                <Pressable
                  onPress={() => router.push(`/idea/${item.to}`)}
                  style={styles.linkIdeaChip}
                >
                  <Text style={styles.linkIdeaText} numberOfLines={1}>
                    {item.toTitle}
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.linkReason}>{item.reason}</Text>

              {!item.isExisting && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
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
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  aiButtonDisabled: {
    opacity: 0.7,
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
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
    maxWidth: 260,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  linkCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  linkIdeas: {
    gap: 8,
    marginBottom: 10,
  },
  linkIdeaChip: {
    backgroundColor: Colors.navyLight,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  linkIdeaText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  linkConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  linkLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.accent + '40',
  },
  linkReason: {
    color: Colors.textDim,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  newBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    color: Colors.success,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
