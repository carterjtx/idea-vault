# IdeaVault

AI-powered idea capture and planning app built with React Native, Expo, Supabase, and Claude AI.

## Features

- **Quick Capture** — Log ideas with title, description, category, voice notes, and photos
- **AI Analysis** — Get scored across 5 dimensions: feasibility, market demand, uniqueness, time to build, and revenue potential
- **Devil's Advocate** — Toggle harsh mode to have AI pressure-test your idea
- **AI Planning** — Generate detailed roadmaps with phases, budget, tech stack, and risk flags
- **Idea Connections** — AI discovers links between your ideas
- **Streak Tracking** — Daily streaks with reminders to keep you logging ideas
- **Stats Dashboard** — Analytics, category breakdown, and "Idea of the Week" nudges
- **Graveyard** — Archive and restore ideas
- **Demo Mode** — Try everything with sample data, no setup required

## Quick Start

### 1. Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator, or Expo Go on your phone

### 2. Install Dependencies

```bash
cd idea-vault
npm install
```

### 3. Try Demo Mode (No Setup Required)

```bash
npx expo start
```

Open the app, and on the login screen tap **"Try Demo Mode"**. This loads sample ideas with mock AI responses so you can explore every feature immediately.

### 4. Environment Variables (Optional)

Create a `.env` file in the project root for full functionality:

```env
# Supabase (for cloud sync and auth)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Claude AI (for real AI analysis)
EXPO_PUBLIC_CLAUDE_API_KEY=your-claude-api-key
```

**Without these keys**, the app works in guest/demo mode with local storage and mock AI.

### 5. Supabase Setup (Optional)

If you want cloud sync and authentication:

1. Create a project at [supabase.com](https://supabase.com)
2. Run the following SQL in the Supabase SQL Editor:

```sql
-- Ideas table
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'Raw',
  voice_note_url TEXT,
  image_url TEXT,
  ai_score JSONB,
  ai_plan JSONB,
  linked_idea_ids UUID[] DEFAULT '{}',
  momentum_score FLOAT DEFAULT 1,
  last_interaction TIMESTAMPTZ DEFAULT now(),
  versions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own ideas"
  ON ideas FOR ALL
  USING (auth.uid() = user_id);

-- Streaks table
CREATE TABLE streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  last_logged DATE,
  longest_streak INT DEFAULT 0
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own streak"
  ON streaks FOR ALL
  USING (auth.uid() = user_id);
```

3. Copy your project URL and anon key to `.env`

### 6. Claude API Setup (Optional)

For real AI analysis instead of mock responses:

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. Add it to your `.env` as `EXPO_PUBLIC_CLAUDE_API_KEY`

## Running the App

```bash
# Start Expo dev server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run on your phone with Expo Go
# Scan the QR code shown in the terminal
```

## Project Structure

```
idea-vault/
├── app/                    # Expo Router screens
│   ├── (auth)/             # Login & signup screens
│   ├── (tabs)/             # Main tab screens (vault, connections, stats, settings)
│   ├── idea/[id]/          # Idea detail & planning screens
│   └── onboarding/         # Onboarding flow
├── components/             # Reusable UI components
│   ├── IdeaCard.tsx        # Idea list card
│   ├── ScoreCard.tsx       # AI score visualization
│   ├── PlanView.tsx        # AI plan display
│   ├── QuickCaptureModal.tsx # New idea modal
│   └── VoiceInput.tsx      # Voice recording button
├── hooks/                  # Custom React hooks
│   ├── useIdeas.ts         # Ideas CRUD + local/cloud sync
│   ├── useAI.ts            # AI analysis/planning wrapper
│   └── useStreak.ts        # Streak tracking
├── lib/                    # Utilities & services
│   ├── claude.ts           # Claude API client
│   ├── supabase.ts         # Supabase client
│   ├── demoData.ts         # Sample data for demo mode
│   ├── demoMode.ts         # Demo mode state management
│   ├── notifications.ts    # Push notification scheduling
│   └── types.ts            # TypeScript types
└── constants/              # Theme & config
    ├── theme.ts            # Colors & shadows
    └── responsive.ts       # Screen size utilities
```

## App Modes

| Mode | Auth | Data Storage | AI Features | Setup Required |
|------|------|-------------|-------------|----------------|
| **Demo** | None | In-memory + AsyncStorage | Mock responses | None |
| **Guest** | None | AsyncStorage (local only) | Requires Claude API key | None |
| **Authenticated** | Supabase | Supabase + local cache | Requires Claude API key | Supabase + Claude keys |

## Tech Stack

- **Framework**: React Native 0.83 + Expo SDK 55
- **Navigation**: Expo Router (file-based)
- **Styling**: NativeWind v4 (Tailwind for RN) + StyleSheet
- **Database**: Supabase (Postgres) + AsyncStorage fallback
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Auth**: Supabase Auth
- **Notifications**: expo-notifications

## License

MIT
