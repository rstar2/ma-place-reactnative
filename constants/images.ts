import { type ImageSourcePropType } from "react-native";

import splashPattern from "@/assets/images/splash-pattern.png";
import avatar from "@/assets/images/avatar.png";

export const images = { splashPattern, avatar } as const satisfies Record<
  string,
  ImageSourcePropType
>;
