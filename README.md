# 🍩 Churros Tycoon

A mobile tycoon simulation game built with **Expo / React Native**. Run your own churros stand: buy ingredients, tweak your recipe and price, manage inventory, upgrade your stand, and grow your business day by day.

Inspired by classic lemonade-stand style economics simulators, reimagined with a churros stand theme, its own art, mechanics, and content.

## Features

- 📈 Daily simulation loop: buy stock, set your recipe & price, open the stand, and watch customers react in real time
- 🌦️ Weather-based demand forecasting that affects tomorrow's sales
- 🛒 Shop system for ingredients (flour, paper bags, etc.)
- 🔧 Upgrades and location choices to grow your business
- 💰 Economy simulation with revenue, ingredient cost, rent, and tax
- 🌍 Localization support (English / Spanish)
- 📱 Built with Expo, React Navigation, Zustand, and React Native Reanimated/SVG

## Tech Stack

- [Expo](https://docs.expo.dev/) (SDK 57)
- React Native
- TypeScript
- Zustand (state management)
- React Navigation
- i18next (localization)

## Getting Started

```bash
npm install
npm start
```

Then run on your platform of choice:

```bash
npm run android
npm run ios
npm run web
```

## Project Structure

```
src/
├── ads/          # Ad integration (react-native-google-mobile-ads)
├── components/   # UI components and simulation visuals
├── data/         # Game constants and content
├── economy/      # Day simulation / economy logic
├── i18n/         # Translations (en, es)
├── navigation/   # App navigation
├── screens/      # App screens (Stand, Shop, Recipe, Upgrades, Location...)
├── store/        # Zustand game store
├── theme/        # Typography and theming
├── types/        # Shared TypeScript types
└── utils/        # Helpers (money, temperature, etc.)
```

## License

MIT
