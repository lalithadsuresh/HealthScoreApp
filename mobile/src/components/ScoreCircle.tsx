import { StyleSheet, Text, View } from 'react-native';
import { colors, scoreColor } from '../theme';

export function ScoreCircle({ score, label = 'Your score' }: { score: number; label?: string }) {
  const ring = scoreColor(score);
  return (
    <View style={[styles.outer, { borderColor: ring }]}>
      <Text style={styles.value}>{score}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    marginVertical: 16,
  },
  value: { fontSize: 40, fontWeight: '700', color: colors.text },
  label: {
    fontSize: 11,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
});
