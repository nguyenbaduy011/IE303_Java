"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";
import { NotiType } from "@/types/types";

interface AnnouncementFiltersProps {
  onFilterChange: (types: NotiType[]) => void;
}

export function AnnouncementFilters({
  onFilterChange,
}: AnnouncementFiltersProps) {
  const allTypes: NotiType[] = [
    "info",
    "reminder",
    "action",
    "achievement",
    "social",
    "warning",
    "system",
    "celebration",
  ];
  const [selectedTypes, setSelectedTypes] = useState<NotiType[]>(allTypes);

  const handleTypeToggle = (type: NotiType) => {
    const updatedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(updatedTypes);
    onFilterChange(updatedTypes);
  };

  const handleAllToggle = () => {
    const updatedTypes =
      selectedTypes.length === allTypes.length ? [] : [...allTypes];
    setSelectedTypes(updatedTypes);
    onFilterChange(updatedTypes);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Filter className="h-4 w-4" />
          Filter by Type
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Filter by Notification Type</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={selectedTypes.length === allTypes.length}
          onCheckedChange={handleAllToggle}
        >
          All
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {allTypes.map((type) => (
          <DropdownMenuCheckboxItem
            key={type}
            checked={selectedTypes.includes(type)}
            onCheckedChange={() => handleTypeToggle(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
