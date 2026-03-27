import { useState, useCallback } from 'react';
import { analyzeIdea, generatePlan, findIdeaLinks, autoTagIdea } from '../lib/claude';
import { AIScore, AIPlan, IdeaLink, CATEGORIES } from '../lib/types';
import { isDemoMode } from '../lib/demoMode';
import { MOCK_AI_SCORE, MOCK_AI_PLAN, DEMO_LINKS } from '../lib/demoData';

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
      if (isDemoMode()) {
        // Simulate AI delay for demo
        await new Promise(r => setTimeout(r, 1500));
        const score = {
          ...MOCK_AI_SCORE,
          // Add some variance based on title length for realism
          feasibility: Math.min(10, 5 + (title.length % 5)),
          overall_score: parseFloat((5.5 + (title.length % 4)).toFixed(1)),
          devil_advocate: devilAdvocate
            ? 'Playing devil\'s advocate: This idea faces significant headwinds. The target market may not be willing to pay, and the technical barriers are higher than they appear. Consider whether a simpler, non-tech solution already exists.'
            : undefined,
        };
        return score;
      }
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
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 2000));
        return MOCK_AI_PLAN;
      }
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
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 1200));
        // Return demo links that match current ideas
        const ideaIds = new Set(ideas.map(i => i.id));
        return DEMO_LINKS.filter(l => ideaIds.has(l.idea_a_id) && ideaIds.has(l.idea_b_id));
      }
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
      if (isDemoMode()) {
        await new Promise(r => setTimeout(r, 300));
        // Simple keyword-based tag suggestion for demo
        const text = `${title} ${description}`.toLowerCase();
        if (text.includes('app') || text.includes('mobile')) return 'App';
        if (text.includes('business') || text.includes('revenue')) return 'Business';
        if (text.includes('design') || text.includes('art')) return 'Creative';
        if (text.includes('ai') || text.includes('tech') || text.includes('code')) return 'Tech';
        if (text.includes('content') || text.includes('blog') || text.includes('video')) return 'Content';
        if (text.includes('product') || text.includes('saas')) return 'Product';
        return CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      }
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
