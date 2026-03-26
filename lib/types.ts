export type IdeaStatus = 'Raw' | 'Analyzed' | 'In Planning' | 'Launched' | 'Archived';

export type IdeaCategory =
  | 'App'
  | 'Business'
  | 'Creative'
  | 'Personal'
  | 'Tech'
  | 'Content'
  | 'Product'
  | 'Research'
  | 'Other';

export interface AIScore {
  feasibility: number;
  market_demand: number;
  uniqueness: number;
  time_to_build: number;
  revenue_potential: number;
  overall_score: number;
  strengths: string;
  weaknesses: string;
  devil_advocate?: string;
}

export interface PlanPhase {
  name: string;
  description: string;
  time_estimate: string;
}

export interface BudgetItem {
  category: string;
  low: string;
  high: string;
}

export interface RiskFlag {
  risk: string;
  mitigation: string;
}

export interface AIPlan {
  phases: PlanPhase[];
  tools_and_tech: string[];
  budget: BudgetItem[];
  first_3_actions: string[];
  risk_flags: RiskFlag[];
}

export interface IdeaVersion {
  title: string;
  description: string | null;
  category: string | null;
  timestamp: string;
}

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: IdeaCategory | null;
  status: IdeaStatus;
  voice_note_url: string | null;
  image_url: string | null;
  ai_score: AIScore | null;
  ai_plan: AIPlan | null;
  linked_idea_ids: string[];
  momentum_score: number;
  last_interaction: string;
  versions: IdeaVersion[];
  created_at: string;
  updated_at: string;
}

export interface Streak {
  user_id: string;
  current_streak: number;
  last_logged: string | null;
  longest_streak: number;
}

export interface IdeaLink {
  idea_a_id: string;
  idea_b_id: string;
  reason: string;
}

export interface WeeklyNudge {
  idea_id: string;
  nudge_message: string;
}

export const CATEGORIES: IdeaCategory[] = [
  'App',
  'Business',
  'Creative',
  'Personal',
  'Tech',
  'Content',
  'Product',
  'Research',
  'Other',
];

export const DAILY_CHALLENGES = [
  'App',
  'Business',
  'Creative',
  'Personal',
  'Tech',
  'Content',
  'Product',
  'Research',
];
