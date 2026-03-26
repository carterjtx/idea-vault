import { useState, useCallback } from 'react';
import { analyzeIdea, generatePlan, findIdeaLinks, autoTagIdea } from '../lib/claude';
import { AIScore, AIPlan, IdeaLink } from '../lib/types';

export function useAI() {
  const [analyzing, setAnalyzing] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [linking, setLinking] = useState(false);
  const [tagging, setTagging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (
    title: string,
    description: string,
    devilAdvocate: boolean
  ): Promise<AIScore | null> => {
    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeIdea(title, description, devilAdvocate);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const plan = useCallback(async (
    title: string,
    description: string
  ): Promise<AIPlan | null> => {
    setPlanning(true);
    setError(null);
    try {
      const result = await generatePlan(title, description);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Planning failed';
      setError(message);
      return null;
    } finally {
      setPlanning(false);
    }
  }, []);

  const linkIdeas = useCallback(async (
    ideas: { id: string; title: string; description: string | null }[]
  ): Promise<IdeaLink[]> => {
    setLinking(true);
    setError(null);
    try {
      const result = await findIdeaLinks(ideas);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Linking failed';
      setError(message);
      return [];
    } finally {
      setLinking(false);
    }
  }, []);

  const suggestTag = useCallback(async (
    title: string,
    description: string
  ): Promise<string | null> => {
    setTagging(true);
    try {
      const result = await autoTagIdea(title, description);
      return result;
    } catch {
      return null;
    } finally {
      setTagging(false);
    }
  }, []);

  return {
    analyze,
    plan,
    linkIdeas,
    suggestTag,
    analyzing,
    planning,
    linking,
    tagging,
    error,
    clearError: () => setError(null),
  };
}
