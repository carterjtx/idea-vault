import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIdeas } from '../../../hooks/useIdeas';
import { useAI } from '../../../hooks/useAI';
import { Colors, Shadows } from '../../../constants/theme';
import { Idea, IdeaVersion } from '../../../lib/types';
import ScoreCard from '../../../components/ScoreCard';
import StatusBadge from '../../../components/StatusBadge';
import MomentumMeter from '../../../components/MomentumMeter';

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { ideas, updateIdea, archiveIdea } = useIdeas();
  const { analyze, analyzing, error, clearError } = useAI();
  const [devilMode, setDevilMode] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const hasBoosted = useRef(false);

  const idea = ideas.find((i) => i.id === id);

  useEffect(() => {
    // Boost momentum on view (once per screen visit)
    if (idea && !hasBoosted.current) {
      hasBoosted.current = true;
      updateIdea(idea.id, {});
    }
  }, [idea, updateIdea]);

  // Pulse animation for analyze button
  useEffect(() => {
    if (!idea?.ai_score) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
    return () => pulseAnim.stopAnimation();
  }, [idea?.ai_score, pulseAnim]);

  if (!idea) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>Loading idea...</Text>
      </View>
    );
  }

  const handleAnalyze = async () => {
    clearError();
    const result = await analyze(
      idea.title,
      idea.description || '',
      devilMode
    );

    if (result) {
      await updateIdea(idea.id, {
        ai_score: result,
        status: 'Analyzed',
      });
    }
  };

  const handleArchive = () => {
    Alert.alert(
      'Archive Idea',
      'This idea will be moved to the Graveyard. You can restore it anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            await archiveIdea(idea.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleTakeToPlan = () => {
    router.push(`/idea/${idea.id}/planning`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.textDim} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable onPress={handleArchive} style={styles.archiveButton}>
            <Ionicons name="archive" size={18} color={Colors.textMuted} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status + Category + Momentum */}
        <View style={styles.metaRow}>
          <StatusBadge status={idea.status} />
          {idea.category && (
            <View style={styles.categoryTag}>
              <Ionicons name="pricetag" size={11} color={Colors.goldDim} />
              <Text style={styles.categoryText}>{idea.category}</Text>
            </View>
          )}
          <MomentumMeter score={idea.momentum_score} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{idea.title}</Text>

        {/* Description */}
        {idea.description && (
          <Text style={styles.description}>{idea.description}</Text>
        )}

        {/* Image */}
        {idea.image_url && (
          <Image
            source={{ uri: idea.image_url }}
            style={styles.ideaImage}
            resizeMode="cover"
          />
        )}

        {/* Date */}
        <Text style={styles.date}>
          Created {new Date(idea.created_at).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>

        {/* Version History */}
        {idea.versions && idea.versions.length > 0 && (
          <View style={styles.versionSection}>
            <Pressable
              onPress={() => setShowVersions(!showVersions)}
              style={styles.versionToggle}
            >
              <Ionicons name="git-commit" size={16} color={Colors.textMuted} />
              <Text style={styles.versionToggleText}>
                View History ({idea.versions.length} version{idea.versions.length !== 1 ? 's' : ''})
              </Text>
              <Ionicons
                name={showVersions ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={Colors.textMuted}
              />
            </Pressable>
            {showVersions && (
              <View style={styles.versionList}>
                {idea.versions.map((version: IdeaVersion, index: number) => (
                  <View key={index} style={styles.versionItem}>
                    <View style={styles.versionDot} />
                    <View style={styles.versionContent}>
                      <Text style={styles.versionTitle}>{version.title}</Text>
                      {version.description && (
                        <Text style={styles.versionDesc} numberOfLines={2}>
                          {version.description}
                        </Text>
                      )}
                      <Text style={styles.versionDate}>
                        {new Date(version.timestamp).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* AI Analysis section */}
        {idea.ai_score ? (
          <View style={styles.scoreSection}>
            <ScoreCard score={idea.ai_score} />
          </View>
        ) : (
          <View style={styles.analyzeSection}>
            {/* Devil's Advocate toggle */}
            <View style={styles.devilRow}>
              <View style={styles.devilLabel}>
                <Ionicons name="skull" size={16} color={Colors.danger} />
                <Text style={styles.devilText}>Devil's Advocate</Text>
              </View>
              <Switch
                value={devilMode}
                onValueChange={setDevilMode}
                trackColor={{ false: Colors.border, true: Colors.danger + '60' }}
                thumbColor={devilMode ? Colors.danger : Colors.textMuted}
              />
            </View>
            <Text style={styles.devilHint}>
              {devilMode
                ? 'AI will also argue against your idea'
                : 'Enable to have AI pressure-test your idea'}
            </Text>

            {/* Analyze button */}
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Pressable
                onPress={handleAnalyze}
                style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]}
                disabled={analyzing}
              >
                {analyzing ? (
                  <View style={styles.analyzingRow}>
                    <ActivityIndicator color={Colors.bg} size="small" />
                    <Text style={styles.analyzeText}>Analyzing...</Text>
                  </View>
                ) : (
                  <>
                    <Ionicons name="sparkles" size={20} color={Colors.bg} />
                    <Text style={styles.analyzeText}>Analyze with AI</Text>
                  </>
                )}
              </Pressable>
            </Animated.View>

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>
        )}

        {/* Take to Planning button */}
        {idea.ai_score && (
          <Pressable
            onPress={handleTakeToPlan}
            style={styles.planButton}
          >
            <Ionicons name="map" size={20} color={Colors.bg} />
            <Text style={styles.planButtonText}>
              {idea.ai_plan ? 'View Plan' : 'Take to Planning'}
            </Text>
          </Pressable>
        )}

        {/* Linked Ideas section */}
        {idea.linked_idea_ids && idea.linked_idea_ids.length > 0 && (
          <View style={styles.linksSection}>
            <Text style={styles.linksSectionTitle}>Linked Ideas</Text>
            {idea.linked_idea_ids.map((linkedId) => {
              const linked = ideas.find((i) => i.id === linkedId);
              if (!linked) return null;
              return (
                <Pressable
                  key={linkedId}
                  onPress={() => router.push(`/idea/${linkedId}`)}
                  style={styles.linkedCard}
                >
                  <Ionicons name="link" size={14} color={Colors.accent} />
                  <Text style={styles.linkedTitle}>{linked.title}</Text>
                  <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
                </Pressable>
              );
            })}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: Colors.textDim,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  archiveButton: {
    padding: 8,
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    color: Colors.goldDim,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 12,
    lineHeight: 34,
  },
  description: {
    color: Colors.textDim,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
  },
  ideaImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  date: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 24,
  },
  versionSection: {
    marginBottom: 24,
  },
  versionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  versionToggleText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  versionList: {
    marginTop: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: Colors.border,
  },
  versionItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  versionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
    marginTop: 6,
    marginLeft: -13,
  },
  versionContent: {
    flex: 1,
  },
  versionTitle: {
    color: Colors.textDim,
    fontSize: 13,
    fontWeight: '600',
  },
  versionDesc: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  versionDate: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  scoreSection: {
    marginBottom: 20,
  },
  analyzeSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  devilRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  devilLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  devilText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  devilHint: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 16,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    paddingVertical: 16,
    borderRadius: 12,
    ...Shadows.fab,
  },
  analyzeButtonDisabled: {
    opacity: 0.8,
  },
  analyzingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analyzeText: {
    color: Colors.bg,
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  planButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linksSection: {
    marginBottom: 20,
  },
  linksSectionTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  linkedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  linkedTitle: {
    color: Colors.textDim,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
