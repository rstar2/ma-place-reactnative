import type { ExpoConfig } from "expo/config";

// The Maps API keys are NOT EXPO_PUBLIC_ vars on purpose: they must never be
// inlined into the JS bundle. Expo CLI loads .env before evaluating this file
// and the values get baked into the native projects by `expo prebuild`
// (AndroidManifest meta-data / iOS GMSServices provideAPIKey).
const GOOGLE_MAPS_ANDROID_API_KEY =
  process.env.GOOGLE_MAPS_ANDROID_API_KEY ?? "";
const GOOGLE_MAPS_IOS_API_KEY = process.env.GOOGLE_MAPS_IOS_API_KEY ?? "";

const config: ExpoConfig = {
  name: "ma-place",
  slug: "ma-place",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "maplace",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    icon: "./assets/app-icon.icon",
    supportsTablet: true,
    bundleIdentifier: "com.magicmedia.maplace",
    googleServicesFile: "./GoogleService-Info.plist",
    config: {
      googleMapsApiKey: GOOGLE_MAPS_IOS_API_KEY,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#182D45",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.magicmedia.maplace",
    googleServicesFile: "./google-services.json",
    config: {
      googleMaps: {
        apiKey: GOOGLE_MAPS_ANDROID_API_KEY,
      },
    },
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
    bundler: "metro",
  },
  plugins: [
    "expo-router",
    "@react-native-firebase/app",
    "@react-native-firebase/auth",
    "@react-native-google-signin/google-signin",
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
        },
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission: "Allow ma-place to access your photos",
        cameraPermission: "Allow ma-place to take a photo",
        microphonePermission: false,
      },
    ],
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Allow ma-place to show your location on the map",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
