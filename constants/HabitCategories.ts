import { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";

export const categories = [
  "Health",
  "Fitness", 
  "Productivity",
  "Learning",
  "Social",
  "Other",
];

type IconName = ComponentProps<typeof Ionicons>["name"];

export const categoryIcons: { [key: string]: IconName } = {
  Health: "heart",
  Fitness: "barbell",
  Productivity: "checkmark-circle",
  Learning: "book",
  Social: "people",
  Other: "ellipsis-horizontal",
};
