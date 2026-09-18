import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WEATHER } from '../data/constants';
import { useGameStore } from '../store/gameStore';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { StandRig } from '../components/StandRig';
import { formatTemp } from '../utils/temperature';
import { formatMoney } from '../utils/money';
import { Icon, IconName } from '../components/icons/Icon';
import { FONT } from '../theme/type';

const WEATHER_TINT: Record<string, string> = {
  cold: '#DCE9F2',
  rainy: '#CBD9E2',
  cloudy: '#E2E7EB',
  sunny: '#DCEEFB',
  hot: '#FBE3C8',
};

export default function StandScreen({ navigation }: any) {
  const { t, i18n } = useTranslation();
  const state = useGameStore();

  const forecast = WEATHER[state.forecast];
  const { recipe, inventory } = state;

  // How many dozens today's recipe can actually produce with what's in stock.
  const batches = Math.max(
    0,
    Math.min(
      Math.floor(inventory.flour / recipe.flour),
      Math.floor(inventory.oil / recipe.oil),
      Math.floor(inventory.sugar / recipe.sugar),
      inventory.wraps
    )
  );
  const canStartDay = batches > 0;

  const handleStartDay = () => navigation.navigate('Simulation');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.title}>{t('app.title')}</Text>
            <Text style={styles.subtitle}>{t('stand.day', { day: state.day })}</Text>
          </View>
          <LanguageSwitcher />
        </View>

        <View style={[styles.hero, { backgroundColor: WEATHER_TINT[state.forecast] ?? '#E8F4FD' }]}>
          <View style={styles.heroCart}>
            <StandRig price={formatMoney(state.price, i18n.language)} scale={0.62} />
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroLabel}>{t('stand.forecastLabel')}</Text>
            <Icon name={state.forecast as IconName} size={46} />
            <Text style={styles.heroWeather}>{t(`weather.${state.forecast}.label`)}</Text>
            <Text style={styles.heroTemp}>{formatTemp(forecast.tempC, i18n.language)}</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={[styles.statCard, styles.statCash]}>
            <Icon name="cash" size={20} />
            <View>
              <Text style={styles.statLabel}>{t('stand.cash')}</Text>
              <Text style={[styles.statValue, { color: '#1E7A44' }]}>{formatMoney(state.cash, i18n.language)}</Text>
            </View>
          </View>
          <Pressable style={[styles.statCard, styles.statPrice]} onPress={() => navigation.navigate('Recipe')}>
            <Icon name="recipe" size={20} />
            <View>
              <Text style={styles.statLabel}>{t('stand.pricePerDozen')}</Text>
              <Text style={[styles.statValue, { color: '#C1440E' }]}>{formatMoney(state.price, i18n.language)}</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.inventoryCard}>
          <View style={styles.inventoryHeader}>
            <Text style={styles.sectionTitle}>{t('stand.inventoryTitle')}</Text>
            <View style={[styles.batchBadge, !canStartDay && styles.batchBadgeEmpty]}>
              <Text style={[styles.batchBadgeText, !canStartDay && styles.batchBadgeTextEmpty]}>
                {t('stand.batchesReady', { count: batches })}
              </Text>
            </View>
          </View>
          <View style={styles.invRow}>
            <InventoryItem icon="flour" value={inventory.flour} need={recipe.flour} />
            <InventoryItem icon="oil" value={inventory.oil} need={recipe.oil} />
            <InventoryItem icon="sugar" value={inventory.sugar} need={recipe.sugar} />
            <InventoryItem icon="bag" value={inventory.wraps} need={1} />
          </View>
        </View>

        <View style={styles.tileGrid}>
          <NavTile icon="cart" label={t('stand.shop')} onPress={() => navigation.navigate('Shop')} />
          <NavTile icon="recipe" label={t('stand.recipeAndPrice')} onPress={() => navigation.navigate('Recipe')} />
          <NavTile icon="upgrade" label={t('stand.upgrades')} onPress={() => navigation.navigate('Upgrades')} />
          <NavTile icon="location" label={t('stand.location')} onPress={() => navigation.navigate('Location')} />
        </View>

        {!canStartDay && <Text style={styles.warning}>{t('stand.stockWarning')}</Text>}

        <Pressable
          style={[styles.startButton, !canStartDay && styles.startButtonDisabled]}
          onPress={handleStartDay}
          disabled={!canStartDay}
        >
          <Text style={styles.startButtonText}>{t('stand.openStand')}</Text>
        </Pressable>

        {state.gameOver && (
          <>
            <Text style={styles.gameOver}>{t('stand.gameOverMessage')}</Text>
            <Pressable style={styles.resetButton} onPress={() => useGameStore.getState().resetGame()}>
              <Text style={styles.resetButtonText}>{t('stand.resetGame')}</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function NavTile({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.tile} onPress={onPress}>
      <View style={styles.tileIcon}>
        <Icon name={icon} size={26} />
      </View>
      <Text style={styles.tileLabel}>{label}</Text>
    </Pressable>
  );
}

function InventoryItem({ icon, value, need }: { icon: IconName; value: number; need: number }) {
  const low = value < need * 10;
  return (
    <View style={styles.invItemRow}>
      <Icon name={icon} size={20} />
      <Text style={[styles.invItem, low && styles.invItemLow]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F2' },
  scroll: { padding: 20, paddingBottom: 32, gap: 14 },

  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { fontSize: 26, fontFamily: FONT.black, fontWeight: '800', color: '#4A2E1A' },
  subtitle: { fontSize: 15, fontFamily: FONT.semi, fontWeight: '600', color: '#9C6B3E' },

  hero: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderRadius: 20,
    paddingTop: 18,
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(74,46,26,0.1)',
    overflow: 'hidden',
  },
  heroCart: { marginBottom: -6 },
  heroInfo: { alignItems: 'center', gap: 1, paddingBottom: 6 },
  heroLabel: { fontSize: 11, fontFamily: FONT.bold, fontWeight: '700', color: '#5C7086', letterSpacing: 0.4 },
  heroWeather: { fontSize: 15, fontFamily: FONT.black, fontWeight: '800', color: '#1F3A5F' },
  heroTemp: { fontSize: 13, fontFamily: FONT.semi, fontWeight: '600', color: '#5C7086' },

  statRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  statCash: { backgroundColor: '#E9F7EE', borderColor: '#A9DCBC' },
  statPrice: { backgroundColor: '#FDECD2', borderColor: '#E8A855' },
  statLabel: { fontSize: 10.5, fontFamily: FONT.semi, fontWeight: '600', color: '#7A6752' },
  statValue: { fontSize: 17, fontFamily: FONT.black, fontWeight: '800', fontVariant: ['tabular-nums'] },

  inventoryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE2CE',
    gap: 10,
  },
  inventoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 13, fontFamily: FONT.bold, fontWeight: '700', color: '#4A2E1A' },
  batchBadge: { backgroundColor: '#E9F7EE', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3 },
  batchBadgeEmpty: { backgroundColor: '#FDE8E8' },
  batchBadgeText: { fontSize: 11, fontFamily: FONT.bold, fontWeight: '700', color: '#1E7A44' },
  batchBadgeTextEmpty: { color: '#C1440E' },
  invRow: { flexDirection: 'row', justifyContent: 'space-between' },
  invItemRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  invItem: { fontSize: 16, fontFamily: FONT.bold, fontWeight: '700', color: '#4A2E1A', fontVariant: ['tabular-nums'] },
  invItemLow: { color: '#C1440E' },

  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '47.6%',
    flexGrow: 1,
    backgroundColor: '#FDECD2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8A855',
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF7EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: { fontSize: 13.5, fontFamily: FONT.bold, fontWeight: '700', color: '#4A2E1A', textAlign: 'center' },

  warning: { color: '#C1440E', textAlign: 'center', fontSize: 13, fontFamily: FONT.semi, fontWeight: '600' },
  startButton: {
    backgroundColor: '#C1440E',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#C1440E',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  startButtonDisabled: { backgroundColor: '#DCC7AE', shadowOpacity: 0, elevation: 0 },
  startButtonText: { color: '#FFF', fontSize: 18, fontFamily: FONT.black, fontWeight: '800', letterSpacing: 0.3 },

  gameOver: { color: '#C1440E', textAlign: 'center', fontFamily: FONT.bold, fontWeight: '700', marginTop: 8 },
  resetButton: { backgroundColor: '#C1440E', borderRadius: 12, padding: 14, alignItems: 'center' },
  resetButtonText: { color: '#FFF', fontFamily: FONT.bold, fontWeight: '700' },
});
