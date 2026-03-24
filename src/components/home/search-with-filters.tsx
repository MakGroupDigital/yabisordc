'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { rdcProvinces, searchLocations } from '@/data/rdc-locations';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  name: string;
  type: 'province' | 'territoire' | 'ville';
  province?: string;
  territory?: string;
}

interface SearchWithFiltersProps {
  value: string;
  onChange: (value: string) => void;
  onLocationFilter?: (location: SearchResult | null) => void;
  placeholder?: string;
  className?: string;
}

export function SearchWithFilters({
  value,
  onChange,
  onLocationFilter,
  placeholder = "Restaurant, service, lieu...",
  className
}: SearchWithFiltersProps) {
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<SearchResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<SearchResult | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Recherche de localisation
  useEffect(() => {
    if (locationQuery.length > 1) {
      const results = searchLocations(locationQuery);
      setLocationResults(results);
    } else {
      setLocationResults([]);
    }
  }, [locationQuery]);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLocationFilter(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (location: SearchResult) => {
    setSelectedLocation(location);
    setShowLocationFilter(false);
    setLocationQuery('');
    onLocationFilter?.(location);
  };

  const clearLocationFilter = () => {
    setSelectedLocation(null);
    onLocationFilter?.(null);
  };

  const getLocationDisplayText = (location: SearchResult) => {
    if (location.type === 'province') {
      return location.name;
    } else if (location.type === 'territoire') {
      return `${location.name}, ${location.province}`;
    } else {
      return `${location.name}, ${location.territory}`;
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Barre de recherche principale */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 rounded-xl border-0 bg-white/90 pl-10 pr-4 text-slate-900 shadow-sm placeholder:text-slate-500 focus:bg-white"
        />
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2">
        {/* Filtre de localisation */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowLocationFilter(!showLocationFilter)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              selectedLocation
                ? "border border-[#003366] bg-[#003366] text-white"
                : "border border-white/50 bg-white/70 text-slate-600 hover:bg-white/90"
            )}
          >
            <MapPin className="h-4 w-4" />
            <span>
              {selectedLocation ? getLocationDisplayText(selectedLocation) : 'Localisation'}
            </span>
            {selectedLocation && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearLocationFilter();
                }}
                className="ml-1 rounded-full p-0.5 hover:bg-white/15"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </button>

          {/* Dropdown de localisation */}
          {showLocationFilter && (
            <div className="absolute top-full left-0 z-50 mt-2 w-80 rounded-xl border border-[#003366]/10 bg-white shadow-lg">
              <div className="border-b border-[#003366]/10 p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Rechercher une ville, territoire, province..."
                    className="w-full rounded-lg border border-[#003366]/12 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
                    autoFocus
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto">
                {locationQuery.length <= 1 ? (
                  // Afficher les provinces populaires par défaut
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Provinces populaires
                    </div>
                    {rdcProvinces.slice(0, 6).map((province) => (
                      <button
                        key={province.id}
                        onClick={() => handleLocationSelect({
                          id: province.id,
                          name: province.name,
                          type: 'province'
                        })}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-[#F5F5F5]"
                      >
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{province.name}</div>
                          <div className="text-xs text-gray-500">Province</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : locationResults.length > 0 ? (
                  <div className="p-2">
                    {locationResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleLocationSelect(result)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-[#F5F5F5]"
                      >
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{result.name}</div>
                          <div className="text-xs text-gray-500">
                            {result.type === 'province' && 'Province'}
                            {result.type === 'territoire' && `Territoire, ${result.province}`}
                            {result.type === 'ville' && `${result.territory}, ${result.province}`}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Aucun résultat trouvé
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
