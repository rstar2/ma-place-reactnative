import { ImageSourcePropType } from "react-native";

export type Place = {
  id: string;
  icon: ImageSourcePropType;
  name: string;
  plan?: string;
  category?: string;
  paymentMethod?: string;
  status?: string;
  startDate?: string;
  price: number;
  currency?: string;
  billing: string;
  frequency?: string;
  renewalDate?: string;
  color?: string;
};


