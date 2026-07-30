"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export interface PlaceValue {
  name: string;
  lat: number | null;
  lng: number | null;
}

interface Suggestion {
  id: string;
  placeName: string;
  lat: number;
  lng: number;
}

interface PlaceSearchInputProps {
  label: string;
  value: PlaceValue;
  onChange: (value: PlaceValue) => void;
  placeholder?: string;
}

export function PlaceSearchInput({ label, value, onChange, placeholder }: PlaceSearchInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  function handleTextChange(text: string) {
    // Typing again invalidates any previously picked coordinates until a
    // suggestion is selected again.
    onChange({ name: text, lat: null, lng: null });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    if (!MAPBOX_TOKEN || text.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5`,
          { signal: controller.signal }
        );
        const body = await res.json();
        const results: Suggestion[] = (body.features ?? []).map(
          (f: { id: string; place_name: string; center: [number, number] }) => ({
            id: f.id,
            placeName: f.place_name,
            lng: f.center[0],
            lat: f.center[1],
          })
        );
        setSuggestions(results);
        setOpen(true);
      } catch {
        // Aborted or network error, leave suggestions as-is.
      }
    }, 300);
  }

  function handleSelect(suggestion: Suggestion) {
    onChange({ name: suggestion.placeName, lat: suggestion.lat, lng: suggestion.lng });
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div className="relative">
      <Label className="mb-1.5">{label}</Label>
      <Input
        value={value.name}
        onChange={(e) => handleTextChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {!MAPBOX_TOKEN && (
        <p className="mt-1 text-xs text-muted-foreground">
          Map search is unavailable, add NEXT_PUBLIC_MAPBOX_TOKEN to enable it.
        </p>
      )}
      {open && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(suggestion)}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
            >
              {suggestion.placeName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
