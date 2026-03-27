import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Idea, IdeaStatus, IdeaCategory, IdeaVersion } from '../lib/types';
import * as Crypto from 'expo-crypto';

const LOCAL_IDEAS_KEY = 'ideavault_ideas';

// Momentum decay: lose 0.5 points per day of inactivity
const MOMENTUM_DECAY_RATE = 0.5;

function calculateMomentumDecay(idea: Idea): number {
  const lastInteraction = new Date(idea.last_interaction).getTime();
  const now = Date.now();
  const daysSince = (now - lastInteraction) / (1000 * 60 * 60 * 24);
  const decay = Math.floor(daysSince) * MOMENTUM_DECAY_RATE;
  return Math.max(0, idea.momentum_score - decay);
}

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const loadLocalIdeas = useCallback(async (): Promise<Idea[]> => {
    try {
      const stored = await AsyncStorage.getItem(LOCAL_IDEAS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const saveLocalIdeas = useCallback(async (ideasToSave: Idea[]) => {
    await AsyncStorage.setItem(LOCAL_IDEAS_KEY, JSON.stringify(ideasToSave));
  }, []);

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    try {
      // Skip Supabase entirely if not configured — go straight to local
      if (!isSupabaseConfigured) {
        setIsGuest(true);
        const localIdeas = await loadLocalIdeas();
        const decayed = localIdeas.map(idea => ({
          ...idea,
          momentum_score: calculateMomentumDecay(idea),
        }));
        setIdeas(decayed);
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setIsGuest(true);
        const localIdeas = await loadLocalIdeas();
        // Apply momentum decay
        const decayed = localIdeas.map(idea => ({
          ...idea,
          momentum_score: calculateMomentumDecay(idea),
        }));
        setIdeas(decayed);
      } else {
        setIsGuest(false);
        const { data, error } = await supabase
          .from('ideas')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          // Fallback to local cache
          const localIdeas = await loadLocalIdeas();
          setIdeas(localIdeas);
        } else {
          const decayed = (data || []).map((idea: Idea) => ({
            ...idea,
            momentum_score: calculateMomentumDecay(idea),
            linked_idea_ids: idea.linked_idea_ids || [],
            versions: idea.versions || [],
          }));
          setIdeas(decayed);
          await saveLocalIdeas(decayed);
        }
      }
    } catch {
      const localIdeas = await loadLocalIdeas();
      setIdeas(localIdeas);
    } finally {
      setLoading(false);
    }
  }, [loadLocalIdeas, saveLocalIdeas]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const addIdea = useCallback(async (
    title: string,
    description: string | null,
    category: IdeaCategory | null,
    imageUrl: string | null = null,
    voiceNoteUrl: string | null = null
  ): Promise<Idea> => {
    const now = new Date().toISOString();
    const newIdea: Idea = {
      id: Crypto.randomUUID(),
      user_id: '',
      title,
      description,
      category,
      status: 'Raw',
      voice_note_url: voiceNoteUrl,
      image_url: imageUrl,
      ai_score: null,
      ai_plan: null,
      linked_idea_ids: [],
      momentum_score: 1,
      last_interaction: now,
      versions: [],
      created_at: now,
      updated_at: now,
    };

    if (!isGuest) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        newIdea.user_id = session.user.id;
        const { error } = await supabase.from('ideas').insert(newIdea);
        if (error) throw new Error(error.message);
      }
    }

    const updated = [newIdea, ...ideas];
    setIdeas(updated);
    await saveLocalIdeas(updated);
    return newIdea;
  }, [ideas, isGuest, saveLocalIdeas]);

  const updateIdea = useCallback(async (id: string, updates: Partial<Idea>) => {
    const existing = ideas.find(i => i.id === id);
    if (!existing) return;

    // Save version if title/description/category changed
    const versionFields = ['title', 'description', 'category'] as const;
    const hasVersionableChange = versionFields.some(
      field => updates[field] !== undefined && updates[field] !== existing[field]
    );

    let versions = existing.versions || [];
    if (hasVersionableChange) {
      const snapshot: IdeaVersion = {
        title: existing.title,
        description: existing.description,
        category: existing.category,
        timestamp: new Date().toISOString(),
      };
      versions = [...versions, snapshot];
    }

    // Boost momentum on interaction
    const momentumBoost = updates.ai_score ? 3 : updates.ai_plan ? 5 : 1;

    const updatedIdea: Idea = {
      ...existing,
      ...updates,
      versions,
      momentum_score: Math.min(10, existing.momentum_score + momentumBoost),
      last_interaction: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!isGuest) {
      const { error } = await supabase
        .from('ideas')
        .update(updatedIdea)
        .eq('id', id);
      if (error) throw new Error(error.message);
    }

    const updated = ideas.map(i => (i.id === id ? updatedIdea : i));
    setIdeas(updated);
    await saveLocalIdeas(updated);
  }, [ideas, isGuest, saveLocalIdeas]);

  const archiveIdea = useCallback(async (id: string) => {
    await updateIdea(id, { status: 'Archived' as IdeaStatus });
  }, [updateIdea]);

  const restoreIdea = useCallback(async (id: string) => {
    await updateIdea(id, { status: 'Raw' as IdeaStatus });
  }, [updateIdea]);

  const activeIdeas = ideas.filter(i => i.status !== 'Archived');
  const archivedIdeas = ideas.filter(i => i.status === 'Archived');

  return {
    ideas,
    activeIdeas,
    archivedIdeas,
    loading,
    isGuest,
    fetchIdeas,
    addIdea,
    updateIdea,
    archiveIdea,
    restoreIdea,
  };
}
