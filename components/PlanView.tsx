import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AIPlan } from '../lib/types';
import { Colors, Shadows } from '../constants/theme';

interface PlanViewProps {
  plan: AIPlan;
  ideaTitle: string;
}

function CollapsibleSection({
  title,
  icon,
  iconColor,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.section}>
      <Pressable onPress={() => setOpen(!open)} style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <Ionicons name={icon} size={18} color={iconColor} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.textMuted}
        />
      </Pressable>
      {open && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
}

export default function PlanView({ plan, ideaTitle }: PlanViewProps) {
  const handleExport = async () => {
    const phases = plan.phases
      .map((p, i) => `Phase ${i + 1}: ${p.name}\n  ${p.description}\n  Est: ${p.time_estimate}`)
      .join('\n\n');

    const tools = plan.tools_and_tech.join(', ');

    const budget = plan.budget
      .map((b) => `${b.category}: ${b.low} - ${b.high}`)
      .join('\n');

    const actions = plan.first_3_actions.map((a, i) => `${i + 1}. ${a}`).join('\n');

    const risks = plan.risk_flags
      .map((r) => `⚠️ ${r.risk}\n  Mitigation: ${r.mitigation}`)
      .join('\n\n');

    const text = `IdeaVault Plan: ${ideaTitle}\n${'='.repeat(40)}\n\n📋 PHASES\n${phases}\n\n🛠 TOOLS & TECH\n${tools}\n\n💰 BUDGET (AI Estimates)\n${budget}\n\n🎯 FIRST 3 ACTIONS\n${actions}\n\n⚠️ RISK FLAGS\n${risks}`;

    await Share.share({ message: text, title: `Plan: ${ideaTitle}` });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="map" size={20} color={Colors.gold} />
          <Text style={styles.headerTitle}>Build Plan</Text>
        </View>
        <Text style={styles.aiLabel}>AI Estimates</Text>
      </View>

      {/* Phases */}
      <CollapsibleSection title="Phase Roadmap" icon="git-branch" iconColor={Colors.accent}>
        {plan.phases.map((phase, index) => (
          <View key={index} style={styles.phaseItem}>
            <View style={styles.phaseNumber}>
              <Text style={styles.phaseNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.phaseContent}>
              <Text style={styles.phaseName}>{phase.name}</Text>
              <Text style={styles.phaseDesc}>{phase.description}</Text>
              <View style={styles.timeTag}>
                <Ionicons name="time" size={10} color={Colors.textMuted} />
                <Text style={styles.timeText}>{phase.time_estimate}</Text>
              </View>
            </View>
          </View>
        ))}
      </CollapsibleSection>

      {/* Tools & Tech */}
      <CollapsibleSection title="Tools & Tech" icon="hammer" iconColor={Colors.gold}>
        <View style={styles.tagContainer}>
          {plan.tools_and_tech.map((tool, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tool}</Text>
            </View>
          ))}
        </View>
      </CollapsibleSection>

      {/* Budget */}
      <CollapsibleSection title="Budget Breakdown" icon="cash" iconColor={Colors.success}>
        {plan.budget.map((item, index) => (
          <View key={index} style={styles.budgetRow}>
            <Text style={styles.budgetCategory}>{item.category}</Text>
            <Text style={styles.budgetRange}>
              {item.low} — {item.high}
            </Text>
          </View>
        ))}
      </CollapsibleSection>

      {/* First 3 Actions */}
      <CollapsibleSection title="First 3 Actions" icon="rocket" iconColor={Colors.amber}>
        {plan.first_3_actions.map((action, index) => (
          <View key={index} style={styles.actionRow}>
            <View style={styles.actionBullet}>
              <Text style={styles.actionBulletText}>{index + 1}</Text>
            </View>
            <Text style={styles.actionText}>{action}</Text>
          </View>
        ))}
      </CollapsibleSection>

      {/* Risk Flags */}
      <CollapsibleSection title="Risk Flags" icon="alert-circle" iconColor={Colors.danger} defaultOpen={false}>
        {plan.risk_flags.map((flag, index) => (
          <View key={index} style={styles.riskItem}>
            <Text style={styles.riskTitle}>⚠️ {flag.risk}</Text>
            <Text style={styles.riskMitigation}>
              <Text style={{ fontWeight: '700', color: Colors.success }}>Mitigation: </Text>
              {flag.mitigation}
            </Text>
          </View>
        ))}
      </CollapsibleSection>

      {/* Export button */}
      <Pressable onPress={handleExport} style={styles.exportButton}>
        <Ionicons name="share-outline" size={18} color={Colors.bg} />
        <Text style={styles.exportText}>Export Plan</Text>
      </Pressable>
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
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 18,
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
  section: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionContent: {
    marginTop: 12,
  },
  phaseItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  phaseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseNumberText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  phaseContent: {
    flex: 1,
  },
  phaseName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  phaseDesc: {
    color: Colors.textDim,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.navyLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    color: Colors.textDim,
    fontSize: 12,
    fontWeight: '600',
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  budgetCategory: {
    color: Colors.textDim,
    fontSize: 13,
  },
  budgetRange: {
    color: Colors.success,
    fontSize: 13,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  actionBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.amber + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBulletText: {
    color: Colors.amber,
    fontSize: 11,
    fontWeight: '700',
  },
  actionText: {
    color: Colors.textDim,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  riskItem: {
    marginBottom: 12,
    backgroundColor: Colors.danger + '08',
    padding: 12,
    borderRadius: 10,
  },
  riskTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  riskMitigation: {
    color: Colors.textDim,
    fontSize: 12,
    lineHeight: 18,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gold,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  exportText: {
    color: Colors.bg,
    fontSize: 15,
    fontWeight: '700',
  },
});
