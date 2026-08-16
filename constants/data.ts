import { GeoPoint } from "@react-native-firebase/firestore";

import { Place } from "@/lib/types";
import { icons } from "@/constants/icons";

export const HOME_BALANCE = {
    amount: 2489.48,
    nextRenewalDate: "2026-03-18T09:00:00.000Z",
};

export const HOME_PLACES: Place[] = [
  {
    id: "place-alexander-nevsky",
    createdAt: new Date("2026-07-02T09:15:00.000Z"),
    uid: "user-42",
    title: "Alexander Nevsky Cathedral",
    description:
      "Impressive neo-Byzantine cathedral with gold-plated domes. Best visited early morning to avoid crowds.",
    location: new GeoPoint(42.696, 23.332),
    tags: ["landmark", "architecture", "free-entry"],
    imageUrl:
      "https://res.cloudinary.com/magic-media/image/upload/v1754000000/ma-place/alexander-nevsky.jpg",
    meta: { cloudinaryId: "ma-place/alexander-nevsky" },
    icon: icons.home,
    color: "#f5c542",
  },
  {
    id: "place-vitosha-trail",
    createdAt: new Date("2026-07-10T16:40:00.000Z"),
    uid: "user-42",
    title: "Vitosha — Cherni Vrah Trail",
    description:
      "Moderate 4h hike from Aleko hut to the summit. Steep sections near the top, bring windproof layers.",
    location: new GeoPoint(42.584, 23.294),
    tags: ["hiking", "nature", "day-trip"],
    imageUrl:
      "https://res.cloudinary.com/magic-media/image/upload/v1754000001/ma-place/vitosha-trail.jpg",
    meta: { cloudinaryId: "ma-place/vitosha-trail" },
    icon: icons.activity,
    color: "#b8e8d0",
  },
  {
    id: "place-rakia-room",
    createdAt: new Date("2026-07-21T19:05:00.000Z"),
    uid: "user-42",
    title: "Rakia Room",
    description:
      "Cozy mehana with 40+ local rakias. The roasted peppers and katino meze are must-orders.",
    location: new GeoPoint(42.693, 23.345),
    tags: ["food", "restaurant", "wine"],
    imageUrl:
      "https://res.cloudinary.com/magic-media/image/upload/v1754000002/ma-place/rakia-room.jpg",
    meta: { cloudinaryId: "ma-place/rakia-room" },
    icon: icons.wallet,
    color: "#e8def8",
  },
  {
    id: "place-nat-museum",
    createdAt: new Date("2026-08-01T11:20:00.000Z"),
    uid: "user-7",
    title: "National Archaeological Museum",
    description:
      "Thracian gold treasures in a former mosque. Closed Mondays, ~1h is enough for the main halls.",
    location: new GeoPoint(42.6955, 23.3247),
    tags: ["museum", "history", "indoor"],
    imageUrl:
      "https://res.cloudinary.com/magic-media/image/upload/v1754000003/ma-place/nat-museum.jpg",
    meta: { cloudinaryId: "ma-place/nat-museum" },
    icon: icons.setting,
    color: "#b8d4e3",
  },
  {
    id: "place-borisova-garden",
    createdAt: new Date("2026-08-12T08:00:00.000Z"),
    uid: "user-7",
    title: "Borisova Gradina Park",
    description:
      "Largest park in the city, good for running and picnics. The lakeside path is the quietest route.",
    location: new GeoPoint(42.686, 23.341),
    imageUrl:
      "https://res.cloudinary.com/magic-media/image/upload/v1754000004/ma-place/borisova-garden.jpg",
    meta: { cloudinaryId: "ma-place/borisova-garden" },
    icon: icons.medium,
    color: "#b8e8d0",
  },
];
