import React, { useState } from "react";

import { usePlacesStore } from "@/store/places-store";
import Button from "@/components/ui/Button";
import Confirmation from "@/components/ui/Confirmation";
import { Toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export default function PlaceDeleteButton({
  placeId,
  onDeleted,
  className,
}: {
  placeId: string;
  onDeleted?: () => void;
  className?: string;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deletePlace = usePlacesStore((state) => state.deletePlace);

  return (
    <>
      <Button
        label="Delete"
        className={cn("bg-destructive", className)}
        onPress={() =>
          // show a confirm dialog before real deleting
          setConfirmDelete(true)
        }
      />

      <Confirmation
        message="Delete the place"
        visible={!!confirmDelete}
        onClose={async (confirmed) => {
          setConfirmDelete(false);
          if (confirmed) {
            try {
              await deletePlace(placeId);
              onDeleted?.();
              Toast.success("Success", "Place deleted");
            } catch (err) {
              console.error(`Failed to save place`, err);
              Toast.error("Failure", "Place not deleted");
            }
          }
        }}
      />
    </>
  );
}
