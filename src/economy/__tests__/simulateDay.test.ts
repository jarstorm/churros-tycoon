import { applySpoilage, simulateDay, unitCost } from '../simulateDay';
import {
  DEFAULT_LOCATION,
  DEFAULT_PRICE,
  DEFAULT_RECIPE,
  LOCATIONS,
  RECIPE_LIMITS,
  TAX_RATE,
  UPGRADES,
} from '../../data/constants';
import { DayResult, GameState, IngredientId, Inventory, WeatherType } from '../../types';

// Money fields are rounded to cents one by one, so sums can be off by one cent.
const CENT = 0.01 + 1e-9;

const DAILY_PRICES: Record<IngredientId, number> = { flour: 0.08, oil: 0.12, sugar: 0.05, wraps: 0.03 };

const PLENTY: Inventory = { flour: 1000, oil: 1000, sugar: 1000, wraps: 1000 };

const WEATHER_TYPES: WeatherType[] = ['cold', 'rainy', 'cloudy', 'sunny', 'hot'];

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    day: 1,
    cash: 100,
    inventory: { ...PLENTY },
    recipe: { ...DEFAULT_RECIPE },
    idealRecipe: { ...DEFAULT_RECIPE },
    price: DEFAULT_PRICE,
    ownedUpgrades: [],
    currentLocationId: DEFAULT_LOCATION,
    forecast: 'cloudy',
    dailyPrices: { ...DAILY_PRICES },
    lastResult: null,
    rewardClaimedForDay: null,
    adsRemoved: false,
    history: [],
    gameOver: false,
    ...overrides,
  };
}

function rentOf(locationId: string) {
  return LOCATIONS.find((l) => l.id === locationId)!.dailyRent;
}

function maxUnitsFromStock(state: GameState) {
  return Math.min(
    Math.floor(state.inventory.flour / state.recipe.flour),
    Math.floor(state.inventory.oil / state.recipe.oil),
    Math.floor(state.inventory.sugar / state.recipe.sugar),
    state.inventory.wraps
  );
}

function expectStockNeverNegative(state: GameState, result: DayResult) {
  const after = applySpoilage(state.inventory, state.recipe, result.unitsSold);
  for (const id of ['flour', 'oil', 'sugar', 'wraps'] as const) {
    expect(after[id]).toBeGreaterThanOrEqual(0);
    expect(after[id]).toBeLessThanOrEqual(state.inventory[id]);
  }
}

// Small seeded PRNG so randomised runs are reproducible.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('simulateDay (deterministic)', () => {
  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  it('net profit equals revenue minus ingredients, rent and tax on a profitable rented day', () => {
    const state = makeState({ currentLocationId: 'plaza' });
    const result = simulateDay(state, 'cloudy');

    expect(result.unitsSold).toBeGreaterThan(0);
    expect(result.revenue - result.ingredientCost - result.rent).toBeGreaterThan(0);

    expect(result.rent).toBe(rentOf('plaza'));
    expect(Math.abs(result.ingredientCost - result.unitsSold * unitCost(state.recipe, state.dailyPrices))).toBeLessThanOrEqual(CENT);
    expect(Math.abs(result.tax - TAX_RATE * (result.revenue - result.ingredientCost - result.rent))).toBeLessThanOrEqual(CENT);
    expect(
      Math.abs(result.netProfit - (result.revenue - result.ingredientCost - result.rent - result.tax))
    ).toBeLessThanOrEqual(CENT);

    expectStockNeverNegative(state, result);
  });

  it('charges no tax when nothing is sold at a rented location', () => {
    const state = makeState({
      currentLocationId: 'estadio',
      inventory: { flour: 0, oil: 0, sugar: 0, wraps: 0 },
    });
    const result = simulateDay(state, 'rainy');

    expect(result.unitsSold).toBe(0);
    expect(result.rent).toBe(rentOf('estadio'));
    expect(result.tax).toBe(0);
    expect(result.netProfit).toBe(-result.rent);

    expectStockNeverNegative(state, result);
  });

  it('charges no tax when rent exceeds gross profit', () => {
    const state = makeState({
      currentLocationId: 'estadio',
      inventory: { ...PLENTY, wraps: 5 },
    });
    const result = simulateDay(state, 'rainy');

    expect(result.unitsSold).toBeGreaterThan(0);
    expect(result.grossProfit - result.rent).toBeLessThanOrEqual(0);
    expect(result.tax).toBe(0);

    expectStockNeverNegative(state, result);
  });

  it('charges no tax on a break-even day with no sales and no rent', () => {
    const state = makeState({
      currentLocationId: 'barrio',
      inventory: { flour: 0, oil: 0, sugar: 0, wraps: 0 },
    });
    const result = simulateDay(state, 'cloudy');

    expect(result.unitsSold).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.netProfit).toBe(0);

    expectStockNeverNegative(state, result);
  });

  it('never sells more churros than the wraps in stock', () => {
    const state = makeState({ inventory: { ...PLENTY, wraps: 4 }, price: 0.5 });
    const result = simulateDay(state, 'cold');

    expect(result.unitsSold).toBe(4);
    expect(result.unitsSold).toBeLessThanOrEqual(maxUnitsFromStock(state));
    expect(result.customersLostStock).toBeGreaterThan(0);

    expectStockNeverNegative(state, result);
  });

  it('never sells more churros than the flour in stock allows for the recipe', () => {
    // Recipe uses 3 flour per churro, so 10 flour makes exactly 3 churros.
    const state = makeState({ inventory: { ...PLENTY, flour: 10 }, price: 0.5 });
    const result = simulateDay(state, 'rainy');

    expect(result.unitsSold).toBe(3);
    expect(result.unitsSold).toBeLessThanOrEqual(Math.floor(state.inventory.flour / state.recipe.flour));
    expect(result.unitsSold).toBeLessThanOrEqual(Math.floor(state.inventory.oil / state.recipe.oil));
    expect(result.unitsSold).toBeLessThanOrEqual(Math.floor(state.inventory.sugar / state.recipe.sugar));
    expect(result.unitsSold).toBeLessThanOrEqual(state.inventory.wraps);
    expect(result.customersLostStock).toBeGreaterThan(0);

    expectStockNeverNegative(state, result);
  });
});

