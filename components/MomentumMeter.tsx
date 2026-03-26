import React from 'react';
import { View, Text } from 'react-native';

interface MomentumMeterProps {
  score: number; // 0-10
}

export default function MomentumMeter({ score }: MomentumMeterProps) {
  const flames = Math.min(5, Math.ceil(score / 2));
  const fireEmojis = '🔥'.repeat(flames);
  const emptyDots = '·'.repeat(5 - flames);

  if (score <= 0) return null;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: 10 }}>{fireEmojis}</Text>
      <Text style={{ fontSize: 10, color: '#5A5F78' }}>{emptyDots}</Text>
    </View>
  );
}
