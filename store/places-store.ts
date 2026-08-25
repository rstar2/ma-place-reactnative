import { create } from "zustand";
import { getAuth } from "@react-native-firebase/auth";

import {
  addPlace as addPlaceDoc,
  deletePlace as deletePlaceDoc,
  loadPlaces,
  loadTags,
  updatePlace as updatePlaceDoc,
} from "@/lib/db";
import type { Place, NewPlaceInput, NewPlace } from "@/lib/types";
import { uploadImage } from "@/lib/claudinary";

type PlacesStore = {
  places: Place[];
  tags: string[];
  /** True while the initial places fetch is in flight. */
  isLoadingPlaces: boolean;
  isLoadingTags: boolean;
  /** Last places load error message (reset when a load starts). */
  error: string | null;

  /**
   * Loads the places on demand, exactly once: concurrent callers share the
   * in-flight request and once it has settled later calls resolve from the
   * cache - moving between the Home and Places screens never triggers a
   * second DB call. After a failure the promise is released so the next
   * screen focus retries.
   */
  ensurePlacesLoaded: () => Promise<void>;
  /** Same as `ensurePlacesLoaded`, for the tags collection. */
  ensureTagsLoaded: () => Promise<void>;
  /** Forces a places re-fetch, bypassing the cache. */
  refreshPlaces: () => Promise<void>;
  /** Persists a new place and prepends it to the cached list. */
  addPlace: (input: NewPlaceInput) => Promise<void>;
  /** Persists an edited place and updates it in the cached list. */
  editPlace: (id: string, input: NewPlaceInput) => Promise<void>;
  /** Deletes a place and removes it from the cached list. */
  deletePlace: (placeId: string) => Promise<void>;
};

// In-flight promises live OUTSIDE the store state: they are not UI data and
// putting them in state would break the dedupe identity on every set().
let placesRequest: Promise<void> | null = null;
let tagsRequest: Promise<void> | null = null;

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** Cloudinary context meta shared by the add and edit flows. */
function toUploadMeta(
  uid: string,
  input: Omit<NewPlaceInput, "imageUploadData">,
) {
  return {
    uid,
    title: input.title,
    description: input.description,
    tags: input.tags ?? [],
    // NewPlace keeps the coords as strings — Cloudinary wants numbers
    location: {
      latitude: Number(input.location.latitude),
      longitude: Number(input.location.longitude),
    },
  };
}

export const usePlacesStore = create<PlacesStore>()((set, get) => ({
  places: [],
  tags: [],
  isLoadingPlaces: false,
  isLoadingTags: false,
  error: null,

  ensurePlacesLoaded: () => {
    if (placesRequest) return placesRequest;

    set({ isLoadingPlaces: true, error: null });
    // Errors are swallowed into `error` state so callers can fire-and-forget.
    placesRequest = loadPlaces()
      .then((places) => {
        set({ places, isLoadingPlaces: false });
      })
      .catch((err: unknown) => {
        placesRequest = null; // allow a retry on the next screen focus
        set({ isLoadingPlaces: false, error: toErrorMessage(err) });
      });

    return placesRequest;
  },

  ensureTagsLoaded: () => {
    if (tagsRequest) return tagsRequest;

    set({ isLoadingTags: true });
    tagsRequest = loadTags()
      .then((tags) => {
        set({ tags, isLoadingTags: false });
      })
      .catch((err: unknown) => {
        tagsRequest = null;
        set({ isLoadingTags: false });
      });

    return tagsRequest;
  },

  refreshPlaces: () => {
    placesRequest = null;
    return get().ensurePlacesLoaded();
  },

  addPlace: async (input) => {
    // split off the upload payload so the persisted object never carries it
    const { imageUploadData, ...placeInput } = input;

    // same uid resolution as db.addPlace — the Cloudinary context tags
    // the asset with its creator
    const uid = getAuth().currentUser?.uid;
    if (!uid) throw new Error("You must be signed in to add a place.");

    let newPlace: NewPlace = { uid, ...placeInput };

    // upload to Cloudinary first
    if (imageUploadData) {
      const { url, cloudinaryId } = await uploadImage(
        imageUploadData,
        toUploadMeta(uid, placeInput),
      );

      newPlace = {
        ...placeInput,
        uid,
        url,
        meta: {
          cloudinaryId,
        },
      };
    }

    const place = await addPlaceDoc(newPlace);

    // the list is ordered by createdAt desc → the new place goes on top
    set({ places: [place, ...get().places] });
  },

  editPlace: async (id, input) => {
    const existing = get().places.find((p) => p.id === id);
    if (!existing) throw new Error(`Place ${id} not found in the cache.`);

    // split off the upload payload so the persisted object never carries it
    const { imageUploadData, ...placeInput } = input;

    // the owner never changes on edit — keep the existing place's uid
    let updated: NewPlace = { uid: existing.uid, ...placeInput };

    // upload a newly picked image first
    if (imageUploadData) {
      const { url, cloudinaryId } = await uploadImage(
        imageUploadData,
        toUploadMeta(existing.uid, placeInput),
      );

      updated = {
        ...placeInput,
        uid: existing.uid,
        url,
        meta: { cloudinaryId },
      };
    }

    const place = await updatePlaceDoc(existing, updated);
    set({
      places: get().places.map((p) => (p.id === place.id ? place : p)),
    });
  },

  deletePlace: async (placeId) => {
    await deletePlaceDoc(placeId);
    set({ places: get().places.filter((p) => p.id !== placeId) });
  },
}));
