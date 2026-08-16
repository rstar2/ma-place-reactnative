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
} from "@react-native-firebase/firestore";
import { Place } from "./types";

/** Firestore database instance. */
const db = getFirestore();

const usersRef = collection(db, "users");
const tagsRef = collection(db, "tags");
const placesRef = collection(db, "places");

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
  return snapshot.docs.map((docSnap) => ({
    ...docSnap.data(),
    id: docSnap.id,
  })) as Place[];
}

export async function addPlace() {}

export async function updatePlace(place: Place) {
  const { id, ...fields } = place;
  // pass only "valid" fields - cannot pass 'undefined' (and 'null' is a valid value)
  const updates = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  );
  return await updateDoc(doc(placesRef, id), updates);
}

export async function deletePlace(placeId: string): Promise<void> {
  return await deleteDoc(doc(placesRef, placeId));
}