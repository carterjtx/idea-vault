import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIdeas } from '../../../hooks/useIdeas';
import { useAI } from '../../../hooks/useAI';
import { Colors } from '../../../constants/theme';
import PlanView from '../../../components/PlanView';

export default function PlanningScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { ideas, updateIdea } = useIdeas();
  const { plan, planning, error } = useAI();
  const [hasGenerated, setHasGenerated] = useState(false);

  const idea = ideas.find((i) => i.id === id);

  useEffect(() => {
    if (idea && !idea.ai_plan && !hasGenerated) {
      generatePlan();
    }
  }, [idea?.id]);

  const generatePlan = async () => {
    if (!idea) return;
    setHasGenerated(true);

    const result = await plan(idea.title, idea.description || '');
    if (result) {
      await updateIdea(idea.id, {
        ai_plan: result,
        status: 'In Planning',
      });
    }
  };

  if (!idea) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.textDim} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Planning: {idea.title}
        </Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {planning ? (
          <View style={styles.generatingContainer}>
            <ActivityIndicator size="large" color={Colors.gold} />
            <Text style={styles.generatingTitle}>Generating Plan...</Text>
            <Text style={styles.generatingSubtitle}>
              AI is building a detailed roadmap for your idea
            </Text>
          </View>
        ) : idea.ai_plan ? (
          <PlanView plan={idea.ai_plan} ideaTitle={idea.title} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color={Colors.danger} />
            <Text style={styles.errorTitle}>Failed to Generate Plan</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={generatePlan} style={styles.retryButton}>
              <Ionicons name="refresh" size={18} color={Colors.bg} />
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.center}>
            <Pressable onPress={generatePlan} style={styles.generateButton}>
              <Ionicons name="map" size={20} color={Colors.bg} />
              <Text style={styles.generateText}>Generate Plan</Text>
            </Pressable>
          </View>
        )}

        {/* Mark as Launched */}
        {idea.ai_plan && idea.status !== 'Launched' && (
          <Pressable
            onPress={() => updateIdea(idea.id, { status: 'Launched' })}
            style={styles.launchButton}
          >
            <Ionicons name="rocket" size={18} color={Colors.bg} />
            <Text style={styles.launchText}>Mark as Launched</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  generatingContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  generatingTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  generatingSubtitle: {
    color: Colors.textDim,
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  errorTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    color: Colors.textDim,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  retryText: {
    color: Colors.bg,
    fontSize: 14,
    fontWeight: '700',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  generateText: {
    color: Colors.bg,
    fontSize: 16,
    fontWeight: '700',
  },
  launchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.success,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  launchText: {
    color: Colors.bg,
    fontSize: 15,
    fontWeight: '700',
  },
});
