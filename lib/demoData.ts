import { Idea, AIScore, AIPlan, Streak, IdeaLink, WeeklyNudge } from './types';

const now = new Date();
const daysAgo = (days: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const DEMO_IDEAS: Idea[] = [
  {
    id: 'demo-1',
    user_id: 'demo',
    title: 'AI-Powered Recipe Generator',
    description: 'An app that generates personalized recipes based on ingredients you have at home, dietary restrictions, and cuisine preferences. Uses computer vision to scan your fridge and pantry.',
    category: 'App',
    status: 'Analyzed',
    voice_note_url: null,
    image_url: null,
    ai_score: {
      feasibility: 7,
      market_demand: 8,
      uniqueness: 6,
      time_to_build: 5,
      revenue_potential: 7,
      overall_score: 7.2,
      strengths: 'Strong market demand with health-conscious consumers. Computer vision for ingredient scanning is a compelling differentiator. Subscription model has proven traction in the food space.',
      weaknesses: 'Computer vision accuracy for food items is still challenging. Recipe databases require licensing or significant curation effort. High competition from established players like Yummly and Supercook.',
      devil_advocate: 'Most people already know what to cook with their ingredients — the real problem is motivation, not information. Existing apps solve this adequately.',
    },
    ai_plan: null,
    linked_idea_ids: ['demo-3'],
    momentum_score: 7,
    last_interaction: daysAgo(1),
    versions: [],
    created_at: daysAgo(14),
    updated_at: daysAgo(1),
  },
  {
    id: 'demo-2',
    user_id: 'demo',
    title: 'Neighborhood Tool Library',
    description: 'A hyper-local sharing platform where neighbors can lend and borrow tools, equipment, and specialty items. Think "library of things" but peer-to-peer with trust scores and insurance.',
    category: 'Business',
    status: 'In Planning',
    voice_note_url: null,
    image_url: null,
    ai_score: {
      feasibility: 8,
      market_demand: 7,
      uniqueness: 7,
      time_to_build: 6,
      revenue_potential: 6,
      overall_score: 7.0,
      strengths: 'Addresses genuine pain point — expensive tools sit unused 99% of the time. Strong community-building angle. Low-cost MVP possible with basic listings.',
      weaknesses: 'Trust and liability are major hurdles. Cold start problem — needs density in each neighborhood. Revenue model limited by local scope.',
    },
    ai_plan: {
      phases: [
        { name: 'MVP Launch', description: 'Build a simple listing app with messaging for one neighborhood. Focus on 50 early adopters.', time_estimate: '6 weeks' },
        { name: 'Trust Layer', description: 'Add identity verification, reviews, and optional deposit system.', time_estimate: '4 weeks' },
        { name: 'Expansion', description: 'Launch in 5 additional neighborhoods. Add insurance partnership and premium features.', time_estimate: '8 weeks' },
      ],
      tools_and_tech: ['React Native', 'Supabase', 'Stripe Connect', 'Google Maps API', 'Expo'],
      budget: [
        { category: 'Development', low: '$2,000', high: '$5,000' },
        { category: 'Marketing', low: '$500', high: '$2,000' },
        { category: 'Insurance Partnership', low: '$1,000', high: '$3,000' },
      ],
      first_3_actions: [
        'Survey 30 neighbors about tool-sharing willingness and concerns',
        'Build a landing page with waitlist to validate demand',
        'Create a basic listing prototype using Expo + Supabase',
      ],
      risk_flags: [
        { risk: 'Tool damage or theft liability', mitigation: 'Partner with a micro-insurance provider; require deposits for high-value items' },
        { risk: 'Low adoption in initial neighborhood', mitigation: 'Seed the platform with your own tools; partner with local hardware stores' },
      ],
    },
    linked_idea_ids: [],
    momentum_score: 9,
    last_interaction: daysAgo(0),
    versions: [
      {
        title: 'Tool Sharing App',
        description: 'An app for sharing tools with neighbors',
        category: 'App',
        timestamp: daysAgo(10),
      },
    ],
    created_at: daysAgo(21),
    updated_at: daysAgo(0),
  },
  {
    id: 'demo-3',
    user_id: 'demo',
    title: 'Meal Prep Subscription Box',
    description: 'Pre-portioned ingredient kits with AI-curated recipes matched to seasonal produce and user taste profiles. Each box teaches a cooking technique.',
    category: 'Product',
    status: 'Raw',
    voice_note_url: null,
    image_url: null,
    ai_score: null,
    ai_plan: null,
    linked_idea_ids: ['demo-1'],
    momentum_score: 3,
    last_interaction: daysAgo(5),
    versions: [],
    created_at: daysAgo(7),
    updated_at: daysAgo(5),
  },
  {
    id: 'demo-4',
    user_id: 'demo',
    title: 'Focus Timer with Biometric Feedback',
    description: 'A productivity app that uses Apple Watch/wearable heart rate data to detect when you\'re in deep focus vs. distracted, and adapts Pomodoro intervals accordingly.',
    category: 'Tech',
    status: 'Analyzed',
    voice_note_url: null,
    image_url: null,
    ai_score: {
      feasibility: 6,
      market_demand: 7,
      uniqueness: 8,
      time_to_build: 4,
      revenue_potential: 6,
      overall_score: 6.5,
      strengths: 'Highly unique approach to productivity. Biometric-adaptive timing is genuinely novel. Strong App Store potential with health integration.',
      weaknesses: 'Requires wearable device — limits addressable market. HRV-based focus detection needs calibration per user. Apple HealthKit integration has strict review guidelines.',
    },
    ai_plan: null,
    linked_idea_ids: ['demo-5'],
    momentum_score: 5,
    last_interaction: daysAgo(3),
    versions: [],
    created_at: daysAgo(12),
    updated_at: daysAgo(3),
  },
  {
    id: 'demo-5',
    user_id: 'demo',
    title: 'Digital Detox Challenge App',
    description: 'A 30-day challenge app that gamifies reducing screen time. Users earn XP, unlock achievements, and compete with friends. Partners with wellness brands for real rewards.',
    category: 'App',
    status: 'Launched',
    voice_note_url: null,
    image_url: null,
    ai_score: {
      feasibility: 9,
      market_demand: 8,
      uniqueness: 5,
      time_to_build: 7,
      revenue_potential: 7,
      overall_score: 7.8,
      strengths: 'Taps into growing digital wellness trend. Gamification drives retention. Brand partnerships create win-win revenue.',
      weaknesses: 'Irony of an app to reduce app usage. Screen Time APIs have limitations. Competitive space with established players.',
    },
    ai_plan: {
      phases: [
        { name: 'Core App', description: 'Build challenge framework, daily tasks, and progress tracking.', time_estimate: '4 weeks' },
        { name: 'Social Layer', description: 'Add friend challenges, leaderboards, and sharing.', time_estimate: '3 weeks' },
        { name: 'Brand Partnerships', description: 'Onboard 5 wellness brands for reward redemptions.', time_estimate: '6 weeks' },
      ],
      tools_and_tech: ['React Native', 'Firebase', 'Screen Time API', 'RevenueCat'],
      budget: [
        { category: 'Development', low: '$1,500', high: '$4,000' },
        { category: 'Design', low: '$800', high: '$2,000' },
        { category: 'Marketing Launch', low: '$1,000', high: '$5,000' },
      ],
      first_3_actions: [
        'Design the 30-day challenge curriculum with escalating difficulty',
        'Build MVP with local screen time tracking and daily check-ins',
        'Recruit 20 beta testers for a pilot challenge round',
      ],
      risk_flags: [
        { risk: 'Users abandon after initial motivation fades', mitigation: 'Push notifications with streak reminders; social accountability features' },
      ],
    },
    linked_idea_ids: ['demo-4'],
    momentum_score: 10,
    last_interaction: daysAgo(0),
    versions: [],
    created_at: daysAgo(30),
    updated_at: daysAgo(0),
  },
  {
    id: 'demo-6',
    user_id: 'demo',
    title: 'Podcast Highlight Clipper',
    description: 'Automatically transcribes podcasts and uses AI to extract the most interesting 60-second clips for social media sharing. Creators can review and publish clips directly.',
    category: 'Content',
    status: 'Raw',
    voice_note_url: null,
    image_url: null,
    ai_score: null,
    ai_plan: null,
    linked_idea_ids: [],
    momentum_score: 2,
    last_interaction: daysAgo(8),
    versions: [],
    created_at: daysAgo(4),
    updated_at: daysAgo(4),
  },
  {
    id: 'demo-7',
    user_id: 'demo',
    title: 'Local Event Discovery for Introverts',
    description: 'An events app that filters for small-group, low-key activities — book clubs, nature walks, craft workshops. Anti-FOMO design that emphasizes quality over quantity.',
    category: 'Creative',
    status: 'Raw',
    voice_note_url: null,
    image_url: null,
    ai_score: null,
    ai_plan: null,
    linked_idea_ids: [],
    momentum_score: 1,
    last_interaction: daysAgo(10),
    versions: [],
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
  },
];

export const DEMO_STREAK: Streak = {
  user_id: 'demo',
  current_streak: 5,
  last_logged: new Date().toISOString().split('T')[0],
  longest_streak: 12,
};

export const DEMO_LINKS: IdeaLink[] = [
  {
    idea_a_id: 'demo-1',
    idea_b_id: 'demo-3',
    reason: 'Both ideas involve AI-powered food/recipe personalization — could combine into a unified food tech platform.',
  },
  {
    idea_a_id: 'demo-4',
    idea_b_id: 'demo-5',
    reason: 'Both target digital wellness and productivity — the biometric focus timer could be a premium feature inside the detox challenge app.',
  },
];

// Mock AI responses for demo mode
export const MOCK_AI_SCORE: AIScore = {
  feasibility: 7,
  market_demand: 8,
  uniqueness: 6,
  time_to_build: 5,
  revenue_potential: 7,
  overall_score: 7.0,
  strengths: 'This idea addresses a real market need with growing demand. The core concept is technically achievable with current tools and frameworks.',
  weaknesses: 'Competition exists in adjacent spaces. Monetization strategy needs further validation. Initial user acquisition could be challenging without a strong distribution channel.',
  devil_advocate: 'While the concept is appealing, the market may be more saturated than it appears. Consider whether users would pay for this when free alternatives exist.',
};

export const MOCK_AI_PLAN: AIPlan = {
  phases: [
    { name: 'Research & Validate', description: 'Conduct user interviews, competitive analysis, and validate core assumptions with a landing page test.', time_estimate: '2 weeks' },
    { name: 'MVP Build', description: 'Build the minimum viable product focusing on the single most important feature.', time_estimate: '6 weeks' },
    { name: 'Beta Launch', description: 'Launch to a small group of early adopters, gather feedback, and iterate.', time_estimate: '4 weeks' },
    { name: 'Public Launch', description: 'Polish the product, add key features from beta feedback, and launch publicly.', time_estimate: '4 weeks' },
  ],
  tools_and_tech: ['React Native', 'Expo', 'Supabase', 'Claude API', 'Stripe', 'Vercel'],
  budget: [
    { category: 'Development Tools', low: '$0', high: '$100/mo' },
    { category: 'Cloud Infrastructure', low: '$25/mo', high: '$200/mo' },
    { category: 'Marketing', low: '$500', high: '$3,000' },
  ],
  first_3_actions: [
    'Interview 10 potential users about their biggest pain points in this space',
    'Set up the tech stack and build a "hello world" prototype',
    'Create a landing page with email capture to gauge interest',
  ],
  risk_flags: [
    { risk: 'Low initial traction', mitigation: 'Focus on a niche audience first; build community before product' },
    { risk: 'Technical complexity underestimated', mitigation: 'Start with the simplest possible version; defer complex features to v2' },
  ],
};

export const MOCK_WEEKLY_NUDGE: WeeklyNudge = {
  idea_id: 'demo-3',
  nudge_message: 'Your "Meal Prep Subscription Box" idea has been sitting for a week — it has great synergy with your Recipe Generator concept. Consider analyzing it today!',
};
