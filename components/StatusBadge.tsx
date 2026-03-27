import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IdeaStatus } from '../lib/types';
import { Colors } from '../constants/theme';

const STATUS_CONFIG: Record<IdeaStatus, { bg: string; text: string; label: string }> = {
  Raw: { bg: Colors.textMuted + '30', text: Colors.textDim, label: 'Raw' },
  Analyzed: { bg: Colors.accent + '30', text: Colors.accent, label: 'Analyzed' },
  'In Planning': { bg: Colors.gold + '30', text: Colors.gold, label: 'In Planning' },
  Launched: { bg: Colors.success + '30', text: Colors.success, label: 'Launched' },
  Archived: { bg: Colors.danger + '20', text: Colors.danger, label: 'Archived' },
};

interface StatusBadgeProps {
  status: IdeaStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
