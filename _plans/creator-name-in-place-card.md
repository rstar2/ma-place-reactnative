# Creator name in PlaceCard (instead of raw uid)

## Context

PlaceCard's expanded "By:" row shows `place.uid` (raw Firestore auth uid). Users' names live in the `users` Firestore collection (doc id = uid, fields `{ name, service }`, written on every sign-up via `createUserProfile` in `lib/auth.tsx`). Firestore has **no joins**, so names must be resolved with follow-up reads.

**Fetch approach** (the clarified point): after `loadPlaces()` gets the places, collect unique creator uids → one batched query per ≤30 uids: `query(usersRef, where(documentId(), "in", chunk))`, `Promise.all` across chunks → uid→name map → attach `creatorName` to each place. Strictly additive: wrapped in try/catch, on failure cards degrade to "Unknown". Costs 1 extra query per app load (realistically single chunk).

**UX decisions (user-confirmed):**

- Creator is current user → show **"Me"** (current uid passed as prop; parents know it via `useAuth()`).
- No user doc / empty name → **"Unknown"** (defensive only — no legacy accounts exist).

## Changes

### 1. `lib/types.ts`

- `Place`: add after `color` (mirrors icon/color doc style — client-side derived, never persisted):

  ```ts
  /** Creator's display name, resolved client-side from the `users` collection (Firestore has no joins). */
  creatorName?: string;
  ```

- `NewPlaceInput` `Omit` list: add `"creatorName"`.

### 2. `lib/db.ts`

- Extend modular import: `documentId`, `getDoc`, `where` (verified exported by installed `@react-native-firebase/firestore@26.2.0`).
- `PlaceDoc` (line 33): add `"creatorName"` to `Omit`.
- New helper after `loadTags` (~line 56):

  ```ts
  /** Firestore `in` filter accepts at most 30 values per query. */
  const USER_NAMES_CHUNK = 30;

  /** Resolve creator uids → display names from `users` (doc id = uid). Only uids with a non-empty `name`. */
  export async function loadUserNames(
    uids: string[],
  ): Promise<Record<string, string>> {
    const unique = [...new Set(uids.filter(Boolean))];
    if (unique.length === 0) return {};
    const chunks: string[][] = [];
    for (let i = 0; i < unique.length; i += USER_NAMES_CHUNK)
      chunks.push(unique.slice(i, i + USER_NAMES_CHUNK));
    const snapshots = await Promise.all(
      chunks.map((chunk) =>
        getDocs(query(usersRef, where(documentId(), "in", chunk))),
      ),
    );
    const names: Record<string, string> = {};
    for (const snapshot of snapshots)
      for (const docSnap of snapshot.docs) {
        const name = (docSnap.data() as { name?: string }).name;
        if (name) names[docSnap.id] = name;
      }
    return names;
  }
  ```

- `loadPlaces` (58–76): after mapping snapshot → places, best-effort enrich:
  
  ```ts
  try {
    const names = await loadUserNames(places.map((p) => p.uid));
    return places.map((p) =>
      names[p.uid] ? { ...p, creatorName: names[p.uid] } : p,
    );
  } catch (err) {
    console.warn("Failed to load creator names:", err);
    return places;
  }
  ```

- `addPlace` (99–136): attach current user's name to the returned `Place` so the new card is correct without reload — private helper:
  
  ```ts
  /** Best-effort display name for the signed-in user. */
  async function currentUserName(uid: string): Promise<string | undefined> {
    try {
      const snap = await getDoc(doc(usersRef, uid));
      return (snap.data() as { name?: string } | undefined)?.name;
    } catch {
      /* fall through */
    }
    return auth.getAuth().currentUser?.displayName ?? undefined;
  }
  ```

  then `const created = decoratePlace({...}, place.id); created.creatorName = await currentUserName(uid); return created;`
- `updatePlace`: no change — `{ ...existing, ...placeInput }` spread keeps `creatorName`.

### 3. `components/PlaceCard.tsx`

- Props: add `currentUid?: string;` destructure it and `creatorName`.
- "By:" row (117–126): `{uid}` →
  
  ```tsx
  {
    uid === currentUid ? "Me" : (creatorName ?? "Unknown");
  }
  ```

### 4. Parents — pass `currentUid={user?.uid}`

- `app/(tabs)/index.tsx` — both render sites: `Index` (has `user`, line 37) and `Header` (has `user`, line 142; card at 193).
- `app/(tabs)/place/index.tsx` — does NOT use `useAuth()` yet → add import + `const { user } = useAuth();`, pass at card (line 88).
- `app/(tabs)/map.tsx` — same: add `useAuth`, pass to callout card (line 275). NB: callout card is never `expanded`, so "By:" row not visible there — wiring kept for consistency/future.

No store changes (`store/places-store.ts` untouched — enrichment lives in db layer, single choke point for `ensurePlacesLoaded`/`refreshPlaces`).

## Verification

1. `npx tsc --noEmit`, `pnpm lint`.
2. Home → expand own card → "By: Me"; another account's card → their name.
3. Create place → new card shows "Me" immediately (no reload).
4. Edit place → name preserved.
5. Places tab + map callout → no regressions.
6. (Console) place with fake creator uid, no users doc → "Unknown", no crash.

## Unresolved questions

None.
