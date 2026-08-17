import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "@react-native-firebase/firestore";
import { Place } from "./types";
import { icons } from "@/constants/icons";

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

export async function addPlace(data: PlaceDoc): Promise<Place> {
  const ref = await addDoc(placesRef, data);
  return decoratePlace(data, ref.id);
}

export async function updatePlace(place: Place) {
  // `icon`/`color` are derived locally - never persist them
  const { id, icon: _icon, color: _color, ...fields } = place;
  // pass only "valid" fields - cannot pass 'undefined' (and 'null' is a valid value)
  const updates = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  );
  return await updateDoc(doc(placesRef, id), updates);
}

export async function deletePlace(placeId: string): Promise<void> {
  return await deleteDoc(doc(placesRef, placeId));
}

/** Icons/colors used to decorate places locally (never persisted). */
const PLACE_ICONS = [
  icons.home,
  icons.wallet,
  icons.activity,
  icons.medium,
  icons.spotify,
  icons.figma,
  icons.github,
  icons.dropbox,
];
const PLACE_COLORS = [
  "#f5c542",
  "#b8e8d0",
  "#e8def8",
  "#b8d4e3",
  "#f8c8b8",
  "#c8d9f8",
];

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
