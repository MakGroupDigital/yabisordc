'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass, Heart, MapPin, Search, Send, Bookmark } from 'lucide-react';
import { BottomNav } from '@/components/home/bottom-nav';
import { LocationDisplay } from '@/components/home/location-display';
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
import { Input } from '@/components/ui/input';

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  route: string;
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

const categories: Category[] = [
  { id: 'restauration', name: 'Restaurant', icon: RestaurantIcon, route: '/home/explorer/restauration' },
  { id: 'hebergement', name: 'Hébergement', icon: HebergementIcon, route: '/home/explorer/hebergement' },
  { id: 'mobilite', name: 'Mobilité', icon: MobiliteIcon, route: '/home/explorer/mobilite' },
  { id: 'site-touristique', name: 'Tourisme', icon: SiteTouristiqueIcon, route: '/home/explorer/site-touristique' },
  { id: 'salle-fete-jeux', name: 'Salle de fête', icon: SalleFeteIcon, route: '/home/explorer/salle-fete-jeux' },
  { id: 'urgence-medicale', name: 'Urgence Médicale', icon: UrgenceMedicaleIcon, route: '/home/explorer/urgence-medicale' },
  { id: 'evenements', name: 'Événements', icon: EvenementsIcon, route: '/home/explorer/evenements' },
  { id: 'securite', name: 'Sécurité', icon: SecuriteIcon, route: '/home/explorer/securite' },
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOffer, setActiveOffer] = useState<Suggestion>(floatingSuggestions[0]);
  const [likedOfferIds, setLikedOfferIds] = useState<string[]>([]);
  const [favoriteOfferIds, setFavoriteOfferIds] = useState<string[]>([]);
  const [userPosition, setUserPosition] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const displayedCategories = useMemo(
    () =>
      categories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      ),
    [searchQuery]
  );

  const searchResults = useMemo<SearchResult[]>(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    const categoryResults: SearchResult[] = categories
      .filter((category) => category.name.toLowerCase().includes(q))
      .map((category) => ({
        id: `cat-${category.id}`,
        title: category.name,
        subtitle: 'Catégorie',
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
    if (!navigator.geolocation) {
      setLocationError('La géolocalisation n’est pas disponible sur cet appareil.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLocationError(null);
      },
      () => {
        setLocationError('Position indisponible. Carte centrée sur Kinshasa.');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, []);

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
  const box = 0.05;
  const bbox = `${(mapPosition.lon - box).toFixed(5)}%2C${(mapPosition.lat - box).toFixed(5)}%2C${(mapPosition.lon + box).toFixed(5)}%2C${(mapPosition.lat + box).toFixed(5)}`;
  const marker = `${mapPosition.lat.toFixed(5)}%2C${mapPosition.lon.toFixed(5)}`;
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
  const isLiked = likedOfferIds.includes(activeOffer.id);
  const isFavorite = favoriteOfferIds.includes(activeOffer.id);

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
    router.push(result.route);
    setSearchQuery('');
  };

  const handleSearchEnter = () => {
    if (searchResults.length === 0) return;
    openSearchResult(searchResults[0]);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F5F8FD] pb-24">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ x: [0, 24, -12, 0], y: [0, -16, 8, 0], scale: [1, 1.07, 0.96, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-14 left-[45%] h-72 w-72 -translate-x-1/2 rounded-full bg-[#FFCC00]/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 10, 0], y: [0, 14, -10, 0], scale: [1, 0.95, 1.06, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-36 -right-16 h-72 w-72 rounded-full bg-[#003366]/15 blur-3xl"
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 pt-4">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#003366] via-[#014A8A] to-[#0A6AB8] p-5 text-white shadow-[0_24px_64px_-22px_rgba(0,51,102,0.72)]"
        >
          <motion.div
            animate={{ x: ['-120%', '120%'] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'linear' }}
            className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm"
          />

          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FFCC00]">Yabiso App</p>
              <h1 className="mt-1 text-2xl font-semibold leading-tight">Découvrez la RDC sous toutes ses formes.</h1>
            </div>
            <div className="rounded-2xl bg-white/20 p-2 backdrop-blur-sm ring-1 ring-white/25">
              <Compass className="h-5 w-5 text-white" />
            </div>
          </div>

          <LocationDisplay />

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchEnter();
                }
              }}
              placeholder="Rechercher un service Yabiso..."
              className="h-12 rounded-2xl border-0 bg-white pl-10 text-slate-900 placeholder:text-slate-500 shadow-inner"
            />
          </div>

          {searchQuery.trim().length > 0 && (
            <div className="mt-2 max-h-56 overflow-y-auto rounded-2xl border border-white/35 bg-white/95 p-1 shadow-lg">
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => openSearchResult(result)}
                    className="flex w-full items-start justify-between rounded-xl px-3 py-2 text-left hover:bg-[#EAF2FF]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#003366]">{result.title}</p>
                      <p className="text-xs text-slate-600 line-clamp-1">{result.subtitle}</p>
                    </div>
                    <span className="rounded-full bg-[#EAF2FF] px-2 py-0.5 text-[10px] font-semibold text-[#003366]">
                      {result.type === 'offer' ? 'Offre' : 'Catégorie'}
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-xs font-medium text-slate-600">
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
          className="relative h-[78vh] overflow-hidden rounded-3xl border border-[#003366]/15 shadow-[0_22px_58px_-24px_rgba(0,51,102,0.5)]"
        >
          <iframe
            title="Carte locale"
            src={mapEmbedUrl}
            className="absolute inset-0 h-full w-full saturate-[0.85] brightness-[1.12] contrast-[0.92] hue-rotate-[170deg]"
            loading="lazy"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#003366]/18 via-[#003366]/06 to-[#003366]/12" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,204,0,0.22),transparent_38%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,136,0,0.14),transparent_35%)]" />

          <div className="absolute left-3 right-3 top-3 z-20 space-y-2">
            <div className="overflow-x-auto pb-1">
              <div className="flex w-max gap-2">
                {displayedCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => router.push(category.route)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#FFCC00]/50 bg-[#003366]/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {category.name}
                    </button>
                  );
                })}
                {displayedCategories.length === 0 && (
                  <p className="rounded-full bg-[#003366]/70 px-3 py-1.5 text-xs text-white/90">Aucune catégorie trouvée.</p>
                )}
              </div>
            </div>
          </div>

          <div className="absolute left-1/2 top-1/2 z-20 w-[min(92%,430px)] -translate-x-1/2 -translate-y-1/2">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-[0_22px_60px_-26px_rgba(0,51,102,0.65)] backdrop-blur"
            >
              <button
                type="button"
                onClick={() => router.push(activeOffer.route)}
                className="group relative block w-full"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeOffer.id}
                    src={activeOffer.image}
                    alt="Publication"
                    initial={{ x: 80, opacity: 0.6 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -80, opacity: 0.4 }}
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                    className="h-72 w-full object-cover"
                  />
                </AnimatePresence>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              </button>

              <div className="px-3 pt-2">
                <p className="text-sm font-semibold text-[#003366]">{activeOffer.title}</p>
                <p className="mt-1 text-xs text-slate-600">{activeOffer.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {activeOffer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#EAF2FF] px-2 py-0.5 text-[10px] font-semibold text-[#003366]"
                    >
                      {tag}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => router.push(activeOffer.route)}
                    className="rounded-full bg-[#003366] px-3 py-0.5 text-[10px] font-semibold text-white hover:bg-[#014A8A]"
                  >
                    {activeOffer.ctaLabel}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-3 text-[#003366]">
                  <button
                    type="button"
                    aria-label="Aimer"
                    onClick={toggleLike}
                    className="transition hover:text-[#FF8800]"
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-[#FF8800] text-[#FF8800]' : ''}`} />
                  </button>
                  <button
                    type="button"
                    aria-label="Partager"
                    onClick={handleShareOffer}
                    className="transition hover:text-[#FF8800]"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Ajouter aux favoris"
                  onClick={toggleFavorite}
                  className="text-[#003366] transition hover:text-[#FF8800]"
                >
                  <Bookmark className={`h-5 w-5 ${isFavorite ? 'fill-[#FF8800] text-[#FF8800]' : ''}`} />
                </button>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-3 left-3 z-20 rounded-xl bg-[#003366]/80 px-3 py-2 text-xs text-white backdrop-blur">
            <div className="mb-0.5 inline-flex items-center gap-1 text-[#FFCC00]">
              <MapPin className="h-3.5 w-3.5" />
              Position actuelle
            </div>
            <p>
              {locationError
                ? locationError
                : `${mapPosition.lat.toFixed(5)}, ${mapPosition.lon.toFixed(5)}`}
            </p>
          </div>
        </motion.section>
      </div>

      <BottomNav />
    </div>
  );
}
