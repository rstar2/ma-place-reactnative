# Map: callout Edit + tap-to-create (rev 1)

## Context

Map screen `app/(tabs)/map.tsx` uses a **custom callout overlay**, anchored via `pointForCoordinate`, with View + Go buttons. Goals:

1. Add **Edit** button to marker callout → View / Edit / Go. Opens existing add/edit sheet (`useManagePlace().onEditPlace`).
2. Tap empty map → "Add a place here?" callout at tapped coordinate → confirm opens the same `ModalAddEditPlace` sheet prefilled with that location. Pending pin shown at tap point.

Pre-existing bug found (blocks feature): `parseLocation` in `components/ModalAddEditPlace.tsx:30` assigns first number → `longitude`, but placeholder (`"42.6333 23.3833 (latitude longitude)"`) and edit-mode seeding are **lat-first** → coordinates transposed on every save.

## Decisions (user-confirmed)

- Edit button only for own places (`place.uid === user?.uid`)
- 2nd map tap while create-tooltip open → **moves pin**
- Place callout open + tap empty map → **dismiss first**; next tap opens tooltip
- **Latitude first** everywhere order is relevant → fix `parseLocation` mapping

## Phase A — Edit button (`map.tsx` only; lands first)

- Import `useManagePlace` from `@/lib/places`; `const { onAddPlace, onEditPlace } = useManagePlace();`
- In `.map-callout-actions` between View and Go:

```tsx
{
  selected.uid === user?.uid && (
    <Button
      className="p-1 flex-1"
      label="Edit"
      onPress={() => {
        posthog?.capture("map_marker_edit_tapped", { place_id: selected.id });
        dismissCallout();
        onEditPlace(selected);
      }}
    />
  );
}
```

## Phase B — tap-to-create

### B1. `lib/places.tsx` — carry initial location through provider

```ts
type InitialLocation = { latitude: number; longitude: number };
onAddPlace: (initialLocation?: InitialLocation) => void;  // optional → no-arg callers unaffected
```

- Provider state `addInitialLocation: InitialLocation | undefined`
- `onAddPlace(loc)` → `setAddInitialLocation(loc); setModalPlace(true);`
- Clear it on modal close AND in `handleSubmit` after `setModalPlace(null)` (stale coord would leak into next "+" add)
- Pass `initialLocation={modalPlace === true ? addInitialLocation : undefined}` to `ModalAddEditPlace`

### B2. `components/ModalAddEditPlace.tsx`

- New prop `initialLocation?: { latitude: number; longitude: number }`
- **Fix `parseLocation`** (pre-existing transposition): `latitude: match[1], longitude: match[2]`
- Reseed effect (add `initialLocation` to deps), add-mode branch:

```ts
setLocationText(
  isEdit
    ? `${place.location.latitude} ${place.location.longitude}`
    : initialLocation
      ? `${toGeoPointCoordinate(initialLocation.latitude)} ${toGeoPointCoordinate(initialLocation.longitude)}`
      : "",
);
```

- `NewPlaceInput` shape untouched (still string lat/lng via `parseLocation`)

### B3. `app/(tabs)/_layout.tsx:106` — one-line fix (required)

`onPress={onAddPlace}` → `onPress={() => onAddPlace()}` (otherwise `GestureResponderEvent` passed as `initialLocation`; also fails strict typing once signature widens)

### B4. `app/(tabs)/map.tsx` — unified selection state + map press

1. Replace `selected`/`selectedRef`/`selectPlace`/`dismissCallout` with discriminated union reusing the existing anchor/clamp/`calloutHeight` math:

```ts
type MapSelection =
  | { kind: "place"; place: Place }
  | { kind: "pending"; coordinate: { latitude: number; longitude: number } };
const [selection, setSelection] = useState<MapSelection | null>(null);
const selectionRef = useRef<MapSelection | null>(null);
const lastMarkerPressAtRef = useRef(0); // Android: MapView.onPress double-fires after marker press
```

- `coordOf(sel)` helper; `selectOnMap(sel)` = old `selectPlace` body + identity guard; `clearSelection()` = old `dismissCallout`; `updateAnchor()` reads `selectionRef.current` + identity guard
- Marker onPress: stamp `lastMarkerPressAtRef.current = Date.now()` then `selectOnMap({kind:"place", place})` (keep `map_marker_tapped` capture)
- Cluster onPress → `clearSelection()`

1. MapView `onPress` handler (replaces `onPress={dismissCallout}`), import `type LatLng`:

