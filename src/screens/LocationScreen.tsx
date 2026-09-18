import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LOCATIONS } from '../data/constants';
import { useGameStore } from '../store/gameStore';
import { formatMoney } from '../utils/money';
import { FONT } from '../theme/type';
import { SceneBackground } from '../components/simulation/SceneBackground';
import { StandRig } from '../components/StandRig';
import { Icon } from '../components/icons/Icon';

const MAX_CAPACITY_BONUS = Math.max(...LOCATIONS.map((l) => l.capacityBonus), 1);
const PREVIEW_HEIGHT = 124;

export default function LocationScreen() {
  const { t, i18n } = useTranslation();
  const state = useGameStore();
  const [index, setIndex] = useState(() => Math.max(0, LOCATIONS.findIndex((l) => l.id === state.currentLocationId)));

  const location = LOCATIONS[index];
  const isCurrent = state.currentLocationId === location.id;
  const popularity = Math.round((location.capacityBonus / MAX_CAPACITY_BONUS) * 100);

  const [previewWidth, setPreviewWidth] = useState(220);

  const goPrev = () => setIndex((i) => (i - 1 + LOCATIONS.length) % LOCATIONS.length);
  const goNext = () => setIndex((i) => (i + 1) % LOCATIONS.length);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text style={styles.cash}>
        {t('location.cash')}: {formatMoney(state.cash, i18n.language)}
      </Text>

      <Text style={styles.sectionLabel}>{t('location.chooseLocation')}</Text>

      <View style={styles.carouselRow}>
        <Pressable style={styles.arrowButton} onPress={goPrev}>
          <Text style={styles.arrowText}>◀</Text>
        </Pressable>

        <View style={[styles.previewCard, isCurrent && styles.previewCardCurrent]}>
          <View style={styles.previewScene} onLayout={(e) => setPreviewWidth(e.nativeEvent.layout.width)}>
            <SceneBackground width={previewWidth} height={PREVIEW_HEIGHT} weather="sunny" locationId={location.id} />
            <View style={styles.previewCart}>
              <StandRig price={formatMoney(state.price, i18n.language)} scale={0.42} />
            </View>
          </View>
          <Text style={styles.previewName}>{t(`locationsList.${location.id}.label`)}</Text>
          <Text style={styles.previewDescription}>{t(`locationsList.${location.id}.description`)}</Text>

          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>{t('location.popularity')}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${popularity}%` }]} />
            </View>
          </View>

          <View style={styles.rentRow}>
            <Icon name="cash" size={16} />
            <Text style={styles.rentText}>
              {location.dailyRent > 0
                ? `${t('location.dailyRent')}: ${formatMoney(location.dailyRent, i18n.language)}`
                : t('location.free')}
            </Text>
          </View>

          {isCurrent ? (
            <View style={styles.currentBadge}>
              <Text style={styles.currentText}>{t('location.current')}</Text>
            </View>
          ) : (
            <Pressable style={styles.moveButton} onPress={() => useGameStore.getState().moveToLocation(location.id)}>
              <Text style={styles.moveButtonText}>{t('location.moveHere')}</Text>
            </Pressable>
          )}
        </View>

        <Pressable style={styles.arrowButton} onPress={goNext}>
          <Text style={styles.arrowText}>▶</Text>
        </Pressable>
      </View>

      <View style={styles.dots}>
        {LOCATIONS.map((l, i) => (
          <View key={l.id} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F2', padding: 20 },
  cash: { fontSize: 18, fontFamily: FONT.black, fontWeight: '800', color: '#219653', textAlign: 'center', marginBottom: 4 },
  sectionLabel: { fontSize: 14, fontFamily: FONT.bold, fontWeight: '700', color: '#9C6B3E', textAlign: 'center', marginBottom: 16 },
  carouselRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDECD2',
    borderWidth: 1,
    borderColor: '#E8A855',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: { fontSize: 18, fontFamily: FONT.black, fontWeight: '800', color: '#C1440E' },
  previewCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEE',
    alignItems: 'center',
    gap: 10,
  },
  previewCardCurrent: { borderColor: '#C1440E', borderWidth: 2, backgroundColor: '#FDECD2' },
  previewScene: {
    width: '100%',
    height: PREVIEW_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(74,46,26,0.14)',
    justifyContent: 'flex-end',
  },
  previewCart: { position: 'absolute', left: 8, bottom: 6 },
  rentRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  previewName: { fontSize: 18, fontFamily: FONT.black, fontWeight: '800', color: '#4A2E1A', textAlign: 'center' },
  previewDescription: { fontSize: 13, color: '#9C6B3E', textAlign: 'center' },
  statBlock: { width: '100%', gap: 4, marginTop: 4 },
  statLabel: { fontSize: 12, fontFamily: FONT.bold, fontWeight: '700', color: '#4A2E1A' },
  barTrack: { height: 10, backgroundColor: '#EEE', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#6FCF97' },
  rentText: { fontSize: 14, fontFamily: FONT.black, fontWeight: '800', color: '#C1440E' },
  moveButton: { backgroundColor: '#6FCF97', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20, marginTop: 6 },
  moveButtonText: { color: '#FFF', fontFamily: FONT.bold, fontWeight: '700' },
  currentBadge: { backgroundColor: '#C1440E', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 18, marginTop: 6 },
  currentText: { color: '#FFF', fontFamily: FONT.black, fontWeight: '800' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 18 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E8A855', opacity: 0.4 },
  dotActive: { opacity: 1, backgroundColor: '#C1440E' },
});
