import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { INGREDIENTS } from '../data/constants';
import { useGameStore } from '../store/gameStore';
import { IngredientId } from '../types';
import { formatMoney } from '../utils/money';
import { Icon, IconName } from '../components/icons/Icon';
import { FONT } from '../theme/type';

const INGREDIENT_ICONS: Record<IngredientId, IconName> = {
  flour: 'flour',
  oil: 'oil',
  sugar: 'sugar',
  wraps: 'bag',
};

const QUANTITY_STEPS = [10, 25, 100, 250, 500, 1000];

export default function ShopScreen() {
  const { t, i18n } = useTranslation();
  const state = useGameStore();
  const [quantities, setQuantities] = useState<Record<IngredientId, number>>({
    flour: 10,
    oil: 10,
    sugar: 10,
    wraps: 10,
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.cash}>
          {t('shop.cash')}: {formatMoney(state.cash, i18n.language)}
        </Text>

        {Object.values(INGREDIENTS).map((ing) => {
          const qty = quantities[ing.id];
          const unitPrice = state.dailyPrices[ing.id];
          const totalCost = Math.round(unitPrice * qty * 100) / 100;
          const canAfford = totalCost <= state.cash && qty > 0;

          return (
            <View key={ing.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconWell}>
                  <Icon name={INGREDIENT_ICONS[ing.id]} size={26} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{t(`ingredients.${ing.id}.label`)}</Text>
                  <Text style={styles.price}>
                    {formatMoney(unitPrice, i18n.language)} / {t(`ingredients.${ing.id}.unit`)}
                  </Text>
                </View>
                <Text style={styles.owned}>
                  {t('shop.have')}: {state.inventory[ing.id]}
                </Text>
              </View>

              <View style={styles.qtyRow}>
                {QUANTITY_STEPS.map((step) => {
                  const selected = qty === step;
                  return (
                    <Pressable
                      key={step}
                      style={[styles.qtyChip, selected && styles.qtyChipSelected]}
                      onPress={() => setQuantities((q) => ({ ...q, [ing.id]: step }))}
                    >
                      <Text style={[styles.qtyChipText, selected && styles.qtyChipTextSelected]}>{step}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.qtyLabel}>
                  {qty} {t(`ingredients.${ing.id}.unit`)}
                </Text>
                <Pressable
                  style={[styles.buyButton, !canAfford && styles.buyButtonDisabled]}
                  disabled={!canAfford}
                  onPress={() => useGameStore.getState().buyIngredient(ing.id, qty)}
                >
                  <Text style={styles.buyButtonText}>
                    {t('shop.buy')} {formatMoney(totalCost, i18n.language)}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F2' },
  scroll: { padding: 20, gap: 14 },
  cash: { fontSize: 18, fontFamily: FONT.black, fontWeight: '800', color: '#219653', textAlign: 'center', marginBottom: 8 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#EEE', gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FDF6EA',
    borderWidth: 1,
    borderColor: '#EFE2CE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 16, fontFamily: FONT.bold, fontWeight: '700', color: '#4A2E1A' },
  price: { fontSize: 13, color: '#9C6B3E' },
  owned: { fontSize: 12, color: '#999' },
  qtyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  qtyChip: {
    backgroundColor: '#FDECD2',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E8A855',
  },
  qtyChipSelected: { backgroundColor: '#C1440E', borderColor: '#C1440E' },
  qtyChipText: { fontSize: 13, fontFamily: FONT.bold, fontWeight: '700', color: '#4A2E1A' },
  qtyChipTextSelected: { color: '#FFF' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyLabel: { fontSize: 14, fontFamily: FONT.bold, fontWeight: '700', color: '#4A2E1A' },
  buyButton: { backgroundColor: '#6FCF97', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16 },
  buyButtonDisabled: { backgroundColor: '#CFCFCF' },
  buyButtonText: { color: '#FFF', fontFamily: FONT.bold, fontWeight: '700' },
});
