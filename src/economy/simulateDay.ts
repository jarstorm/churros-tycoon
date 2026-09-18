import { BASE_CUSTOMERS, LOCATIONS, RECIPE_LIMITS, TAX_RATE, UPGRADES, WEATHER } from '../data/constants';
import { DayResult, GameState, IngredientId, Recipe, WeatherType } from '../types';

export function unitCost(recipe: Recipe, dailyPrices: Record<IngredientId, number>): number {
  return (
    recipe.flour * dailyPrices.flour +
    recipe.oil * dailyPrices.oil +
    recipe.sugar * dailyPrices.sugar +
    dailyPrices.wraps
  );
}

export function randomIdealRecipe(): Recipe {
  const randInt = (min: number, max: number) => Math.floor(min + Math.random() * (max - min + 1));
  return { flour: randInt(1, 4), oil: randInt(1, 4), sugar: randInt(1, 4) };
}

function recipeQuality(recipe: Recipe, idealRecipe: Recipe): number {
  const dist =
    Math.abs(recipe.flour - idealRecipe.flour) / RECIPE_LIMITS.flour.max +
    Math.abs(recipe.oil - idealRecipe.oil) / RECIPE_LIMITS.oil.max +
    Math.abs(recipe.sugar - idealRecipe.sugar) / RECIPE_LIMITS.sugar.max;
  const quality = 1 - dist / 1.8;
  return Math.max(0.15, Math.min(1, quality));
}

function upgradeBonuses(ownedUpgrades: string[]) {
  return UPGRADES.filter((u) => ownedUpgrades.includes(u.id)).reduce(
    (acc, u) => ({
      capacity: acc.capacity + u.capacityBonus,
      quality: acc.quality + u.qualityBonus,
    }),
    { capacity: 0, quality: 0 }
  );
}

function randRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function rollWeather(forecast: WeatherType): WeatherType {
  const types: WeatherType[] = ['cold', 'rainy', 'cloudy', 'sunny', 'hot'];
  if (Math.random() < 0.75) return forecast;
  const idx = types.indexOf(forecast);
  const neighbor = types[Math.max(0, Math.min(types.length - 1, idx + (Math.random() < 0.5 ? -1 : 1)))];
  return neighbor;
}

export function randomForecast(): WeatherType {
  const types: WeatherType[] = ['cold', 'rainy', 'cloudy', 'sunny', 'hot'];
  const weights = [0.15, 0.2, 0.25, 0.3, 0.1];
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < types.length; i++) {
    acc += weights[i];
    if (r <= acc) return types[i];
  }
  return 'cloudy';
}

export function simulateDay(state: GameState, actualWeather: WeatherType): DayResult {
  const weather = WEATHER[actualWeather];
  const quality = Math.min(
    1.2,
    recipeQuality(state.recipe, state.idealRecipe) + upgradeBonuses(state.ownedUpgrades).quality
  );
  const equipmentCapacityBonus = upgradeBonuses(state.ownedUpgrades).capacity;
  const locationCapacityBonus = LOCATIONS.find((l) => l.id === state.currentLocationId)?.capacityBonus ?? 0;

  const potentialCustomers = Math.round(
    (BASE_CUSTOMERS + equipmentCapacityBonus + locationCapacityBonus) * weather.demandMultiplier * randRange(0.85, 1.15)
  );

  const fairPrice = 0.5 + quality * 0.9;
  const priceRatio = fairPrice / Math.max(0.05, state.price);
  const demandFactor = Math.max(0, Math.min(1.4, priceRatio));
  const buyProbability = Math.max(0, Math.min(1, demandFactor * (0.4 + quality * 0.6)));

  const customersWantingToBuy = Math.round(potentialCustomers * buyProbability);
  const customersDeclinedPrice = Math.max(0, potentialCustomers - customersWantingToBuy);

  const maxByFlour = Math.floor(state.inventory.flour / state.recipe.flour);
  const maxByOil = Math.floor(state.inventory.oil / state.recipe.oil);
  const maxBySugar = Math.floor(state.inventory.sugar / state.recipe.sugar);
  const maxByWraps = state.inventory.wraps;
  const maxUnitsFromInventory = Math.max(0, Math.min(maxByFlour, maxByOil, maxBySugar, maxByWraps));

  const unitsSold = Math.min(customersWantingToBuy, maxUnitsFromInventory);
  const customersLostStock = Math.max(0, customersWantingToBuy - unitsSold);

  const satisfactionProbability = Math.min(1, quality);
  const unitsSatisfied = Math.round(unitsSold * satisfactionProbability);
  const unitsUnsatisfied = unitsSold - unitsSatisfied;

  const remainingFlour = state.inventory.flour - unitsSold * state.recipe.flour;
  const remainingOil = state.inventory.oil - unitsSold * state.recipe.oil;
  const spoiledFlour = Math.round(remainingFlour * 0.25);
  const spoiledOil = Math.round(remainingOil * 0.1);

  const revenue = unitsSold * state.price;
  const ingredientCost = unitsSold * unitCost(state.recipe, state.dailyPrices);
  const rent = LOCATIONS.find((l) => l.id === state.currentLocationId)?.dailyRent ?? 0;
  const grossProfit = revenue - ingredientCost;
  const taxableProfit = grossProfit - rent;
  const tax = Math.max(0, taxableProfit) * TAX_RATE;
  const netProfit = taxableProfit - tax;

  return {
    day: state.day,
    weather: actualWeather,
    unitsSold,
    unitsSatisfied,
    unitsUnsatisfied,
    unitsWasted: spoiledFlour + spoiledOil,
    customersDeclinedPrice,
    customersLostStock,
    revenue: round2(revenue),
    ingredientCost: round2(ingredientCost),
    grossProfit: round2(grossProfit),
    tax: round2(tax),
    rent: round2(rent),
    netProfit: round2(netProfit),
    cashAfter: round2(state.cash + revenue - rent - tax),
  };
}

export function applySpoilage(inventory: GameState['inventory'], recipe: Recipe, unitsSold: number) {
  const remainingFlour = Math.max(0, inventory.flour - unitsSold * recipe.flour);
  const remainingOil = Math.max(0, inventory.oil - unitsSold * recipe.oil);
  const remainingSugar = Math.max(0, inventory.sugar - unitsSold * recipe.sugar);
  const remainingWraps = Math.max(0, inventory.wraps - unitsSold);

  return {
    flour: remainingFlour - Math.round(remainingFlour * 0.25),
    oil: remainingOil - Math.round(remainingOil * 0.1),
    sugar: remainingSugar,
    wraps: remainingWraps,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
