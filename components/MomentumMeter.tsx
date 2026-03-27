import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

interface MomentumMeterProps {
  score: number; // 0-10
}

export default function MomentumMeter({ score }: MomentumMeterProps) {
  const flames = Math.min(5, Math.ceil(score / 2));
  const fireEmojis = '🔥'.repeat(flames);
  const emptyDots = '·'.repeat(5 - flames);

  if (score <= 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.fire}>{fireEmojis}</Text>
      <Text style={styles.dots}>{emptyDots}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  fire: {
    fontSize: 10,
  },
  dots: {
    fontSize: 10,
    color: Colors.textMuted,
  },
});
