import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FONT } from '../theme/type';

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <View style={styles.row}>
      <Pressable
        style={styles.button}
        onPress={() => onChange(Math.max(min, Math.round((value - step) * 100) / 100))}
      >
        <Text style={styles.buttonText}>−</Text>
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        style={styles.button}
        onPress={() => onChange(Math.min(max, Math.round((value + step) * 100) / 100))}
      >
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4D35E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 20, fontFamily: FONT.bold, fontWeight: '700', color: '#3A2E00' },
  value: { fontSize: 18, fontFamily: FONT.bold, fontWeight: '700', minWidth: 40, textAlign: 'center' },
});
