import {
  getFirestore,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  GeoPoint,
  Timestamp,
} from "@react-native-firebase/firestore";
import { getFunctions, httpsCallable } from "@react-native-firebase/functions";
import * as auth from "@react-native-firebase/auth";

import type { NewPlaceInput, Place } from "./types";
import { icons } from "@/constants/icons";
import { theme } from "@/constants/theme";

/** Firestore database instance. */
const db = getFirestore();

const usersRef = collection(db, "users");
const tagsRef = collection(db, "tags");
const placesRef = collection(db, "places");

/**
 * A place as stored in Firestore - the client-only derived fields
 * (`icon`, `color`) and the doc `id` are excluded.
 */
export type PlaceDoc = Omit<Place, "id" | "icon" | "color">;

/**
 * Mirror a newly registered auth account into Firestore under the same UID.
 * Non-fatal: auth already succeeded, so a Firestore failure (e.g. security
 * rules) must not surface as a failed sign-up/sign-in.
 */
export async function createUserProfile(
  uid: string,
  data: { name: string; service: "password" | "Google" },
): Promise<void> {
  try {
    await setDoc(doc(usersRef, uid), data);
  } catch (err) {
    console.warn("Failed to create Firestore user profile:", err);
  }
}

export async function loadTags(): Promise<string[]> {
  const snapshot = await getDocs(tagsRef);
  // the tags are stored just as empty documents - e.g. no data-fields in them
  // and with predefined IDs
  return snapshot.docs.map((docSnap) => docSnap.id);
}

export async function loadPlaces(count = -1): Promise<Place[]> {
  const q = query(
    placesRef,
    orderBy("createdAt", "desc"),
    orderBy("title"),
    // fetch all when count is negative
    ...(count > 0 ? [limit(count)] : []),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as PlaceDoc & {
      createdAt?: Timestamp | Date | null;
    };
    return decoratePlace(
      { ...data, createdAt: toDate(data.createdAt) },
      docSnap.id,
    );
  });
}
/**
 * Place doc as returned by `dbAddPlaceApp`: the stored doc shape, i.e. `url`
 * instead of `imageUrl`, a plain lat/lng `location` (not a GeoPoint) and
 * `createdAt` as epoch millis.
 */
type AddPlaceResult = Omit<PlaceDoc, "createdAt" | "location" | "imageUrl"> & {
  id: string;
  createdAt: number;
  location: { latitude: number; longitude: number };
  url?: string;
};

/**
 * Callable that persists a place server-side (validates auth + location).
 * NewPlaceInput - the payload of the `dbAddPlaceApp` callable - the backend's shape.
 *
 */
const dbAddPlaceCallable = httpsCallable<NewPlaceInput, AddPlaceResult>(
  getFunctions(),
  "dbAddPlaceApp",
);

export async function addPlace(placeInput: NewPlaceInput): Promise<Place> {
  const uid = auth.getAuth().currentUser?.uid;
  if (!uid) throw new Error("You must be signed in to add a place.");

  const data = { ...placeInput, uid };

  // 1. Use the client Firebase Firestore API - this could be disabled in the Firestore rules
  // so that only Firebase Functions should be used
  // const ref = await addDoc(placesRef, data);
  // return decoratePlace(data, ref.id);

  // 2. Use the Firebase HTTPS function (e.g. using normal fetch/axios)
  // return fetch('https://us-central1-ma-place.cloudfunctions.net/dbAddPlaceWeb', {
  //   method: 'POST',
  //   headers: {
  //     // NOTE: this is obligatory for JSON encoded data so that the Express 'body-parser' to parse it properly
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(data)
  // }).then(res => res.json());

  // 3. Use the Firebase Callable function
  const { data: place } = await dbAddPlaceCallable(data);

  return decoratePlace(
    {
      createdAt: toDate(place.createdAt),
      uid: place.uid,
      title: place.title,
      description: place.description,
      location: new GeoPoint(place.location.latitude, place.location.longitude),
      tags: place.tags,
      imageUrl: place.url ?? "",
      meta: place.meta,
    },
    place.id,
  );
}

/**
 * Persists an edited place and returns the updated `Place` by merging
 * `placeInput` into `existing` locally - `updates` carries no
 * server-generated fields, so no follow-up `getDoc` is needed.
 */
export async function updatePlace(
  existing: Place,
  placeInput: NewPlaceInput,
): Promise<Place> {
  // `icon`/`color` are derived locally - never persist them
  // pass only "valid" fields - cannot pass 'undefined' (and 'null' is a valid value)
  const location = new GeoPoint(
    +placeInput.location.latitude,
    +placeInput.location.longitude,
  );
  const updates = Object.fromEntries(
    Object.entries(placeInput)
      .filter(([, value]) => value !== undefined)
      .map((entry) =>
        entry[0] === "location" ? (["location", location] as const) : entry,
      ),
  );
  await updateDoc(doc(placesRef, existing.id), updates);

  return decoratePlace({ ...existing, ...placeInput, location }, existing.id);
}

export async function deletePlace(placeId: string): Promise<void> {
  return await deleteDoc(doc(placesRef, placeId));
}

/** Icons/colors used to decorate places locally (never persisted). */
const PLACE_ICONS = [
  // TODO: create proper icons per tag
  icons.home,
  icons.wallet,
  icons.activity,
  icons.medium,
  icons.spotify,
  icons.figma,
  icons.github,
  icons.dropbox,
];
const PLACE_COLORS = Object.values(theme.colors.tag);

/** Stable string hash → items index, so a place always decorates the same. */
function pick<T>(items: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return items[hash % items.length];
}

/** Fill in the client-only `icon`/`color` of a place, derived from its tags. */
function decoratePlace(data: PlaceDoc, id: string): Place {
  const seed = data.tags?.[0] ?? id;
  return {
    ...data,
    id,
    icon: pick(PLACE_ICONS, seed),
    color: pick(PLACE_COLORS, seed),
  };
}

function toDate(value: Timestamp | Date | number): Date {
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  return new Date(value);
}
