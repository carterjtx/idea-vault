import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AIScore } from '../lib/types';
import { Colors, Shadows } from '../constants/theme';

interface ScoreCardProps {
  score: AIScore;
}

const DIMENSIONS = [
  { key: 'feasibility' as const, label: 'Feasibility', icon: 'construct' as const },
  { key: 'market_demand' as const, label: 'Market Demand', icon: 'trending-up' as const },
  { key: 'uniqueness' as const, label: 'Uniqueness', icon: 'diamond' as const },
  { key: 'time_to_build' as const, label: 'Time to Build', icon: 'time' as const },
  { key: 'revenue_potential' as const, label: 'Revenue Potential', icon: 'cash' as const },
];

function AnimatedBar({ value, delay }: { value: number; delay: number }) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: (value / 10) * 100,
      duration: 800,
      delay,
      useNativeDriver: false,
    }).start();
  }, [value, delay, width]);

  const getBarColor = (v: number) => {
    if (v >= 7) return Colors.success;
    if (v >= 4) return Colors.gold;
    return Colors.danger;
  };

  return (
    <View style={styles.barBg}>
      <Animated.View
        style={[
          styles.barFill,
          {
            backgroundColor: getBarColor(value),
            width: width.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

export default function ScoreCard({ score }: ScoreCardProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={18} color={Colors.gold} />
          <Text style={styles.headerTitle}>AI Analysis</Text>
        </View>
        <Text style={styles.aiLabel}>AI Estimates</Text>
      </View>

      {/* Overall Score */}
      <View style={styles.overallContainer}>
        <Text style={styles.overallScore}>{score.overall_score.toFixed(1)}</Text>
        <Text style={styles.overallLabel}>Overall Score</Text>
      </View>

      {/* Dimension Bars */}
      <View style={styles.dimensions}>
        {DIMENSIONS.map((dim, index) => (
          <View key={dim.key} style={styles.dimensionRow}>
            <View style={styles.dimensionLabel}>
              <Ionicons name={dim.icon} size={14} color={Colors.textDim} />
              <Text style={styles.dimensionText}>{dim.label}</Text>
            </View>
            <View style={styles.dimensionRight}>
              <AnimatedBar value={score[dim.key]} delay={index * 100} />
              <Text style={styles.dimensionValue}>{score[dim.key]}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Strengths */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
          <Text style={[styles.sectionTitle, { color: Colors.success }]}>Strengths</Text>
        </View>
        <Text style={styles.sectionBody}>{score.strengths}</Text>
      </View>

      {/* Weaknesses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="warning" size={16} color={Colors.warning} />
          <Text style={[styles.sectionTitle, { color: Colors.warning }]}>Areas to Improve</Text>
        </View>
        <Text style={styles.sectionBody}>{score.weaknesses}</Text>
      </View>

      {/* Devil's Advocate */}
      {score.devil_advocate && (
        <View style={[styles.section, styles.devilSection]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="skull" size={16} color={Colors.danger} />
            <Text style={[styles.sectionTitle, { color: Colors.danger }]}>Devil's Advocate</Text>
          </View>
          <Text style={styles.sectionBody}>{score.devil_advocate}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.cardGlow,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  aiLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    backgroundColor: Colors.textMuted + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  overallContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  overallScore: {
    color: Colors.gold,
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  overallLabel: {
    color: Colors.textDim,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  dimensions: {
    gap: 12,
    marginBottom: 20,
  },
  dimensionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dimensionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 130,
  },
  dimensionText: {
    color: Colors.textDim,
    fontSize: 12,
    fontWeight: '600',
  },
  dimensionRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barBg: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.navyLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  dimensionValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    width: 20,
    textAlign: 'right',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionBody: {
    color: Colors.textDim,
    fontSize: 13,
    lineHeight: 20,
  },
  devilSection: {
    backgroundColor: Colors.danger + '08',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.danger + '20',
    marginBottom: 0,
  },
});
