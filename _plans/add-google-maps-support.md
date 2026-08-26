# Clustered Google Maps Screen (rev 2 — implemented)

## Context

All places as clustered markers on Google Maps (Android + iOS). Browser JS libs (`@google/markerclusterer`, `@googlemaps/js-api-loader`) unusable in RN (no DOM). `expo-maps` rejected: alpha, no clustering, Apple-Maps-only on iOS. Choice: **react-native-maps 1.20.1** (SDK 54 pin — predates 1.26.x Android marker regression) + **react-native-clusterer 5.0.2** (Nitro/JSI supercluster, `useClusterer`).

## Decisions (user-confirmed)

- Map surfaces:
  1. `/(tabs)/map` — full-screen clustered map ✅
  2. Home `/(tabs)/index` — "Map" card = mini-map w/ current user location, tap → map tab ✅
  3. `/(tabs)/place/[id]` — small card w/ place location — **LATER** (reuse `MiniMap`)
- Clustering = react-native-clusterer; Google Maps Android + iOS
- Marker tap → `router.push` `/place/[id]` (stub exists)
- API keys in `.env` → `app.config.ts` REPLACED `app.json`
- Tab icon: copy of `activity.png` → `map.png` (stopgap)
- PostHog: `map_opened`, `map_marker_tapped`

## Implemented

- Deps: react-native-maps 1.20.1, expo-location 19.0.8, react-native-clusterer 5.0.2, react-native-nitro-modules 0.37.0, @types/react-native-maps
- `app.config.ts` (new, replaces `app.json`): keys via `process.env.GOOGLE_MAPS_ANDROID_API_KEY` / `GOOGLE_MAPS_IOS_API_KEY` (Expo CLI loads .env before evaluating config); expo-location plugin w/ `locationWhenInUsePermission`
- `.env`: fixed `GOOGLE_MAPS_ANDORID_API_KEY` → `GOOGLE_MAPS_ANDROID_API_KEY`; `.env.example` updated
- `assets/icons/map.png` + `constants/icons.ts` + tab entry in `app/(tabs)/_layout.tsx` (order: Home/Places/Map/Add/Settings)
- `assets/global.css`: `.map-*`, `.mini-map`, `.map-status-wrap/-text` in `@layer components`
- `components/MiniMap.tsx`: non-interactive MapView (all gestures off, `pointerEvents="none"` so taps hit the wrapping Pressable) + `useUserLocation()` (deduped permission+position request, module-scope promise, retries after denial) + exported `DEFAULT_REGION`
- `app/(tabs)/map.tsx`: `useFocusEffect` → `ensurePlacesLoaded` + `map_opened`; GeoJSON points memo → `useClusterer(points, {width,height}, region)`; epsilon-guarded `onRegionChangeComplete`; one-time `fitToCoordinates` (bottom padding = floating tab bar); cluster markers w/ `point_count_abbreviated` + `getExpansionRegion`; place pins w/ `place.color`/`place.icon` → `map_marker_tapped` + push to `/place/[id]`; loading/"No places yet" chips
- Home `app/(tabs)/index.tsx`: map card → `Pressable` + `<MiniMap region showsUserLocation>` → `router.navigate("/(tabs)/map")`
- `npx expo prebuild --clean` ✅ — verified: Android manifest `com.google.android.geo.API_KEY` + ACCESS_FINE/COARSE_LOCATION; iOS `GMSApiKey` in Info.plist, `GMSServices.provideAPIKey` in AppDelegate, NSLocation* descriptions
- `npx tsc --noEmit` ✅, `pnpm lint` ✅ (0 errors; pre-existing Modal.tsx unused-var warning untouched)

## Remaining (user)

1. **Google Cloud Console**: restrict Android key → package `com.magicmedia.maplace` + debug SHA-1 (`pnpm android:fingerprint`); iOS key → bundle id. Missing SHA-1 ⇒ beige/blank Android map.
2. **Rebuild** (native code: GoogleMaps pod, Nitro C++, expo-location — `expo start` alone won't pick up):
   ```bash
   pnpm android    # expo run:android --device
   pnpm ios        # CocoaPods install skipped on Linux; run on macOS
   ```

## Manual test flow

tiles render (beige = SHA-1) → location permission prompt on Home → mini-map w/ user dot → tap card → map tab → clusters at world zoom → cluster tap zooms → pin tap → correct id in details stub → empty state chip → cached revisit (no flicker)

## Risks / notes

- iOS `useFrameworks: static` + GoogleMaps pod — first suspect if iOS build fails
- Nitro pre-1.0 C++ build — pin nitro to clusterer's peer range if it breaks
- Keys land in committed android/ ios/ after prebuild — OK for Maps keys restricted by package/bundle + SHA-1
- Future: user-location dot on full map; `MiniMap` + marker for place-details card
