import { GeoPoint } from "@react-native-firebase/firestore";
import { ImageSourcePropType } from "react-native";

export type Tag = string;

export type Place = {
  id: string;
  createdAt: Date;

  /**
   * User ID - the user created the place
   */
  uid: string;

  title: string;
  description: string;
  location: GeoPoint;
  tags?: Tag[];
  /**
   * Image url - like:
   * https://res.cloudinary.com/magic-media/image/upload/v1569150316/ma-place/m4b3lllxapindctqlxdq.jpg
   */
  url?: string;
  /**
   * Any additional meta data,
   * currently just the Cloudinary ID of the image
   */
  meta?: {
    // Like: ma-place/m4b3lllxapindctqlxdq
    cloudinaryId?: string;
  };
  //  meta: Record<string, string | number | boolean>;

  /**
   * Local icon based on the tags
   */
  icon: ImageSourcePropType;
  /**
   * Local color also based on the tags or on the current user
   */
  color: string;

  /**
   * Creator's display name, resolved client-side from the `users`
   * collection (Firestore has no joins)
   */
  creatorName?: string;
};

/**
 * RN FormData file part — build from an expo-image-picker asset:
 * { uri: asset.uri, type: asset.mimeType ?? "image/jpeg", name: asset.fileName ?? "upload.jpg" }
 */
export type ImageUploadData = { uri: string; type?: string; name?: string };

export type NewPlace = Omit<
  Place,
  "id" | "createdAt" | "color" | "icon" | "creatorName" | "location"
> & {
  location: {
    longitude: string;
    latitude: string;
  };
};

export type NewPlaceInput = Omit<
  NewPlace,
  // this is added later, as the authorized user ID
  | "uid"

  // these are later populated after upload to Cloudinary
  | "url"
  | "meta"
> & {
  imageUploadData?: ImageUploadData;
};
