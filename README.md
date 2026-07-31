# MaPlace ReactNative/Expo app

Project created with ```pnpm dlx create-expo-app --template default@54```, then "reset" with ```pnpm run reset-project```

## Get started

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Start the app

   ```bash
   pnpm start
   ```

## Stack

- `expo-router` - file base route-navigation
- `nativewind` for similar to `Tailwind` styling (Note: this is for [v5](https://www.nativewind.dev/v5/getting-started/installation))
  - ```pnpm install nativewind@preview react-native-css@latest react-native-reanimated react-native-safe-area-context```
  - ```pnpm install --save-dev tailwindcss @tailwindcss/postcss postcss prettier-plugin-tailwindcss```
  - ```pnpm add --save-dev @babel/plugin-transform-react-jsx react-native-css-interop```
  - Create a `global.css` file
  - Update `postcss.config.mjs`
  - Update `metro.config.js`
- XXX
