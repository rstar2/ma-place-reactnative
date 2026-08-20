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
  imageUrl?: string;
  /**
   * Any additional meta data,
   * currently just the Cloudinary ID of the image
   */
  meta: {
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
};

export type NewPlaceInput = Omit<
  Place,
  "id" | "uid" | "createdAt" | "color" | "icon" | "location"
> & {
  location: {
    longitude: string;
    latitude: string;
  };
};
