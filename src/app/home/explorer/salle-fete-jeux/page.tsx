'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Filter, Search, MapPin, Star, Users, Clock, DollarSign } from 'lucide-react';
import { BottomNav } from '@/components/home/bottom-nav';
import { SafeImage } from '@/components/ui/safe-image';
import { sallesFete, categories } from '@/data/salles-fete';
import { SalleFete, SalleFilters } from '@/types/salle-fete';

export default function SalleFetePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SalleFilters>({
    sortBy: 'rating',
    sortOrder: 'desc'
  });

  const filteredSalles = useMemo(() => {
    let result = sallesFete.filter(salle => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!salle.name.toLowerCase().includes(query) &&
            !salle.description.toLowerCase().includes(query) &&
            !salle.location.city.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Location filters
      if (filters.city && salle.location.city !== filters.city) return false;
      if (filters.province && salle.location.province !== filters.province) return false;
      if (filters.region && salle.location.region !== filters.region) return false;

      // Category filter
      if (filters.category && salle.category !== filters.category) return false;

      // Price filters
      if (filters.minPrice && salle.pricePerHour < filters.minPrice) return false;
      if (filters.maxPrice && salle.pricePerHour > filters.maxPrice) return false;

      // Capacity filters
      if (filters.minCapacity && salle.capacity < filters.minCapacity) return false;
      if (filters.maxCapacity && salle.capacity > filters.maxCapacity) return false;

      return salle.isActive;
    });

    // Sorting
    if (filters.sortBy) {
      result.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'price':
            aValue = a.pricePerHour;
            bValue = b.pricePerHour;
            break;
          case 'rating':
            aValue = a.rating;
            bValue = b.rating;
            break;
          case 'capacity':
            aValue = a.capacity;
            bValue = b.capacity;
            break;
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    return result;
  }, [searchQuery, filters]);

  const uniqueCities = [...new Set(sallesFete.map(s => s.location.city))];
  const uniqueProvinces = [...new Set(sallesFete.map(s => s.location.province))];

  const handleSalleClick = (salle: SalleFete) => {
    router.push(`/home/explorer/salle-fete-jeux/${salle.id}`);
  };

  return (
    <div className="min-h-screen bg-[#F6F6F2] pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">Salles de Fête</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une salle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t bg-gray-50 p-4">
            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium">Catégorie</label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
                  className="w-full rounded-lg border border-gray-200 p-2"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium">Ville</label>
                <select
                  value={filters.city || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value || undefined }))}
                  className="w-full rounded-lg border border-gray-200 p-2"
                >
                  <option value="">Toutes les villes</option>
                  {uniqueCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Prix min ($/h)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full rounded-lg border border-gray-200 p-2"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Prix max ($/h)</label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={filters.maxPrice || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full rounded-lg border border-gray-200 p-2"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="mb-2 block text-sm font-medium">Trier par</label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setFilters(prev => ({ ...prev, sortBy: sortBy as any, sortOrder: sortOrder as any }));
                  }}
                  className="w-full rounded-lg border border-gray-200 p-2"
                >
                  <option value="rating-desc">Note (élevée à faible)</option>
                  <option value="rating-asc">Note (faible à élevée)</option>
                  <option value="price-asc">Prix (faible à élevé)</option>
                  <option value="price-desc">Prix (élevé à faible)</option>
                  <option value="capacity-desc">Capacité (grande à petite)</option>
                  <option value="capacity-asc">Capacité (petite à grande)</option>
                  <option value="name-asc">Nom (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="p-4">
        <div className="mb-4 text-sm text-gray-600">
          {filteredSalles.length} salle{filteredSalles.length > 1 ? 's' : ''} trouvée{filteredSalles.length > 1 ? 's' : ''}
        </div>

        <div className="space-y-4">
          {filteredSalles.map((salle) => (
            <div
              key={salle.id}
              onClick={() => handleSalleClick(salle)}
              className="cursor-pointer rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex gap-4">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                  <SafeImage
                    src={salle.images[0]}
                    alt={salle.name}
                    className="h-full w-full object-cover"
                    fallbackText="Salle"
                  />
                </div>
                
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-gray-900">{salle.name}</h3>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span>{salle.location.city}, {salle.location.province}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{salle.capacity} pers.</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>{salle.pricePerHour}$/h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{salle.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 line-clamp-2">{salle.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSalles.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-gray-400">
              <Search className="mx-auto h-12 w-12 mb-4" />
              <p>Aucune salle trouvée</p>
              <p className="text-sm">Essayez de modifier vos critères de recherche</p>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}