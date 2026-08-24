import { createContext, useContext, useState, type ReactNode } from "react";

import ModalAddEditPlace from "@/components/ModalAddEditPlace";
import { usePlacesStore } from "@/store/places-store";
import type { NewPlaceInput, Place } from "./types";
import { Toast } from "@/components/ui/Toast";
import Confirmation from "@/components/ui/Confirmation";

/** Prefills the add modal's location field (e.g. a coordinate picked on the map). */
type InitialLocation = { latitude: number; longitude: number };

type ManagePlaceContextValue = {
  onAddPlace: (initialLocation?: InitialLocation) => void;
  onEditPlace: (place: Place) => void;
  onDeletePlace: (place: Place) => void;
};

/** `true` → add mode, a `Place` → edit mode, `null` → hidden. */
type AddEditModalPlace = Place | true | null;

const ManagePlaceContext = createContext<ManagePlaceContextValue | undefined>(
  undefined,
);

export function ManagePlaceProvider({ children }: { children: ReactNode }) {
  const [modalPlace, setModalPlace] = useState<AddEditModalPlace>(null);
  // Location seed for add mode (map tap); must be cleared whenever the modal
  // closes so it can't leak into a later "+" add.
  const [addInitialLocation, setAddInitialLocation] = useState<
    InitialLocation | undefined
  >(undefined);
  const addPlace = usePlacesStore((state) => state.addPlace);
  const editPlace = usePlacesStore((state) => state.editPlace);
  const deletePlace = usePlacesStore((state) => state.deletePlace);

  const [confirmDelete, setConfirmDelete] = useState<string | undefined>(
    undefined,
  );

  async function handleSubmit(values: NewPlaceInput) {
    const current = modalPlace;
    setModalPlace(null);
    setAddInitialLocation(undefined);

    if (!current) return;

    try {
      if (current === true) {
        // add new
        await addPlace(values);
      } else {
        // edit current
        await editPlace(current.id, values);
      }

      Toast.success(
        "Success",
        current === true ? "New place added" : "Place edited",
      );
    } catch (err) {
      console.error(`Failed to save place`, err);
      Toast.error(
        "Failure",
        current === true ? "New place not added" : "Place not edited",
      );
    }
  }

  const value: ManagePlaceContextValue = {
    onAddPlace(initialLocation) {
      setAddInitialLocation(initialLocation);
      setModalPlace(true);
    },
    onEditPlace(place) {
      setModalPlace(place);
    },
    async onDeletePlace(place) {
      // show a confirm dialog before real deleting
      setConfirmDelete(place.id);
    },
  };

  return (
    <ManagePlaceContext.Provider value={value}>
      {children}

      <ModalAddEditPlace
        place={modalPlace}
        initialLocation={
          modalPlace === true ? addInitialLocation : undefined
        }
        onClose={() => {
          setModalPlace(null);
          setAddInitialLocation(undefined);
        }}
        onSubmit={handleSubmit}
      />

      <Confirmation
        message="Delete the place"
        visible={!!confirmDelete}
        onClose={async (confirmed) => {
          setConfirmDelete(undefined);
          if (confirmed) {
            try {
              await deletePlace(confirmDelete!);

              Toast.success("Success", "Place deleted");
            } catch (err) {
              console.error(`Failed to save place`, err);
              Toast.error("Failure", "Place not deleted");
            }
          }
        }}
      />
    </ManagePlaceContext.Provider>
  );
}

export function useManagePlace(): ManagePlaceContextValue {
  const ctx = useContext(ManagePlaceContext);
  if (!ctx) {
    throw new Error(
      "useManagePlace must be used within an <ManagePlaceProvider>.",
    );
  }
  return ctx;
}
