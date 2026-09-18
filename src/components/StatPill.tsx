import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FONT } from '../theme/type';

export function StatPill({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'good' | 'bad' }) {
  return (
    <View style={[styles.pill, tone === 'good' && styles.good, tone === 'bad' && styles.bad]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F4D35E',
    minWidth: 80,
  },
  good: { backgroundColor: '#E3F6E5', borderColor: '#6FCF97' },
  bad: { backgroundColor: '#FDE8E8', borderColor: '#EB5757' },
  label: { fontSize: 11, color: '#8A6D00', fontFamily: FONT.semi, fontWeight: '600' },
  value: { fontSize: 16, color: '#3A2E00', fontFamily: FONT.black, fontWeight: '800', marginTop: 2 },
});
