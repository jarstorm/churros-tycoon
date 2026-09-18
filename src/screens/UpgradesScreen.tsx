import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UPGRADES } from '../data/constants';
import { useGameStore } from '../store/gameStore';
import { formatMoney } from '../utils/money';
import { Icon } from '../components/icons/Icon';
import { FONT } from '../theme/type';

export default function UpgradesScreen() {
  const { t, i18n } = useTranslation();
  const state = useGameStore();

  const owned = UPGRADES.filter((u) => state.ownedUpgrades.includes(u.id)).length;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.cashRow}>
            <Icon name="cash" size={18} />
            <Text style={styles.cash}>{formatMoney(state.cash, i18n.language)}</Text>
          </View>
          <Text style={styles.progress}>
            {owned}/{UPGRADES.length}
          </Text>
        </View>

        {UPGRADES.map((upgrade) => {
          const isOwned = state.ownedUpgrades.includes(upgrade.id);
          const canAfford = state.cash >= upgrade.cost;

          return (
            <View key={upgrade.id} style={[styles.card, isOwned && styles.cardOwned, !isOwned && !canAfford && styles.cardLocked]}>
              <View style={styles.cardTop}>
                <View style={[styles.badge, isOwned && styles.badgeOwned]}>
                  <Icon name="upgrade" size={20} />
                </View>
                <View style={styles.cardTitleBlock}>
                  <Text style={styles.name}>{t(`upgradesList.${upgrade.id}.label`)}</Text>
                  <Text style={styles.description}>{t(`upgradesList.${upgrade.id}.description`)}</Text>
                </View>
              </View>

              <View style={styles.effectRow}>
                {upgrade.capacityBonus > 0 && (
                  <View style={styles.effectChip}>
                    <Text style={styles.effectText}>+{upgrade.capacityBonus} {t('upgrades.customers')}</Text>
                  </View>
                )}
                {upgrade.qualityBonus > 0 && (
                  <View style={[styles.effectChip, styles.effectChipQuality]}>
                    <Text style={[styles.effectText, styles.effectTextQuality]}>
                      +{Math.round(upgrade.qualityBonus * 100)}% {t('upgrades.quality')}
                    </Text>
                  </View>
                )}
              </View>

              {isOwned ? (
                <View style={styles.ownedBadge}>
                  <Text style={styles.ownedText}>{t('upgrades.owned')}</Text>
                </View>
              ) : (
                <Pressable
                  style={[styles.buyButton, !canAfford && styles.buyButtonDisabled]}
                  disabled={!canAfford}
                  onPress={() => useGameStore.getState().buyUpgrade(upgrade.id)}
                >
                  <Text style={styles.buyButtonText}>
                    {t('upgrades.buy')} {formatMoney(upgrade.cost, i18n.language)}
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F2' },
  scroll: { padding: 20, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  cashRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  cash: { fontSize: 18, fontFamily: FONT.black, fontWeight: '800', color: '#1E7A44' },
  progress: { fontSize: 14, fontFamily: FONT.bold, fontWeight: '700', color: '#9C8A72' },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE2CE',
    gap: 10,
  },
  cardOwned: { backgroundColor: '#F3FAF5', borderColor: '#A9DCBC' },
  cardLocked: { opacity: 0.62 },
  cardTop: { flexDirection: 'row', gap: 11, alignItems: 'flex-start' },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FDF2DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOwned: { backgroundColor: '#E3F6E5' },
  cardTitleBlock: { flex: 1, gap: 2 },
  name: { fontSize: 15.5, fontFamily: FONT.black, fontWeight: '800', color: '#4A2E1A' },
  description: { fontSize: 12.5, fontFamily: FONT.medium, color: '#9C6B3E', lineHeight: 17 },

  effectRow: { flexDirection: 'row', gap: 7, flexWrap: 'wrap' },
  effectChip: { backgroundColor: '#FDECD2', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3 },
  effectChipQuality: { backgroundColor: '#E9F1FB' },
  effectText: { fontSize: 11.5, fontFamily: FONT.bold, fontWeight: '700', color: '#B5651A' },
  effectTextQuality: { color: '#3E6B8F' },

  buyButton: { backgroundColor: '#2FA664', borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  buyButtonDisabled: { backgroundColor: '#D2CCC2' },
  buyButtonText: { color: '#FFF', fontFamily: FONT.black, fontWeight: '800', fontSize: 14.5 },
  ownedBadge: { backgroundColor: '#E3F6E5', borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  ownedText: { color: '#1E7A44', fontFamily: FONT.black, fontWeight: '800', fontSize: 14.5 },
});
