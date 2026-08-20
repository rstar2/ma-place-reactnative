import { create } from "zustand";

import {
  addPlace as addPlaceDoc,
  deletePlace as deletePlaceDoc,
  loadPlaces,
  loadTags,
  updatePlace as updatePlaceDoc,
} from "@/lib/db";
import type { Place, NewPlaceInput } from "@/lib/types";

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
    const place = await addPlaceDoc(input);

    // the list is ordered by createdAt desc → the new place goes on top
    set({ places: [place, ...get().places] });
  },

  editPlace: async (id, input) => {
    const place = await updatePlaceDoc(id, input);
    set({
      places: get().places.map((p) => (p.id === place.id ? place : p)),
    });
  },

  deletePlace: async (placeId) => {
    await deletePlaceDoc(placeId);
    set({ places: get().places.filter((p) => p.id !== placeId) });
  },
}));
