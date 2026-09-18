import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { setAppLanguage } from '../i18n';
import { FONT } from '../theme/type';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('en') ? 'en' : 'es';

  return (
    <View style={styles.row}>
      <LangButton label="ES" active={current === 'es'} onPress={() => setAppLanguage('es')} />
      <LangButton label="EN" active={current === 'en'} onPress={() => setAppLanguage('en')} />
    </View>
  );
}

function LangButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.button, active && styles.buttonActive]} onPress={onPress}>
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6 },
  button: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F0E4D8',
  },
  buttonActive: { backgroundColor: '#C1440E' },
  text: { fontSize: 12, fontFamily: FONT.bold, fontWeight: '700', color: '#4A2E1A' },
  textActive: { color: '#FFF' },
});
