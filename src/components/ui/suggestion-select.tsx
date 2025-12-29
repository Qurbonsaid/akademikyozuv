"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SuggestionSelectProps {
  items: Array<{ id: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyLabel?: string;
}

export function SuggestionSelect({
  items,
  value,
  onChange,
  placeholder = "Qidirish...",
  emptyLabel = "Barcha variantlar",
}: SuggestionSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedLabel =
    value === "all"
      ? emptyLabel
      : items.find((item) => item.id === value)?.label || "";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("all");
    setSearchQuery("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Button/Input Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="input-field w-full text-left flex items-center justify-between"
      >
        <span
          className={
            selectedLabel ? "text-foreground" : "text-muted-foreground"
          }
        >
          {selectedLabel || emptyLabel}
        </span>
        {value !== "all" && (
          <X
            className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
            onClick={handleClear}
          />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50">
          {/* Search Input */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 w-full text-sm"
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-64 overflow-y-auto">
            {/* All option */}
            <button
              onClick={() => handleSelect("all")}
              className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                value === "all"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-foreground"
              }`}
            >
              {emptyLabel}
            </button>

            {/* Filtered items */}
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    value === item.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-4 text-center text-sm text-muted-foreground">
                Hech narsa topilmadi
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
