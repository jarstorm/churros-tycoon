export type WeatherType = 'sunny' | 'hot' | 'cloudy' | 'rainy' | 'cold';

export interface WeatherInfo {
  type: WeatherType;
  emoji: string;
  demandMultiplier: number;
  tempC: number;
}

export type IngredientId = 'flour' | 'oil' | 'sugar' | 'wraps';

export interface IngredientDef {
  id: IngredientId;
  emoji: string;
  basePrice: number;
  priceVariance: number;
}

export interface Recipe {
  flour: number;
  oil: number;
  sugar: number;
}

export interface UpgradeDef {
  id: string;
  cost: number;
  capacityBonus: number;
  qualityBonus: number;
}

export interface LocationDef {
  id: string;
  dailyRent: number;
  capacityBonus: number;
}

export interface Inventory {
  flour: number;
  oil: number;
  sugar: number;
  wraps: number;
}

export interface DayResult {
  day: number;
  weather: WeatherType;
  unitsSold: number;
  unitsSatisfied: number;
  unitsUnsatisfied: number;
  unitsWasted: number;
  customersDeclinedPrice: number;
  customersLostStock: number;
  revenue: number;
  ingredientCost: number;
  grossProfit: number;
  tax: number;
  rent: number;
  netProfit: number;
  cashAfter: number;
}

export interface GameState {
  day: number;
  cash: number;
  inventory: Inventory;
  recipe: Recipe;
  idealRecipe: Recipe;
  price: number;
  ownedUpgrades: string[];
  currentLocationId: string;
  forecast: WeatherType;
  dailyPrices: Record<IngredientId, number>;
  lastResult: DayResult | null;
  // Rewarded-ad bonus can only be claimed once for a given day.
  rewardClaimedForDay: number | null;
  adsRemoved: boolean;
  history: DayResult[];
  gameOver: boolean;
}
