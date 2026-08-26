# Place Details screen (`app/place/[id].tsx`)

## Context

`app/place/[id].tsx` is a stub ("Place Details: {id}"). Route already pushed from map callout "View" button (`router.push(\`/place/${id}\`)`), renders in root Stack, global `headerShown: false`→ screen needs own back affordance. Goal: read-only view mirroring `ModalAddEditPlace `field layout (Title, Description, Location, Tags — no inputs), + image carousel below data. User-confirmed extras: MiniMap preview + "Show on map" button; NO meta rows. Carousel lib:` react-native-reanimated-carousel` v5 (pure JS, peers already installed: reanimated ~4.1.1, worklets 0.5.1, gesture-handler ~2.28).

## Decisions

- Back = pinned header row above ScrollView (NOT absolute overlay — ScreenBase SafeAreaView already handles insets): `Pressable` with `map-title-chip` class + `icons.back` (`constants/icons.ts`, exists) + `router.back()`. Same visual language as map.tsx chip.
- Show on map = secondary `Button` (`button-secondary`/`button-secondary-text`) doing `router.push({ pathname: "/map", params: { place: id } })` — same push `PlaceShowOnMap` (components/PlaceCard.tsx:155) makes; icon-only component not reused (wrong presentation here, leave untouched).
- Tags = read-only chips reusing `.multi-select-chip` + `.multi-select-chip-text` (pure presentation classes; ✕ lives in MultiSelect, not CSS) + new wrapper `.place-details-tags`.
- Carousel width = `useWindowDimensions().width - 40` (ScreenBase `p-5`), height = width × 3/4 (matches `.place-image-preview` aspect-4/3).
- Data: `usePlacesStore` — `ensurePlacesLoaded()` in `useFocusEffect` (repo pattern), `places.find(p => p.id === id)`. No store changes.
- Images: `placeImageUrls(place)` helper filters non-http uris (`url` is literal `"todo"` for all current data → carousel section hidden until real URLs exist). Designed as the ONLY change point when `images: string[]` arrives.

## Steps

### 1. Install

`pnpm expo install react-native-reanimated-carousel` (v5.1.1). Pure JS — no config plugin, no native rebuild, no babel change.

### 2. `assets/global.css` — append `.place-details-*` to `@layer components`

```css
.place-details-header {
  @apply mb-4 flex-row items-center justify-between;
}
.place-details-state {
  @apply flex-1 items-center justify-center gap-4;
}
.place-details-title {
  @apply text-xl font-sans-bold text-primary;
}
.place-details-text {
  @apply text-base font-sans-medium text-foreground;
}
.place-details-tags {
  @apply flex-row flex-wrap gap-2;
}
.place-details-carousel {
  @apply overflow-hidden rounded-2xl border border-border bg-muted;
}
.place-details-dots {
  @apply flex-row justify-center gap-2 pt-3;
}
.place-details-dot {
  @apply size-2 rounded-full bg-primary/20;
}
/* after .place-details-dot so it wins */
.place-details-dot-active {
  @apply bg-accent;
}
.place-details-notfound {
  @apply text-center text-base font-sans-medium text-muted-foreground;
}
```

### 3. New `components/PlaceImageCarousel.tsx`

- Export `placeImageUrls(place: Pick<Place,"url">): string[]` — `[url].filter(/^https?:\/\//)` with doc comment: future array swap point.
- Default export `PlaceImageCarousel({ images }: { images: string[] })`:
  - `useState(0)` activeIndex; `onProgressChange` handler rounds progress, guarded setState (`prev === next ? prev : next`) — fires every frame.
  - `if (images.length === 0) return null` AFTER hooks.
  - RNRC v5: sizing via `style={{width, height}}` (NOT v4 width/height props), `loop={false}`, `defaultIndex={0}`, `key={carouselWidth}` (rotation remount). **Verify installed `.d.ts` for exact `onProgressChange` signature** — v5 is `(progress: number) => void`; older two-arg form → use `absoluteProgress` arg.
  - Items: expo-image `Image`, `contentFit="cover"`, `transition={200}`, `recyclingKey={item}`, `style={{ flex: 1 }}` (fallback if zero-size: explicit width/height).
  - NO `className` on `Carousel` (NativeWind v5 can't style 3rd-party native comps — MapView gotcha); wrapper `View` carries `.place-details-carousel`.
  - Custom dots (RNRC built-in `Pagination.*` broken on SDK 54, gh#854), only when `count > 1`: `.place-details-dots` + `cn("place-details-dot", active && "place-details-dot-active")`.

### 4. Rewrite `app/place/[id].tsx`

Structure:


```
ScreenBase
├─ header: Back chip (Pressable map-title-chip + icons.back size-6 + Text map-title "Back")
└─ place ? ScrollView(flex-1, contentContainerClassName="gap-5 pb-10")
   ├─ Title:      .input-label + .place-details-title
   ├─ Description: .input-label + .place-details-text
   ├─ Location:    .input-label + coords text (`${lat} ${lng}`)
   │               + MiniMap (memoized region {lat, lng, deltas 0.01})
   │               + Button "Show on map" → push /map?place=id
   ├─ Tags (if any): .input-label + .place-details-tags + multi-select-chip views
   └─ Images (if any): .input-label "Image" + PlaceImageCarousel
   : isLoading || places.length===0 ? spinner (.place-details-state + ActivityIndicator)
   : error ? "Couldn't load" + Try again (refreshPlaces)
   : "Place not found. It may have been deleted." + Go back
```

Details:

- `useLocalSearchParams<{id:string}>`; normalize `Array.isArray(id) ? id[0] : id` (runtime can be string[]).
- `place = useMemo(() => places.find(...), [places, id])`.
- Spinner condition `isLoading || places.length === 0` avoids 1-frame "not found" flash before focus-effect load starts.
- MiniMap `region` memoized (new object each render would re-fire MapView camera). GeoPoint is NOT a Region — build `{latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01}` (map.tsx's focus deltas).
- No changes to layouts, PlaceCard, store, MiniMap.

## Gotchas

- RNRC v5 ≠ v4 API (style vs width/height props, `onSnapToItem` not `onScrollEnd`) — don't copy v4 examples.
- All current places have `url: "todo"` → carousel hidden is EXPECTED, not a bug.
- expo-image needs explicit dims → carousel style provides them.

## Verification

1. `pnpm lint` + `pnpm exec tsc --noEmit`.
2. `pnpm start` — Metro only.
3. Manual: Map → marker → callout View → screen shows fields + MiniMap centered; Back works; Show on map focuses map on place.
4. Carousel test: temporarily hardcode a Cloudinary URL in `placeImageUrls` (or fix one Firestore doc) → swipe, dots track drag live, single image = no dots.
5. States: airplane-mode reload → error + Try again; bogus id → not-found.

## Unresolved questions

1. PostHog events (`place_details_opened`, `place_details_show_on_map_tapped`) — repo convention on map/place screens, dropped from plan to stay scoped. Add?
