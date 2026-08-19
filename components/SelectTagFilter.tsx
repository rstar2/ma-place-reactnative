import { View } from "react-native";

import Select, { type SelectOption } from "@/components/ui/Select";
import { Tag } from "@/lib/types";

/** Sentinel value for the "All" option (no tag filter). */
const ALL = "";

type SelectTagFilterProps = {
  tags: string[];
  value: Tag | undefined;
  onChange: (tag: Tag | undefined) => void;
};

export default function SelectTagFilter({
  tags,
  value,
  onChange,
}: SelectTagFilterProps) {
  const options: SelectOption<Tag | "">[] = [
    { label: "All", value: ALL },
    ...tags.map((t) => ({ label: t, value: t })),
  ];

  return (
    <View className="tag-filter">
      <Select
        options={options}
        selected={value ?? ALL}
        onSelect={(v) => onChange(v === ALL ? undefined : (v as Tag))}
      />
    </View>
  );
}
