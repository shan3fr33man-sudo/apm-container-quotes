import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { getSuggestions } from "@/lib/distance";
import { isGoogleMapsAvailable, getPlaceSuggestions } from "@/lib/google-maps";

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export function AddressInput({
  value,
  onChange,
  placeholder = "City, State (e.g. Seattle, WA)",
  id,
}: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const useGoogle = isGoogleMapsAvailable();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(
    (input: string) => {
      if (!useGoogle) {
        const results = getSuggestions(input);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setHighlightedIndex(-1);
        return;
      }

      // Debounce Google API calls
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const results = await getPlaceSuggestions(input);
        if (results.length > 0) {
          setSuggestions(results);
          setShowSuggestions(true);
        } else {
          // Fall back to local suggestions if Google returns nothing
          const local = getSuggestions(input);
          setSuggestions(local);
          setShowSuggestions(local.length > 0);
        }
        setHighlightedIndex(-1);
      }, 300);
    },
    [useGoogle]
  );

  function handleInputChange(newValue: string) {
    onChange(newValue);
    fetchSuggestions(newValue);
  }

  function selectSuggestion(suggestion: string) {
    onChange(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setShowSuggestions(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              className={`cursor-pointer rounded-sm px-2 py-1.5 text-sm ${
                index === highlightedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
              onMouseDown={() => selectSuggestion(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