describe('simulateDay (randomised invariants)', () => {
  it('holds the money and stock invariants across many random days', () => {
    const SEED = 20261016;
    const ITERATIONS = 500;
    const rand = mulberry32(SEED);
    jest.spyOn(Math, 'random').mockImplementation(rand);

    const randInt = (min: number, max: number) => Math.floor(min + rand() * (max - min + 1));
    const pick = <T,>(items: T[]) => items[Math.floor(rand() * items.length)];
    const failures: string[] = [];

    for (let i = 0; i < ITERATIONS; i++) {
      const state = makeState({
        inventory: {
          flour: randInt(0, 200),
          oil: randInt(0, 200),
          sugar: randInt(0, 200),
          wraps: randInt(0, 200),
        },
        recipe: {
          flour: randInt(RECIPE_LIMITS.flour.min, RECIPE_LIMITS.flour.max),
          oil: randInt(RECIPE_LIMITS.oil.min, RECIPE_LIMITS.oil.max),
          sugar: randInt(RECIPE_LIMITS.sugar.min, RECIPE_LIMITS.sugar.max),
        },
        idealRecipe: {
          flour: randInt(RECIPE_LIMITS.flour.min, RECIPE_LIMITS.flour.max),
          oil: randInt(RECIPE_LIMITS.oil.min, RECIPE_LIMITS.oil.max),
          sugar: randInt(RECIPE_LIMITS.sugar.min, RECIPE_LIMITS.sugar.max),
        },
        price: Math.round((0.05 + rand() * 4.95) * 100) / 100,
        currentLocationId: pick(LOCATIONS).id,
        ownedUpgrades: UPGRADES.filter(() => rand() < 0.5).map((u) => u.id),
      });
      const weather = pick(WEATHER_TYPES);
      const result = simulateDay(state, weather);
      const after = applySpoilage(state.inventory, state.recipe, result.unitsSold);

      const problems: string[] = [];
      const profitDiff = result.netProfit - (result.revenue - result.ingredientCost - result.rent - result.tax);
      if (Math.abs(profitDiff) > CENT) problems.push(`profit identity off by ${profitDiff}`);
      if (result.grossProfit - result.rent <= 0 && result.tax !== 0) problems.push(`tax ${result.tax} on a loss`);
      if (result.unitsSold > maxUnitsFromStock(state)) problems.push(`sold ${result.unitsSold} > stock max`);
      for (const id of ['flour', 'oil', 'sugar', 'wraps'] as const) {
        if (after[id] < 0) problems.push(`${id} negative after day (${after[id]})`);
      }

      if (problems.length > 0) {
        failures.push(
          `seed ${SEED} iteration ${i} weather ${weather}: ${problems.join('; ')}\n` +
            `state: ${JSON.stringify(state)}\nresult: ${JSON.stringify(result)}`
        );
      }
    }

    expect(failures).toEqual([]);
  });
});
