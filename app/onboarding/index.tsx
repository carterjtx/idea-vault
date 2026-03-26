import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  FlatList,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Shadows } from '../../constants/theme';

const { width } = Dimensions.get('window');
const ONBOARDING_KEY = 'ideavault_onboarding_complete';
const LOCAL_IDEAS_KEY = 'ideavault_ideas';

interface Slide {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  isCapture?: boolean;
}

const slides: Slide[] = [
  {
    key: '1',
    icon: 'lock-closed',
    title: 'Your ideas are\nworth saving',
    subtitle:
      'IdeaVault is your personal vault for every spark of inspiration. No idea gets lost, no thought forgotten.',
  },
  {
    key: '2',
    icon: 'sparkles',
    title: 'AI scores your\nideas instantly',
    subtitle:
      'Get instant analysis across 5 dimensions — feasibility, demand, uniqueness, build time, and revenue potential.',
  },
  {
    key: '3',
    icon: 'bulb',
    title: 'Log your first idea',
    subtitle: "Start your vault right now. What's been on your mind?",
    isCapture: true,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [firstIdea, setFirstIdea] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleComplete = async () => {
    // Save first idea if provided
    if (firstIdea.trim()) {
      const now = new Date().toISOString();
      const idea = {
        id: Date.now().toString(),
        user_id: '',
        title: firstIdea.trim(),
        description: null,
        category: null,
        status: 'Raw',
        voice_note_url: null,
        image_url: null,
        ai_score: null,
        ai_plan: null,
        linked_idea_ids: [],
        momentum_score: 1,
        last_interaction: now,
        versions: [],
        created_at: now,
        updated_at: now,
      };

      try {
        const existing = await AsyncStorage.getItem(LOCAL_IDEAS_KEY);
        const ideas = existing ? JSON.parse(existing) : [];
        ideas.unshift(idea);
        await AsyncStorage.setItem(LOCAL_IDEAS_KEY, JSON.stringify(ideas));
      } catch {
        // Continue anyway
      }
    }

    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(auth)/login');
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(auth)/login');
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { width }]}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.iconGlow} />
        <Ionicons name={item.icon} size={64} color={Colors.gold} />
      </View>

      {/* Title */}
      <Text style={styles.title}>{item.title}</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>{item.subtitle}</Text>

      {/* Capture input on slide 3 */}
      {item.isCapture && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.captureContainer}>
            <TextInput
              style={styles.captureInput}
              placeholder="My million-dollar idea..."
              placeholderTextColor={Colors.textMuted}
              value={firstIdea}
              onChangeText={setFirstIdea}
              multiline
              maxLength={200}
            />
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Skip button */}
      <Pressable onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(item) => item.key}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Bottom area */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Button */}
        {currentIndex < slides.length - 1 ? (
          <Pressable onPress={handleNext} style={styles.nextButton}>
            <Text style={styles.nextText}>Next</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.bg} />
          </Pressable>
        ) : (
          <Pressable onPress={handleComplete} style={styles.nextButton}>
            <Text style={styles.nextText}>
              {firstIdea.trim() ? 'Save & Continue' : 'Get Started'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.bg} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    color: Colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 32,
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.gold + '10',
    borderWidth: 1,
    borderColor: Colors.gold + '20',
  },
  title: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  subtitle: {
    color: Colors.textDim,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  captureContainer: {
    marginTop: 32,
    width: width - 80,
  },
  captureInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.gold + '40',
    borderRadius: 16,
    padding: 16,
    color: Colors.text,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    ...Shadows.cardGlow,
  },
  bottom: {
    paddingHorizontal: 40,
    paddingBottom: 60,
    gap: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted + '40',
  },
  dotActive: {
    backgroundColor: Colors.gold,
    width: 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    paddingVertical: 16,
    borderRadius: 14,
    ...Shadows.fab,
  },
  nextText: {
    color: Colors.bg,
    fontSize: 16,
    fontWeight: '700',
  },
});
