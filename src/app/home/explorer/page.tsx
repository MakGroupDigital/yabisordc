'use client';

import type { ElementType } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { startTransition, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  Bookmark,
  Heart,
  MapPin,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { BottomNav } from '@/components/home/bottom-nav';
import { LocationDisplay } from '@/components/home/location-display';
import { SearchWithFilters } from '@/components/home/search-with-filters';
import { AdsToggle } from '@/components/home/ads-toggle';
import { useGeolocation } from '@/hooks/useGeolocation';
import { SafeImage } from '@/components/ui/safe-image';
import { useToast } from '@/hooks/use-toast';
import {
  RestaurantIcon,
  HebergementIcon,
  MobiliteIcon,
  SiteTouristiqueIcon,
  SalleFeteIcon,
  UrgenceMedicaleIcon,
  EvenementsIcon,
  SecuriteIcon,
} from '@/components/home/custom-icons';

const ExplorerLiveMap = dynamic(
  () => import('@/components/home/explorer-live-map').then((mod) => mod.ExplorerLiveMap),
  { ssr: false }
);

interface Category {
  id: string;
  name: string;
  icon: ElementType;
  route: string;
  description: string;
  accent: string;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  tags: string[];
  image: string;
  route: string;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  type: 'category' | 'offer';
}

interface LocationFilterValue {
  id: string;
  name: string;
  type: 'province' | 'territoire' | 'ville';
  province?: string;
  territory?: string;
}

const categories: Category[] = [
  {
    id: 'restauration',
    name: 'Restaurant',
    icon: RestaurantIcon,
    route: '/home/explorer/restauration',
    description: 'Tables signatures, livraisons et bonnes adresses.',
    accent: '#FF8800',
  },
  {
    id: 'hebergement',
    name: 'Hébergement',
    icon: HebergementIcon,
    route: '/home/explorer/hebergement',
    description: 'Hôtels, appartements et séjours premium.',
    accent: '#003366',
  },
  {
    id: 'mobilite',
    name: 'Mobilité',
    icon: MobiliteIcon,
    route: '/home/explorer/mobilite',
    description: 'Déplacements fluides, chauffeurs et trajets utiles.',
    accent: '#003366',
  },
  {
    id: 'site-touristique',
    name: 'Tourisme',
    icon: SiteTouristiqueIcon,
    route: '/home/explorer/site-touristique',
    description: 'Parcours, paysages et lieux iconiques.',
    accent: '#FFCC00',
  },
  {
    id: 'salle-fete-jeux',
    name: 'Salle de fête',
    icon: SalleFeteIcon,
    route: '/home/explorer/salle-fete-jeux',
    description: 'Espaces festifs et réservations événementielles.',
    accent: '#FF8800',
  },
  {
    id: 'urgence-medicale',
    name: 'Urgence Médicale',
    icon: UrgenceMedicaleIcon,
    route: '/home/explorer/urgence-medicale',
    description: 'Services de santé proches et fiables.',
    accent: '#FF8800',
  },
  {
    id: 'evenements',
    name: 'Événements',
    icon: EvenementsIcon,
    route: '/home/explorer/evenements',
    description: 'Sorties, festivals et agenda en mouvement.',
    accent: '#FFCC00',
  },
  {
    id: 'securite',
    name: 'Sécurité',
    icon: SecuriteIcon,
    route: '/home/explorer/securite',
    description: 'Contacts utiles et repères de confiance.',
    accent: '#003366',
  },
];

const floatingSuggestions: Suggestion[] = [
  {
    id: 'resto-1',
    title: 'Restaurant Le Roi',
    description: 'Cuisine congolaise authentique, livraison rapide et service premium.',
    ctaLabel: 'Commander',
    tags: ['Plats populaires', 'Livraison'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
    route: '/home/explorer/restauration',
  },
  {
    id: 'resto-2',
    title: 'Pizza Express',
    description: 'Promos du jour sur les menus signature et les plats en famille.',
    ctaLabel: 'Commander',
    tags: ['Promos', 'Menu famille'],
    image: 'https://images.unsplash.com/photo-1555396273-3677a3c9d74c?w=1200&q=80',
    route: '/home/explorer/restauration',
  },
  {
    id: 'hotel-1',
    title: 'Hôtel Grand Kivu',
    description: 'Séjour avec vue, chambres premium et offres week-end.',
    ctaLabel: 'Réserver',
    tags: ['Hôtel', 'Séjour'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a0d9b8c0b0e?w=1200&q=80',
    route: '/home/explorer/hebergement',
  },
  {
    id: 'appart-1',
    title: 'Appartement Moderne Gombe',
    description: 'Appartement meublé, idéal pour un séjour pro ou famille.',
    ctaLabel: 'Réserver',
    tags: ['Appartement', 'Confort'],
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
    route: '/home/explorer/hebergement',
  },
  {
    id: 'salle-1',
    title: 'Salle de Fête Le Palais',
    description: 'Grandes salles disponibles pour vos événements privés et pros.',
    ctaLabel: 'Réserver',
    tags: ['Salle de fête', 'Événement'],
    image: 'https://images.unsplash.com/photo-1519167758481-83f29da2c4fe?w=1200&q=80',
    route: '/home/explorer/salle-fete-jeux',
  },
  {
    id: 'event-1',
    title: 'Festival de Musique Africaine',
    description: 'Concerts live et ambiance urbaine pour vos sorties du week-end.',
    ctaLabel: 'Découvrir',
    tags: ['Événement', 'Sortie'],
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
    route: '/home/explorer/evenements',
  },
  {
    id: 'tour-1',
    title: 'Parcours Touristique',
    description: 'Lieux à visiter autour de vous avec itinéraires intelligents.',
    ctaLabel: 'Découvrir',
    tags: ['Lieux à visiter', 'Tourisme'],
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
    route: '/home/explorer/site-touristique',
  },
];

const OFFER_FAVORITES_KEY = 'yabiso_offer_favorites_v1';
const OFFER_LIKES_KEY = 'yabiso_offer_likes_v1';

export default function ExplorerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { location: sharedLocation, requestLocation, hasPermission } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOffer, setActiveOffer] = useState<Suggestion>(floatingSuggestions[0]);
  const [likedOfferIds, setLikedOfferIds] = useState<string[]>([]);
  const [favoriteOfferIds, setFavoriteOfferIds] = useState<string[]>([]);
  const [userPosition, setUserPosition] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showAds, setShowAds] = useState(true);
  const [locationFilter, setLocationFilter] = useState<LocationFilterValue | null>(null);

  const displayedCategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return categories;

    return categories.filter((category) => {
      const haystack = `${category.name} ${category.description}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [searchQuery]);

  useEffect(() => {
    const routesToPrefetch = Array.from(
      new Set([
        ...categories.map((category) => category.route),
        ...floatingSuggestions.map((offer) => offer.route),
        '/home/favorites',
        '/home/orders',
        '/home/reservations',
        '/home/profile',
      ])
    );

    routesToPrefetch.forEach((route) => router.prefetch(route));
  }, [router]);

  const searchResults = useMemo<SearchResult[]>(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    const categoryResults: SearchResult[] = categories
      .filter((category) => {
        const haystack = `${category.name} ${category.description}`.toLowerCase();
        return haystack.includes(q);
      })
      .map((category) => ({
        id: `cat-${category.id}`,
        title: category.name,
        subtitle: category.description,
        route: category.route,
        type: 'category',
      }));

    const offerResults: SearchResult[] = floatingSuggestions
      .filter((offer) => {
        const haystack = `${offer.title} ${offer.description} ${offer.tags.join(' ')}`.toLowerCase();
        return haystack.includes(q);
      })
      .map((offer) => ({
        id: `offer-${offer.id}`,
        title: offer.title,
        subtitle: offer.description,
        route: offer.route,
        type: 'offer',
      }));

    return [...offerResults, ...categoryResults].slice(0, 8);
  }, [searchQuery]);

  useEffect(() => {
    if (sharedLocation) {
      setUserPosition({
        lat: sharedLocation.latitude,
        lon: sharedLocation.longitude,
      });
      setLocationError(null);
    }
  }, [sharedLocation]);

  useEffect(() => {
    if (hasPermission === true && !sharedLocation) {
      requestLocation();
    }
  }, [hasPermission, requestLocation, sharedLocation]);

  useEffect(() => {
    if (hasPermission !== true) {
      if (!sharedLocation && hasPermission === false) {
        setLocationError('Position indisponible. Carte centrée sur Kinshasa.');
      }
      return;
    }

    if (!navigator.geolocation) {
      setLocationError('La géolocalisation n’est pas disponible sur cet appareil.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLocationError(null);
      },
      () => {
        if (!sharedLocation) {
          setLocationError('Position indisponible. Carte centrée sur Kinshasa.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [hasPermission, sharedLocation]);

  useEffect(() => {
    try {
      const liked = JSON.parse(localStorage.getItem(OFFER_LIKES_KEY) || '[]') as string[];
      const saved = JSON.parse(localStorage.getItem(OFFER_FAVORITES_KEY) || '[]') as Array<{ id: string }>;
      setLikedOfferIds(Array.isArray(liked) ? liked : []);
      setFavoriteOfferIds(Array.isArray(saved) ? saved.map((item) => item.id) : []);
    } catch {
      setLikedOfferIds([]);
      setFavoriteOfferIds([]);
    }
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveOffer((prev) => {
        if (floatingSuggestions.length <= 1) return prev;
        let next = floatingSuggestions[Math.floor(Math.random() * floatingSuggestions.length)];
        while (next.id === prev.id) {
          next = floatingSuggestions[Math.floor(Math.random() * floatingSuggestions.length)];
        }
        return next;
      });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  const fallbackPosition = { lat: -4.325, lon: 15.322 };
  const mapPosition = userPosition ?? fallbackPosition;
  const isLiked = likedOfferIds.includes(activeOffer.id);
  const isFavorite = favoriteOfferIds.includes(activeOffer.id);
  const activeCategory = categories.find((category) => activeOffer.route.includes(category.id));
  const displayedPeekOffers = floatingSuggestions.filter((offer) => offer.id !== activeOffer.id).slice(0, 3);

  type StoredFavorite = {
    id: string;
    title: string;
    description: string;
    image: string;
    route: string;
    savedAt: string;
  };

  const getStoredFavorites = (): StoredFavorite[] => {
    try {
      const parsed = JSON.parse(localStorage.getItem(OFFER_FAVORITES_KEY) || '[]') as StoredFavorite[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveOfferToFavorites = (offer: Suggestion) => {
    const current = getStoredFavorites();
    if (current.some((item) => item.id === offer.id)) return current;
    const next: StoredFavorite[] = [
      {
        id: offer.id,
        title: offer.title,
        description: offer.description,
        image: offer.image,
        route: offer.route,
        savedAt: new Date().toISOString(),
      },
      ...current,
    ];
    localStorage.setItem(OFFER_FAVORITES_KEY, JSON.stringify(next));
    setFavoriteOfferIds(next.map((item) => item.id));
    return next;
  };

  const toggleLike = () => {
    const next = isLiked
      ? likedOfferIds.filter((id) => id !== activeOffer.id)
      : [...likedOfferIds, activeOffer.id];
    setLikedOfferIds(next);
    localStorage.setItem(OFFER_LIKES_KEY, JSON.stringify(next));

    if (!isLiked) {
      saveOfferToFavorites(activeOffer);
    }

    toast({
      title: isLiked ? 'Like retiré' : 'Like ajouté',
      description: isLiked
        ? 'Cette offre a été retirée de vos likes.'
        : 'Cette offre a été ajoutée à vos likes et à vos favoris.',
    });
  };

  const toggleFavorite = () => {
    const current = getStoredFavorites();
    const exists = current.some((item) => item.id === activeOffer.id);

    const next = exists
      ? current.filter((item) => item.id !== activeOffer.id)
      : [
          {
            id: activeOffer.id,
            title: activeOffer.title,
            description: activeOffer.description,
            image: activeOffer.image,
            route: activeOffer.route,
            savedAt: new Date().toISOString(),
          },
          ...current,
        ];

    localStorage.setItem(OFFER_FAVORITES_KEY, JSON.stringify(next));
    setFavoriteOfferIds(next.map((item) => item.id));

    toast({
      title: exists ? 'Retiré des favoris' : 'Ajouté aux favoris',
      description: exists
        ? 'L’offre a été retirée de la page Favoris.'
        : 'L’offre a été ajoutée à la page Favoris.',
    });
  };

  const handleShareOffer = async () => {
    const shareUrl = `${window.location.origin}${activeOffer.route}`;
    const shareText = `${activeOffer.title} - ${activeOffer.description}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: activeOffer.title,
          text: shareText,
          url: shareUrl,
        });
        toast({ title: 'Partagé', description: 'L’offre a été partagée.' });
        return;
      }

      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({ title: 'Lien copié', description: 'Le lien de l’offre a été copié.' });
    } catch {
      toast({ title: 'Partage annulé', description: 'Le partage n’a pas été effectué.' });
    }
  };

  const openSearchResult = (result: SearchResult) => {
    if (result.type === 'offer') {
      const offer = floatingSuggestions.find((item) => `offer-${item.id}` === result.id);
      if (offer) setActiveOffer(offer);
    }
    startTransition(() => {
      router.push(result.route);
    });
    setSearchQuery('');
  };

  const navigateTo = (route: string) => {
    router.prefetch(route);
    startTransition(() => {
      router.push(route);
    });
  };

  const formatLocationFilter = (location: LocationFilterValue | null) => {
    if (!location) return 'RDC entière';
    if (location.type === 'province') return location.name;
    if (location.type === 'territoire') return `${location.name}, ${location.province}`;
    return `${location.name}, ${location.territory}`;
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F5F5F5] pb-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#F5F5F5]" />
        <motion.div
          animate={{ x: [0, 26, -16, 0], y: [0, -18, 10, 0], scale: [1, 1.06, 0.95, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 left-[18%] h-72 w-72 rounded-full bg-[#FFCC00]/12 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -24, 12, 0], y: [0, 18, -12, 0], scale: [1, 0.94, 1.08, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-[-4rem] top-28 h-80 w-80 rounded-full bg-[#003366]/10 blur-3xl"
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pt-4">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-[32px] border border-[#003366]/12 bg-[#003366] p-4 text-white shadow-[0_28px_70px_-28px_rgba(0,51,102,0.55)]"
        >
          <motion.div
            animate={{ x: ['-120%', '120%'] }}
            transition={{ duration: 5.4, repeat: Infinity, ease: 'linear' }}
            className="pointer-events-none absolute inset-y-0 w-1/3 bg-white/10 blur-sm"
          />
          <div className="pointer-events-none absolute inset-0 bg-[#003366]/10" />

          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FFCC00]">
                Explorer
              </p>
            </div>
            <div className="overflow-hidden rounded-full border-2 border-white/25 bg-white/10 shadow-[0_10px_26px_-12px_rgba(0,0,0,0.45)]">
              <Image
                src="/icons/icon-192x192.png"
                alt="Ya Biso RDC"
                width={54}
                height={54}
                className="h-[54px] w-[54px] rounded-full object-cover"
                priority
              />
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            <div className="rounded-2xl border border-white/12 bg-white/10 px-3 py-2 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">Catégories</p>
              <p className="mt-1 text-sm font-semibold">{categories.length} univers</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/10 px-3 py-2 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">Zone active</p>
              <p className="mt-1 text-sm font-semibold">{formatLocationFilter(locationFilter)}</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/10 px-3 py-2 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">Recommandation</p>
              <p className="mt-1 text-sm font-semibold">{showAds ? 'Visible' : 'Masquée'}</p>
            </div>
          </div>

          <LocationDisplay />

          <SearchWithFilters
            value={searchQuery}
            onChange={setSearchQuery}
            onLocationFilter={setLocationFilter}
            placeholder="Rechercher un service, une adresse ou une ambiance..."
            className="mt-4"
          />

          <div className="mt-3 flex items-center gap-2">
            <AdsToggle onToggle={setShowAds} />
          </div>

          {searchQuery.trim().length > 0 && (
            <div className="mt-3 max-h-60 overflow-y-auto rounded-[24px] border border-[#003366]/10 bg-white p-1.5 shadow-2xl">
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => openSearchResult(result)}
                    className="flex w-full items-start justify-between rounded-[18px] px-3 py-3 text-left transition hover:bg-[#F5F5F5]"
                  >
                    <div className="pr-3">
                      <p className="text-sm font-semibold text-[#003366]">{result.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">{result.subtitle}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#FFCC00] px-2.5 py-1 text-[10px] font-semibold text-[#003366]">
                      {result.type === 'offer' ? 'Offre' : 'Catégorie'}
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-3 text-xs font-medium text-slate-600">
                  Aucun résultat pour votre recherche.
                </p>
              )}
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="relative h-[78vh] overflow-hidden rounded-[32px] border border-[#003366]/12 bg-white shadow-[0_24px_68px_-28px_rgba(0,51,102,0.35)]"
        >
          <ExplorerLiveMap center={mapPosition} hasPreciseLocation={Boolean(userPosition)} />

          <div className="pointer-events-none absolute inset-0 bg-[#003366]/8" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[#FFCC00]/8" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[#003366]/10" />

          <div className="absolute left-3 right-3 top-3 z-20 space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-[24px] border border-[#003366]/10 bg-white px-4 py-3 shadow-[0_18px_40px_-28px_rgba(0,51,102,0.3)]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#003366]">Navigation instantanée</p>
                <p className="mt-1 text-sm font-semibold text-[#003366]">Accès rapide aux univers Yabiso</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FFCC00] px-3 py-1 text-xs font-semibold text-[#003366]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Charte RDC
              </div>
            </div>

            <div className="overflow-x-auto pb-1 scrollbar-hide">
              <div className="flex w-max gap-3">
                {displayedCategories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory?.id === category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => navigateTo(category.route)}
                      className={`group relative overflow-hidden rounded-[22px] border px-3 py-3 text-left shadow-lg transition hover:-translate-y-0.5 ${
                        isActive
                          ? 'border-[#003366] bg-white text-[#003366]'
                          : 'border-[#003366]/12 bg-[#F5F5F5] text-[#003366]'
                      }`}
                      style={{ width: 170 }}
                    >
                      <div className="absolute inset-0 bg-white" />
                      <div className="relative">
                        <div
                          className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm"
                          style={{ backgroundColor: category.accent, color: category.accent === '#FFCC00' ? '#003366' : '#FFFFFF' }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-semibold">{category.name}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-600">{category.description}</p>
                      </div>
                    </button>
                  );
                })}
                {displayedCategories.length === 0 && (
                  <p className="rounded-full bg-[#003366]/70 px-3 py-1.5 text-xs text-white/90">
                    Aucune catégorie trouvée.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="absolute left-1/2 top-1/2 z-20 w-[min(92%,450px)] -translate-x-1/2 -translate-y-1/2">
            {showAds && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="overflow-hidden rounded-[32px] border border-[#003366]/12 bg-white shadow-[0_28px_70px_-34px_rgba(0,51,102,0.45)]"
              >
                <button
                  type="button"
                  onClick={() => navigateTo(activeOffer.route)}
                  className="group relative block w-full"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeOffer.id}
                      initial={{ x: 80, opacity: 0.6 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -80, opacity: 0.4 }}
                      transition={{ duration: 0.7, ease: 'easeInOut' }}
                    >
                      <SafeImage
                        src={activeOffer.image}
                        alt={activeOffer.title}
                        className="h-72 w-full object-cover"
                        fallbackText="Image non disponible"
                      />
                    </motion.div>
                  </AnimatePresence>
                  <div className="pointer-events-none absolute inset-0 bg-[#003366]/26" />
                  <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
                    <div className="rounded-full border border-white/30 bg-[#003366] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                      Sélection du moment
                    </div>
                    {activeCategory && (
                      <div
                        className="rounded-full px-3 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md"
                        style={{
                          backgroundColor: activeCategory.accent,
                          color: activeCategory.accent === '#FFCC00' ? '#003366' : '#FFFFFF',
                        }}
                      >
                        {activeCategory.name}
                      </div>
                    )}
                  </div>
                </button>

                <div className="space-y-4 px-4 pb-4 pt-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-[#003366]">{activeOffer.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{activeOffer.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateTo(activeOffer.route)}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#003366] text-white transition hover:bg-[#014A8A]"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activeOffer.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#003366]/12 bg-[#F5F5F5] px-3 py-1 text-[11px] font-semibold text-[#003366]"
                      >
                        {tag}
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => navigateTo(activeOffer.route)}
                      className="rounded-full bg-[#FF8800] px-4 py-1 text-[11px] font-semibold text-white transition hover:bg-[#f07d00]"
                    >
                      {activeOffer.ctaLabel}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {displayedPeekOffers.map((offer) => (
                      <button
                        key={offer.id}
                        type="button"
                        onClick={() => setActiveOffer(offer)}
                      className="overflow-hidden rounded-[18px] border border-[#003366]/12 bg-[#F5F5F5] text-left transition hover:border-[#003366]/30 hover:bg-white"
                      >
                        <SafeImage
                          src={offer.image}
                          alt={offer.title}
                          className="h-20 w-full object-cover"
                          fallbackText="Image"
                        />
                        <div className="px-2 py-2">
                          <p className="line-clamp-1 text-[11px] font-semibold text-[#003366]">{offer.title}</p>
                          <p className="mt-1 line-clamp-1 text-[10px] text-slate-500">{offer.tags[0]}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-[#003366]/10 pt-3">
                    <div className="flex items-center gap-2 text-[#003366]">
                      <button
                        type="button"
                        aria-label="Aimer"
                        onClick={toggleLike}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5F5F5] transition hover:bg-[#FFCC00] hover:text-[#003366]"
                      >
                        <Heart className={`h-5 w-5 ${isLiked ? 'fill-[#FF8800] text-[#FF8800]' : ''}`} />
                      </button>
                      <button
                        type="button"
                        aria-label="Partager"
                        onClick={handleShareOffer}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5F5F5] transition hover:bg-[#FFCC00] hover:text-[#003366]"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label="Ajouter aux favoris"
                      onClick={toggleFavorite}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#003366] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#014A8A]"
                    >
                      <Bookmark className={`h-4 w-4 ${isFavorite ? 'fill-white text-white' : ''}`} />
                      Favoris
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3 z-20 flex items-end justify-between gap-3">
            <div className="max-w-[68%] rounded-[22px] border border-[#003366]/10 bg-white px-4 py-3 text-xs text-[#003366] shadow-[0_18px_40px_-28px_rgba(0,51,102,0.35)]">
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#FFCC00] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#003366]">
                <MapPin className="h-3.5 w-3.5" />
                Position actuelle
              </div>
              <p className="font-medium">
                {locationError
                  ? locationError
                  : `${mapPosition.lat.toFixed(6)}, ${mapPosition.lon.toFixed(6)}`}
              </p>
            </div>

            <div className="rounded-[22px] border border-[#003366] bg-[#003366] px-4 py-3 text-right text-white shadow-[0_18px_40px_-28px_rgba(0,51,102,0.45)]">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">Focus</p>
              <p className="mt-1 text-sm font-semibold">{formatLocationFilter(locationFilter)}</p>
            </div>
          </div>
        </motion.section>
      </div>

      <BottomNav />
    </div>
  );
}
