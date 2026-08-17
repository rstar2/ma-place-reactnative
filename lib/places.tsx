import ModalAddEditPlace from "@/components/ModalAddEditPlace";
import { createContext, useContext, useState, type ReactNode } from "react";
import { Place } from "./types";
import { usePlacesStore } from "@/store/places-store";

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
  const [modalPlace, setModalPlace] = useState<ModalPlace>(null);
  const addPlace = usePlacesStore((state) => state.addPlace);
  const editPlace = usePlacesStore((state) => state.editPlace);

  function handleSubmit(place: { name: string }) {
    const current = modalPlace;
    setModalPlace(null);

    const save =
      current === true
        ? addPlace({ title: place.name })
        : current
          ? editPlace({ ...current, title: place.name })
          : null;

    save?.catch((err) => console.warn("Failed to save place:", err));
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
