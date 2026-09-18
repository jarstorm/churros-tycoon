import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  DEFAULT_LOCATION,
  DEFAULT_PRICE,
  DEFAULT_RECIPE,
  INGREDIENTS,
  RECIPE_LIMITS,
  STARTING_CASH,
  UPGRADES,
} from '../data/constants';
import { applySpoilage, randomForecast, randomIdealRecipe, rollWeather, simulateDay } from '../economy/simulateDay';
import { DayResult, GameState, IngredientId, Recipe } from '../types';

function rollDailyPrices(): Record<IngredientId, number> {
  const entries = Object.values(INGREDIENTS).map((ing) => {
    const price = Math.max(
      0.01,
      ing.basePrice + (Math.random() * 2 - 1) * ing.priceVariance
    );
    return [ing.id, Math.round(price * 100) / 100] as const;
  });
  return Object.fromEntries(entries) as Record<IngredientId, number>;
}

const initialState: GameState = {
  day: 1,
  cash: STARTING_CASH,
  inventory: { flour: 0, oil: 0, sugar: 0, wraps: 0 },
  recipe: { ...DEFAULT_RECIPE },
  idealRecipe: randomIdealRecipe(),
  price: DEFAULT_PRICE,
  ownedUpgrades: [],
  currentLocationId: DEFAULT_LOCATION,
  forecast: randomForecast(),
  dailyPrices: rollDailyPrices(),
  lastResult: null,
  rewardClaimedForDay: null,
  adsRemoved: false,
  history: [],
  gameOver: false,
};

interface GameActions {
  buyIngredient: (id: IngredientId, qty: number) => void;
  setRecipe: (recipe: Recipe) => void;
  setPrice: (price: number) => void;
  buyUpgrade: (id: string) => void;
  moveToLocation: (id: string) => void;
  computeDayPreview: () => DayResult;
  commitDayResult: (result: DayResult) => void;
  startDay: () => void;
  claimRewardBonus: (day: number, amount: number) => boolean;
  setAdsRemoved: (removed: boolean) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      buyIngredient: (id, qty) => {
        const state = get();
        if (qty <= 0) return;
        const unitPrice = state.dailyPrices[id];
        const cost = Math.round(unitPrice * qty * 100) / 100;
        if (cost > state.cash) return;
        set({
          cash: Math.round((state.cash - cost) * 100) / 100,
          inventory: {
            ...state.inventory,
            [id]: state.inventory[id] + qty,
          },
        });
      },

      setRecipe: (recipe) => {
        const clamped: Recipe = {
          flour: Math.max(RECIPE_LIMITS.flour.min, Math.min(RECIPE_LIMITS.flour.max, recipe.flour)),
          oil: Math.max(RECIPE_LIMITS.oil.min, Math.min(RECIPE_LIMITS.oil.max, recipe.oil)),
          sugar: Math.max(RECIPE_LIMITS.sugar.min, Math.min(RECIPE_LIMITS.sugar.max, recipe.sugar)),
        };
        set({ recipe: clamped });
      },

      setPrice: (price) => {
        set({ price: Math.max(0.05, Math.round(price * 100) / 100) });
      },

      buyUpgrade: (id) => {
        const state = get();
        if (state.ownedUpgrades.includes(id)) return;
        const upgrade = UPGRADES.find((u) => u.id === id);
        if (!upgrade || upgrade.cost > state.cash) return;
        set({
          cash: Math.round((state.cash - upgrade.cost) * 100) / 100,
          ownedUpgrades: [...state.ownedUpgrades, id],
        });
      },

      moveToLocation: (id) => {
        set({ currentLocationId: id });
      },

      computeDayPreview: () => {
        const state = get();
        const actualWeather = rollWeather(state.forecast);
        return simulateDay(state, actualWeather);
      },

      commitDayResult: (result) => {
        const state = get();
        const nextInventory = applySpoilage(state.inventory, state.recipe, result.unitsSold);

        const nextCash = Math.round((state.cash + result.revenue - result.rent - result.tax) * 100) / 100;
        const canAffordAnything =
          nextCash >= INGREDIENTS.flour.basePrice &&
          nextCash >= INGREDIENTS.wraps.basePrice;

        set({
          day: state.day + 1,
          cash: nextCash,
          inventory: nextInventory,
          forecast: randomForecast(),
          dailyPrices: rollDailyPrices(),
          lastResult: { ...result, cashAfter: nextCash },
          history: [...state.history, { ...result, cashAfter: nextCash }],
          gameOver: !canAffordAnything && nextInventory.flour === 0 && nextInventory.wraps === 0,
        });
      },

      startDay: () => {
        const result = get().computeDayPreview();
        get().commitDayResult(result);
      },

      // Doubles the profit the player just earned, in exchange for watching a
      // rewarded ad. The day is passed in because the bonus is offered on the
      // results card, before the day itself is committed.
      claimRewardBonus: (day, amount) => {
        const state = get();
        if (amount <= 0 || state.rewardClaimedForDay === day) return false;
        set({
          cash: Math.round((state.cash + amount) * 100) / 100,
          rewardClaimedForDay: day,
        });
        return true;
      },

      setAdsRemoved: (removed) => set({ adsRemoved: removed }),

      resetGame: () => {
        set({
          ...initialState,
          idealRecipe: randomIdealRecipe(),
          currentLocationId: DEFAULT_LOCATION,
          rewardClaimedForDay: null,
          forecast: randomForecast(),
          dailyPrices: rollDailyPrices(),
        });
      },
    }),
    {
      name: 'churros-tycoon-save',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
