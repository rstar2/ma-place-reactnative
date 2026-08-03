import { type ImageSourcePropType } from "react-native/Libraries/Image/Image";

import splashPattern from "@/assets/images/splash-pattern.png";
import avatar from "@/assets/images/avatar.png";

export default { splashPattern, avatar } as const satisfies Record<
  string,
  ImageSourcePropType
>;
