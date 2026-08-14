import ModalAddEditPlace from "@/components/ModalAddEditPlace";
import { createContext, useContext, useState, type ReactNode } from "react";
import { Place } from "./types";

type AddEditPlaceContextValue = {
  onAddPlacePress: () => void;
  onEditPlacePress: (place: Place) => void;
};

const AddEditPlaceContext = createContext<AddEditPlaceContextValue | undefined>(
  undefined,
);

export function AddEditPlaceProvider({ children }: { children: ReactNode }) {
  const [addPlaceModalVisible, setAddPlaceModalVisible] = useState(false);

  // TODO: persist the new place built from `place`
  function handleAddPlace(place: { name: string }) {
    setAddPlaceModalVisible(false);
  }

  const value: AddEditPlaceContextValue = {
    onAddPlacePress() {
      setAddPlaceModalVisible(true);
    },
    onEditPlacePress(place: Place) {
      setAddPlaceModalVisible(true);
    },
  };

  return (
    <AddEditPlaceContext.Provider value={value}>
      {children}

      <ModalAddEditPlace
        place={addPlaceModalVisible}
        onClose={() => setAddPlaceModalVisible(false)}
        onSubmit={handleAddPlace}
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
