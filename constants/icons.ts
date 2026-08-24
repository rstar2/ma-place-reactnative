import { type ImageSourcePropType } from "react-native";

import activity from "@/assets/icons/activity.png";
import add from "@/assets/icons/add.png";
import back from "@/assets/icons/back.png";
import copy from "@/assets/icons/copy.png";
import home from "@/assets/icons/home.png";
import map from "@/assets/icons/map2.png";
import plus from "@/assets/icons/plus.png";
import setting from "@/assets/icons/setting.png";

import place from "@/assets/icons/place.png";
import sleep from "@/assets/icons/sleep.png";
import oil from "@/assets/icons/oil.png";
import water from "@/assets/icons/water.png";
import crag from "@/assets/icons/crag.png";
import playground from "@/assets/icons/playground.png";
import parking from "@/assets/icons/parking.png";

export const icons = {
  home,
  setting,
  activity,
  map,
  add,
  back,
  copy,
  plus,

  place,
  // tags
  sleep,
  oil,
  water,
  crag,
  parking,
  playground,
} as const satisfies Record<string, ImageSourcePropType>;

export type IconKey = keyof typeof icons;
