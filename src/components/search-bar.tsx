"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = "Tìm kiếm...",
  onSearch,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full max-w-sm items-center space-x-2 transition-all duration-200",
        isFocused && "max-w-md",
        className
      )}
    >
      <div className="relative flex-1 group">
        <div className="absolute px-3 w-4 h-full left-0 top-0 ">
          <Search className="w-4 h-full text-primary" />
        </div>

        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "pr-10 pl-10 border-primary border-opacity-30 focus-visible:border-primary focus-visible:border-opacity-70 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-opacity-20",
            "transition-all duration-200 text-primary"
          )}
          aria-label="Search input"
        />
        {query && (
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            onClick={handleClear}
            className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:text-primary "
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
