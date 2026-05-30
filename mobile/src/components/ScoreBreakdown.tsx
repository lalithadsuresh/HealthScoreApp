import { StyleSheet, Text, View } from 'react-native';
import { Card } from './ui';
import { colors, scoreColor } from '../theme';
import type { ScoreSummary, VisualDriver } from '../types/api';

export function ScoreSummaryCard({
  summary,
  score,
}: {
  summary?: ScoreSummary | null;
  score: number;
}) {
  if (!summary) return null;
  const s = score ?? summary.score;
  return (
    <Card>
      <Text style={[styles.scoreBig, { color: scoreColor(s) }]}>Score: {s}/100</Text>
      <Text style={styles.metaLine}>
        <Text style={styles.metaStrong}>Goal:</Text> {summary.primaryGoalLabel}
      </Text>
      {summary.focusLine ? (
        <Text style={styles.metaLine}>
          <Text style={styles.metaStrong}>Focus:</Text> {summary.focusLine}
        </Text>
      ) : null}
    </Card>
  );
}

export function DriverChips({
  title,
  drivers,
  variant,
}: {
  title: string;
  drivers: VisualDriver[];
  variant: 'positive' | 'negative';
}) {
  if (!drivers?.length) return null;
  const pos = variant === 'positive';
  return (
    <Card>
      <Text style={styles.section}>{title}</Text>
      {drivers.map((d, i) => (
        <View
          key={`${d.label}-${i}`}
          style={[styles.driverRow, pos ? styles.driverPos : styles.driverNeg]}
        >
          <Text style={styles.driverLabel}>
            {d.icon} {d.label}
          </Text>
          <Text style={[styles.driverImpact, pos ? styles.impactPos : styles.impactNeg]}>
            {pos ? '+' : '−'}
            {d.impact}
          </Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  scoreBig: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  metaLine: { fontSize: 15, lineHeight: 22, marginTop: 4 },
  metaStrong: { fontWeight: '700' },
  section: { fontSize: 17, fontWeight: '600', marginBottom: 12 },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  driverPos: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  driverNeg: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  driverLabel: { fontWeight: '600', fontSize: 15, flex: 1, paddingRight: 8 },
  driverImpact: { fontWeight: '700', fontSize: 15 },
  impactPos: { color: '#15803d' },
  impactNeg: { color: '#b91c1c' },
});
