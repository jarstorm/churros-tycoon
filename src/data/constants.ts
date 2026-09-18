import { IngredientDef, LocationDef, UpgradeDef, WeatherInfo, WeatherType } from '../types';

export const STARTING_CASH = 20;

export const TAX_RATE = 0.21;

export const INGREDIENTS: Record<'flour' | 'oil' | 'sugar' | 'wraps', IngredientDef> = {
  flour: { id: 'flour', emoji: '🌾', basePrice: 0.08, priceVariance: 0.02 },
  oil: { id: 'oil', emoji: '🛢️', basePrice: 0.12, priceVariance: 0.03 },
  sugar: { id: 'sugar', emoji: '🧂', basePrice: 0.05, priceVariance: 0.015 },
  wraps: { id: 'wraps', emoji: '🧾', basePrice: 0.03, priceVariance: 0.01 },
};

export const WEATHER: Record<WeatherType, WeatherInfo> = {
  cold: { type: 'cold', emoji: '🥶', demandMultiplier: 1.8, tempC: 7 },
  rainy: { type: 'rainy', emoji: '🌧️', demandMultiplier: 2.2, tempC: 13 },
  cloudy: { type: 'cloudy', emoji: '☁️', demandMultiplier: 1.1, tempC: 18 },
  sunny: { type: 'sunny', emoji: '☀️', demandMultiplier: 0.75, tempC: 28 },
  hot: { type: 'hot', emoji: '🔥', demandMultiplier: 0.45, tempC: 35 },
};

export const BASE_CUSTOMERS = 40;

export const RECIPE_LIMITS = {
  flour: { min: 1, max: 6 },
  oil: { min: 1, max: 6 },
  sugar: { min: 1, max: 6 },
};

export const DEFAULT_RECIPE = { flour: 3, oil: 2, sugar: 2 };
export const DEFAULT_PRICE = 1.0;

export const UPGRADES: UpgradeDef[] = [
  { id: 'heater', cost: 20, capacityBonus: 0, qualityBonus: 0.1 },
  { id: 'autoChurrera', cost: 45, capacityBonus: 25, qualityBonus: 0 },
  { id: 'cartelLuminoso', cost: 70, capacityBonus: 20, qualityBonus: 0 },
  { id: 'freidoraDoble', cost: 160, capacityBonus: 35, qualityBonus: 0 },
  { id: 'recetaSecreta', cost: 220, capacityBonus: 0, qualityBonus: 0.15 },
  { id: 'toldoPremium', cost: 300, capacityBonus: 15, qualityBonus: 0.08 },
  { id: 'maquinaChocolate', cost: 450, capacityBonus: 0, qualityBonus: 0.15 },
  { id: 'segundoCarrito', cost: 800, capacityBonus: 70, qualityBonus: 0 },
  { id: 'appPedidos', cost: 1400, capacityBonus: 90, qualityBonus: 0.05 },
  { id: 'marcaFamosa', cost: 2500, capacityBonus: 150, qualityBonus: 0.1 },
];

export const DEFAULT_LOCATION = 'barrio';

export const LOCATIONS: LocationDef[] = [
  { id: 'barrio', dailyRent: 0, capacityBonus: 0 },
  { id: 'plaza', dailyRent: 6, capacityBonus: 35 },
  { id: 'estacion', dailyRent: 9, capacityBonus: 45 },
  { id: 'discoteca', dailyRent: 12, capacityBonus: 60 },
  { id: 'playa', dailyRent: 16, capacityBonus: 70 },
  { id: 'estadio', dailyRent: 40, capacityBonus: 130 },
];
