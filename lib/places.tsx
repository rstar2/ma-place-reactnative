import { GeoPoint } from "@react-native-firebase/firestore";
import { createContext, useContext, useState, type ReactNode } from "react";

import ModalAddEditPlace from "@/components/ModalAddEditPlace";
import { usePlacesStore } from "@/store/places-store";
import type { NewPlaceInput, Place } from "./types";
import { useAuth } from "./auth";

type AddEditPlaceContextValue = {
  onAddPlacePress: () => void;
  onEditPlacePress: (place: Place) => void;
};

/** `true` → add mode, a `Place` → edit mode, `null` → hidden. */
type ModalPlace = Place | true | null;

const AddEditPlaceContext = createContext<AddEditPlaceContextValue | undefined>(
  undefined,
);

export function AddEditPlaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [modalPlace, setModalPlace] = useState<ModalPlace>(null);
  const addPlace = usePlacesStore((state) => state.addPlace);
  const editPlace = usePlacesStore((state) => state.editPlace);

  async function handleSubmit(values: Omit<NewPlaceInput, "uid">) {
    const current = modalPlace;
    setModalPlace(null);

    if (!current) return;

    try {
      if (current === true) {
        // add new
        await addPlace({
          uid: user!.uid,
          ...values,
        });
      } else {
        // edit current
        await editPlace({
          ...current,
          ...values,
        });
      }

      // TODO: show success notification
    } catch (err) {
      console.error(`Failed to save place`, err);
      // TODO: show error notification
    }
  }

  const value: AddEditPlaceContextValue = {
    onAddPlacePress() {
      setModalPlace(true);
    },
    onEditPlacePress(place: Place) {
      setModalPlace(place);
    },
  };

  return (
    <AddEditPlaceContext.Provider value={value}>
      {children}

      <ModalAddEditPlace
        place={modalPlace}
        onClose={() => setModalPlace(null)}
        onSubmit={handleSubmit}
      />
    </AddEditPlaceContext.Provider>
  );
}

export function useAddEditPlace(): AddEditPlaceContextValue {
  const ctx = useContext(AddEditPlaceContext);
  if (!ctx) {
    throw new Error(
      "useAddEditPlace must be used within an <AddEditPlaceProvider>.",
    );
  }
  return ctx;
}
