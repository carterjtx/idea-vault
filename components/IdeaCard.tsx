import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Idea } from '../lib/types';
import { Colors, Shadows } from '../constants/theme';
import StatusBadge from './StatusBadge';
import MomentumMeter from './MomentumMeter';

interface IdeaCardProps {
  idea: Idea;
}

export default function IdeaCard({ idea }: IdeaCardProps) {
  const router = useRouter();

  const overallScore = idea.ai_score?.overall_score;

  return (
    <Pressable
      onPress={() => router.push(`/idea/${idea.id}`)}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Top row: category + status */}
      <View style={styles.topRow}>
        <View style={styles.categoryRow}>
          {idea.category && (
            <View style={styles.categoryTag}>
              <Ionicons name="pricetag" size={10} color={Colors.goldDim} />
              <Text style={styles.categoryText}>{idea.category}</Text>
            </View>
          )}
          <MomentumMeter score={idea.momentum_score} />
        </View>
        <StatusBadge status={idea.status} />
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {idea.title}
      </Text>

      {/* Description preview */}
      {idea.description && (
        <Text style={styles.description} numberOfLines={2}>
          {idea.description}
        </Text>
      )}

      {/* Bottom row: date + score */}
      <View style={styles.bottomRow}>
        <Text style={styles.date}>
          {new Date(idea.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>

        {overallScore != null && (
          <View style={styles.scoreContainer}>
            <Ionicons name="sparkles" size={12} color={Colors.gold} />
            <Text style={styles.scoreText}>{overallScore.toFixed(1)}</Text>
          </View>
        )}
      </View>

      {/* Subtle glow line at bottom */}
      <View style={styles.glowLine} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
    overflow: 'hidden',
  },
  cardPressed: {
    backgroundColor: Colors.cardHover,
    transform: [{ scale: 0.98 }],
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    color: Colors.goldDim,
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  description: {
    color: Colors.textDim,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.gold + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  scoreText: {
    color: Colors.gold,
    fontSize: 13,
    fontWeight: '800',
  },
  glowLine: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: Colors.gold + '10',
  },
});
