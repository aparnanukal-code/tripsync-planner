import { useEffect, useRef, useState } from "react";
import { searchCities, type CityResult } from "@/lib/tripsync/photon";
import { MapPin } from "lucide-react";

export function CityAutocomplete({
  value,
  onSelect,
}: {
  value: CityResult | null;
  onSelect: (c: CityResult) => void;
}) {
  const [query, setQuery] = useState(value?.label ?? "");
  const [results, setResults] = useState<CityResult[]>([]);
  const [open, setOpen] = useState(false);
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setQuery(value?.label ?? ""); }, [value]);

  useEffect(() => {
    if (tRef.current) clearTimeout(tRef.current);
    if (!open) return;
    tRef.current = setTimeout(async () => {
      const r = await searchCities(query);
      setResults(r);
    }, 300);
    return () => { if (tRef.current) clearTimeout(tRef.current); };
  }, [query, open]);

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search a city…"
          className="input-field w-full pl-9 pr-3 py-2 text-sm"
        />
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-border bg-white shadow-lg">
          {results.map((r) => (
            <li
              key={r.label}
              onMouseDown={(e) => { e.preventDefault(); onSelect(r); setQuery(r.label); setOpen(false); }}
              className="cursor-pointer px-3 py-2 text-sm text-foreground hover:bg-primary-light"
            >
              {r.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
