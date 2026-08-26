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
- Firebase `@react-native-firebase/app` - only working with `development build`
  - auth - `@react-native-firebase/auth` and `@react-native-google-signin/google-signin`.  Note that the Firebase Android app has to be with generate a SHA-fingerprint in order the Google sign-in method to work. One can be generated with `./android/gradlew signingReport` and added to the Firebase Android app [generate](https://developers.google.com/android/guides/client-auth)
- Google maps

## SplashScreen + app icons

> Used `snapai` to generate them for me. There's a skill `app-icon` installed for calling it. Used the Google's `banana` model.

## TODO

- ? On `deletePlace` can also delete the image from `Cloudinary`
- Offline support - discuss/grill-me (native SQLite maybe)
