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

## Build and Deploy

Using `EAS` for building

- Create a project either from the web dashboard or with `eas build:configure` - set the proper project ID into `app.config.ts` - into the `extra.eas.projectId` prop
- Link the icon , so it's visible in the web dashboard `eas init --id 9a212cf2-858d-4ded-ba8a-63af9056ed8`

### Locally

With ```pnpm build:android:local``` (e.g.`expo build --local`) which will build a production APK locally
  
**Note**: for this the used environment variables, e.g. the `.env` file must be **allowed**, so because they are in `.gitignore` and `eas` ignores them this `.env` file MUST be explicitly allowed in the `.easignore`

**Note**:`EAS` builds locally in the temp folder (`/tmp` in Linux by default) which in my case is backed by RAM, not a real disk space, and it possible `Java Gradle` to fail with not enough memory, like (*java.io.IOException: Disk quota exceeded*). So my solution is the `EAS_LOCAL_BUILD_WORKINGDIR` en variable like so `export EAS_LOCAL_BUILD_WORKINGDIR="$HOME/.eas-local-builds"` in `.profile`.

### In the cloud

This `--local` will not work in plain `expo build` run. The environment variables must be set either in the dashboard or 

## TODO

- ? On `deletePlace` can also delete the image from `Cloudinatsry`
- Use `expo-constants` and move `env.ts` props there
- Loading/disabled state for some action buttons
- Offline support - discuss with AI and `/grill-me` , should use the native SQLite support