```ts
const handleMapPress = useCallback(
  (e: { nativeEvent: { coordinate: LatLng } }) => {
    if (Date.now() - lastMarkerPressAtRef.current < 300) return; // marker double-fire guard
    if (selectionRef.current?.kind === "place") {
      clearSelection();
      return;
    } // dismiss first
    posthog?.capture("map_background_tapped", {
      action: selectionRef.current?.kind === "pending" ? "move" : "create",
    });
    void selectOnMap({ kind: "pending", coordinate: e.nativeEvent.coordinate }); // pending open → moves pin
  },
  [clearSelection, selectOnMap],
);
```

1. Pending Marker (inside `<MapView>`, after clustered markers):

```tsx
{
  selection?.kind === "pending" && (
    <Marker
      coordinate={selection.coordinate}
      onPress={() => {
        lastMarkerPressAtRef.current =
          Date.now(); /* tooltip already open: no-op */
      }}
    >
      <View className="map-pin map-pin-pending">
        <Image source={icons.plus} className="map-pin-icon" tintColor="#fff" />
      </View>
    </Marker>
  );
}
```

1. Overlay content split by kind inside existing positioned `.map-callout` View:
   - `place` → PlaceCard + actions View / Edit (mine only) / Go (unchanged, `selected` → `selection.place`)
   - `pending` →

```tsx
<Text className="map-callout-pending-title">Add a place here?</Text>
<Text className="map-callout-pending-coords" numberOfLines={1}>
  {toGeoPointCoordinate(selection.coordinate.latitude)} {toGeoPointCoordinate(selection.coordinate.longitude)}
</Text>
<View className="map-callout-actions">
  <Button className="button-secondary p-1 flex-1" classNameLabel="button-secondary-text"
    label="Cancel" onPress={clearSelection} />
  <Button className="p-1 flex-1" label="Create Place" onPress={confirmPendingPlace} />
</View>
```

- `confirmPendingPlace`: guard `selectionRef.current?.kind === "pending"` → capture `map_create_place_here_tapped`, `clearSelection()`, `onAddPlace(coordinate)`

1. Overlay `top`: wrap with `Math.max(..., insets.top + 8)` — tap near top edge otherwise pushes tooltip offscreen

### B5. `assets/global.css` — new component classes (after `.map-pin`/`.map-callout` in `@layer components`; later rule wins over `.map-pin`'s `border-white`)

```css
.map-pin-pending {
  @apply border-dashed border-accent bg-accent/25;
}
.map-callout-pending-title {
  @apply px-1 text-base font-sans-bold text-primary;
}
.map-callout-pending-coords {
  @apply px-1 text-sm font-sans-medium text-muted-foreground;
}
```

Tokens verified: `--color-accent`, `--color-muted-foreground`, `button-secondary`, `font-sans-bold/medium`, `icons.plus` all exist.

## PostHog events

- `map_marker_edit_tapped` `{ place_id }`
- `map_background_tapped` `{ action: "create" | "move" }`
- `map_create_place_here_tapped`

## Files

| File                               | Change                                                            |
| ---------------------------------- | ----------------------------------------------------------------- |
| `app/(tabs)/map.tsx`               | Edit button, selection union, map press, pending marker + tooltip |
| `lib/places.tsx`                   | `onAddPlace(initialLocation?)` + provider plumbing                |
| `components/ModalAddEditPlace.tsx` | `initialLocation` prop, parseLocation fix                         |
| `app/(tabs)/_layout.tsx`           | 1-line onPress fix                                                |
| `assets/global.css`                | 3 new classes                                                     |

Order: Phase A (shippable) → B1+B2+B3 (plumbing, no UI change) → B4+B5.

## Verification (no test runner in repo)

`npx tsc --noEmit` + `pnpm lint` after each phase (1 pre-existing Modal.tsx lint warning — leave it).

Manual (`pnpm android`), own + other-user place:

1. Own pin → View/Edit/Go; other-user pin → View/Go only
2. Edit → "Edit Place" prefilled; save → toast; place NOT moved (parseLocation fix works)
3. Empty tap → dashed pin + tooltip anchored above tap; pan map → tooltip stays glued
4. 2nd empty tap → pin moves, tooltip re-anchors
5. Place callout open + empty tap → dismisses only
6. Create Place → "Add Place" modal, location prefilled **lat-first**, Add enabled once title+description filled; submit → toast + new pin exactly at tapped spot (verify not swapped!)
7. Cancel → pin + tooltip gone
8. Regression: tab-bar "+" and Home header "+" → blank location (no stale coord); cluster tap clears pending; `/map?place=<id>` focus flow; View/Go navigate

## Risks

- Android marker/map onPress double-fire → 300ms ref guard; test marker, cluster, pending-pin taps on Android specifically
- Stale `addInitialLocation` → cleared on both close and submit
- `pointForCoordinate` async race → identity guard on `selectionRef.current === sel` (same pattern as existing id check)
- react-compiler ON → keep `useCallback` pattern, no ref writes during render
- Existing places already saved with swapped coords stay wrong — separate cleanup, out of scope
