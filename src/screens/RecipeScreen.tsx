import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RECIPE_LIMITS, TAX_RATE } from '../data/constants';
import { unitCost } from '../economy/simulateDay';
import { useGameStore } from '../store/gameStore';
import { Stepper } from '../components/Stepper';
import { StatPill } from '../components/StatPill';
import { formatMoney } from '../utils/money';
import { FONT } from '../theme/type';
import { Icon, IconName } from '../components/icons/Icon';

export default function RecipeScreen() {
  const { t, i18n } = useTranslation();
  const state = useGameStore();

  const cost = unitCost(state.recipe, state.dailyPrices);
  const grossProfit = state.price - cost;
  const tax = Math.max(0, grossProfit) * TAX_RATE;
  const netProfit = grossProfit - tax;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('recipe.sectionTitle')}</Text>

          <RecipeRow
            icon="flour"
            label={t('ingredients.flour.label')}
            value={state.recipe.flour}
            min={RECIPE_LIMITS.flour.min}
            max={RECIPE_LIMITS.flour.max}
            onChange={(flour) => useGameStore.getState().setRecipe({ ...state.recipe, flour })}
          />
          <RecipeRow
            icon="oil"
            label={t('ingredients.oil.label')}
            value={state.recipe.oil}
            min={RECIPE_LIMITS.oil.min}
            max={RECIPE_LIMITS.oil.max}
            onChange={(oil) => useGameStore.getState().setRecipe({ ...state.recipe, oil })}
          />
          <RecipeRow
            icon="sugar"
            label={t('ingredients.sugar.label')}
            value={state.recipe.sugar}
            min={RECIPE_LIMITS.sugar.min}
            max={RECIPE_LIMITS.sugar.max}
            onChange={(sugar) => useGameStore.getState().setRecipe({ ...state.recipe, sugar })}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('recipe.priceTitle')}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceValue}>{formatMoney(state.price, i18n.language)}</Text>
            <Stepper
              value={state.price}
              onChange={(price) => useGameStore.getState().setPrice(price)}
              min={0.1}
              max={8}
              step={0.1}
            />
          </View>
          <Text style={styles.hint}>{t('recipe.priceHint')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('recipe.costAnalysisTitle')}</Text>
          <View style={styles.costStats}>
            <StatPill label={t('recipe.costPerDozen')} value={formatMoney(cost, i18n.language)} tone="bad" />
            <StatPill
              label={t('recipe.grossProfit')}
              value={formatMoney(grossProfit, i18n.language)}
              tone={grossProfit >= 0 ? 'good' : 'bad'}
            />
            <StatPill label={t('recipe.tax')} value={formatMoney(tax, i18n.language)} tone="bad" />
            <StatPill
              label={t('recipe.netProfit')}
              value={formatMoney(netProfit, i18n.language)}
              tone={netProfit >= 0 ? 'good' : 'bad'}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RecipeRow({
  icon,
  label,
  value,
  min,
  max,
  onChange,
}: {
  icon: IconName;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.recipeRow}>
      <View style={styles.recipeLabelRow}>
        <Icon name={icon} size={22} />
        <Text style={styles.recipeLabel}>{label}</Text>
      </View>
      <Stepper value={value} onChange={onChange} min={min} max={max} step={1} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F2' },
  scroll: { padding: 20, gap: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#EEE', gap: 14 },
  sectionTitle: { fontSize: 16, fontFamily: FONT.black, fontWeight: '800', color: '#4A2E1A' },
  recipeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  recipeLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recipeLabel: { fontSize: 16, fontFamily: FONT.semi, fontWeight: '600', color: '#4A2E1A' },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceValue: { fontSize: 24, fontFamily: FONT.black, fontWeight: '800', color: '#C1440E' },
  hint: { fontSize: 12, color: '#999' },
  costStats: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
});
