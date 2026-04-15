'use client';

import type { ElementType } from 'react';
import Image from 'next/image';
import { startTransition, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleUserRound, LocateFixed, Search, Star, X } from 'lucide-react';
import { BottomNav } from '@/components/home/bottom-nav';
import { useGeolocation } from '@/hooks/useGeolocation';
import { SafeImage } from '@/components/ui/safe-image';
import {
  RestaurantIcon,
  HebergementIcon,
  MobiliteIcon,
  SalleFeteIcon,
  SiteTouristiqueIcon,
  EvenementsIcon,
  UrgenceMedicaleIcon,
  SecuriteIcon,
} from '@/components/home/custom-icons';

interface CategoryShortcut {
  id: string;
  name: string;
  icon: ElementType;
  route: string;
  active?: boolean;
}

interface Recommendation {
  id: string;
  title: string;
  image: string;
  rating: number;
  route: string;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  route: string;
}

const categoryShortcuts: CategoryShortcut[] = [
  { id: 'restos', name: 'Restos', icon: RestaurantIcon, route: '/home/explorer/restauration', active: true },
  { id: 'hebergement', name: 'Hébergement', icon: HebergementIcon, route: '/home/explorer/hebergement' },
  { id: 'events', name: 'Évents', icon: EvenementsIcon, route: '/home/explorer/evenements' },
  { id: 'discover', name: 'Découverte', icon: SiteTouristiqueIcon, route: '/home/explorer/site-touristique' },
  { id: 'culture', name: 'Salle de fête', icon: SalleFeteIcon, route: '/home/explorer/salle-fete-jeux' },
  { id: 'mobilite', name: 'Mobilité', icon: MobiliteIcon, route: '/home/explorer/mobilite' },
  { id: 'urgence', name: 'Urgence', icon: UrgenceMedicaleIcon, route: '/home/explorer/urgence-medicale' },
  { id: 'securite', name: 'Sécurité', icon: SecuriteIcon, route: '/home/explorer/securite' },
];

const heroSlides: Recommendation[] = [
  {
    id: 'hero-1',
    title: 'Découvrez les secrets de la RDC',
    image: '/baniere.png',
    rating: 4.9,
    route: '/home/explorer/site-touristique',
  },
  {
    id: 'hero-2',
    title: 'Paysages époustouflants',
    image: 'https://picsum.photos/800/600?random=1',
    rating: 4.9,
    route: '/home/explorer/site-touristique',
  },
  {
    id: 'hero-3',
    title: 'Montagnes majestueuses',
    image: 'https://picsum.photos/800/600?random=2',
    rating: 4.8,
    route: '/home/explorer/site-touristique',
  },
  {
    id: 'hero-4',
    title: 'Cascades spectaculaires',
    image: 'https://picsum.photos/800/600?random=3',
    rating: 4.9,
    route: '/home/explorer/site-touristique',
  },
  {
    id: 'hero-5',
    title: 'Sommets africains',
    image: 'https://picsum.photos/800/600?random=4',
    rating: 4.8,
    route: '/home/explorer/site-touristique',
  },
  {
    id: 'hero-6',
    title: 'Déserts dorés',
    image: 'https://picsum.photos/800/600?random=5',
    rating: 4.7,
    route: '/home/explorer/site-touristique',
  },
  {
    id: 'hero-7',
    title: 'Savanes sauvages',
    image: 'https://picsum.photos/800/600?random=6',
    rating: 4.9,
    route: '/home/explorer/site-touristique',
  },
  {
    id: 'hero-8',
    title: 'Villes historiques',
    image: 'https://picsum.photos/800/600?random=7',
    rating: 4.6,
    route: '/home/explorer/site-touristique',
  },
];

const recommendations: Recommendation[] = [
  {
    id: 'reco-1',
    title: 'Marché artisanal',
    image: '/explorer-assets/reco-1.jpg',
    rating: 4.9,
    route: '/home/explorer/site-touristique',
  },
  {
    id: 'reco-2',
    title: 'Randonnée nature',
    image: '/explorer-assets/reco-2.jpg',
    rating: 4.9,
    route: '/home/explorer/site-touristique',
  },
  {
    id: 'reco-3',
    title: 'Spectacle urbain',
    image: '/explorer-assets/reco-3.jpg',
    rating: 4.9,
    route: '/home/explorer/evenements',
  },
  {
    id: 'reco-4',
    title: 'Adresse culinaire',
    image: '/explorer-assets/reco-4.jpg',
    rating: 4.8,
    route: '/home/explorer/restauration',
  },
];

const fallbackBannerImages = ['/baniere.png'];

export default function ExplorerPage() {
  const router = useRouter();
  const { location: sharedLocation, requestLocation, hasPermission } = useGeolocation();
  const preparedHeroSlides = useMemo(
    () =>
      heroSlides.map((slide, index) => ({
        ...slide,
        image:
          slide.image && slide.image.trim().length > 0
            ? slide.image
            : fallbackBannerImages[index % fallbackBannerImages.length],
      })),
    []
  );
  const validRecommendations = useMemo(
    () => recommendations.filter((item) => item.image && item.image.trim().length > 0),
    []
  );
  const [activeSlide, setActiveSlide] = useState(preparedHeroSlides[0] ?? heroSlides[0]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const routes = Array.from(
      new Set([
        ...categoryShortcuts.map((item) => item.route),
        ...preparedHeroSlides.map((item) => item.route),
        ...validRecommendations.map((item) => item.route),
        '/home/favorites',
        '/home/orders',
        '/home/reservations',
        '/home/profile',
      ])
    );

    routes.forEach((route) => router.prefetch(route));
  }, [router]);

  useEffect(() => {
    if (preparedHeroSlides.length === 0) return;

    const timer = window.setInterval(() => {
      setActiveSlide((prev) => {
        const currentIndex = preparedHeroSlides.findIndex((slide) => slide.id === prev.id);
        return preparedHeroSlides[(currentIndex + 1) % preparedHeroSlides.length];
      });
    }, 4200);

    return () => window.clearInterval(timer);
  }, [preparedHeroSlides]);

  const searchResults = useMemo<SearchResult[]>(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    const categoryResults = categoryShortcuts
      .filter((item) => item.name.toLowerCase().includes(q))
      .map((item) => ({
        id: item.id,
        title: item.name,
        subtitle: 'Catégorie',
        route: item.route,
      }));

    const recommendationResults = [...preparedHeroSlides, ...validRecommendations]
      .filter((item) => item.title.toLowerCase().includes(q))
      .map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: 'Offre',
        route: item.route,
      }));

    return [...recommendationResults, ...categoryResults].slice(0, 8);
  }, [preparedHeroSlides, searchQuery, validRecommendations]);

  const locationLabel = useMemo(() => {
    if (sharedLocation) {
      return `${sharedLocation.city}, ${sharedLocation.country}`;
    }
    return 'Activer la localisation';
  }, [sharedLocation]);

  const navigateTo = (route: string) => {
    router.prefetch(route);
    startTransition(() => {
      router.push(route);
    });
  };

  const triggerLocation = () => {
    requestLocation();
  };

  const openSearchResult = (result: SearchResult) => {
    setShowSearch(false);
    setSearchQuery('');
    navigateTo(result.route);
  };

  return (
    <div className="min-h-screen bg-[#F6F6F2] pb-24">
      <div className="w-full px-4 pb-6 pt-5 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="mb-5 flex items-center justify-between"
        >
          <button
            type="button"
            onClick={triggerLocation}
            className="inline-flex max-w-[70%] items-center gap-2 rounded-full bg-white px-3 py-2 text-left text-[#0A7AE8] shadow-[0_12px_24px_-18px_rgba(0,51,102,0.55)]"
            aria-label={locationLabel}
          >
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F2F8FF]">
              <LocateFixed className="h-4 w-4" />
            </span>
            <span className="line-clamp-1 text-sm font-medium text-[#1B1B1B]">
              {locationLabel}
            </span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigateTo('/home/profile')}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0A7AE8] shadow-[0_12px_24px_-18px_rgba(0,51,102,0.55)]"
              aria-label="Profil"
            >
              <CircleUserRound className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => setShowSearch(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0A7AE8] shadow-[0_12px_24px_-18px_rgba(0,51,102,0.55)]"
              aria-label="Recherche"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 rounded-[20px] bg-white p-3 shadow-[0_18px_36px_-24px_rgba(0,0,0,0.28)]"
            >
              <div className="flex items-center gap-2 rounded-2xl border border-[#E7EAF0] px-3 py-2">
                <Search className="h-4 w-4 text-[#0A7AE8]" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une offre ou catégorie..."
                  className="flex-1 bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#8A8A8A]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                  }}
                  className="text-[#8A8A8A]"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {searchQuery.trim().length > 0 && (
                <div className="mt-3 space-y-2">
                  {searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        onClick={() => openSearchResult(result)}
                        className="flex w-full items-center justify-between rounded-2xl bg-[#F8F8F5] px-3 py-3 text-left"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#171717]">{result.title}</p>
                          <p className="text-xs text-[#7A7A7A]">{result.subtitle}</p>
                        </div>
                        <span className="rounded-full bg-[#FF8800] px-2 py-1 text-[10px] font-semibold text-white">
                          Aller
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="px-1 py-2 text-sm text-[#7A7A7A]">Aucun resultat.</p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
          onClick={() => navigateTo(activeSlide.route)}
          className="relative block w-full overflow-hidden rounded-[22px] bg-white text-left shadow-[0_20px_40px_-26px_rgba(0,0,0,0.35)]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0.75, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.5, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="relative h-[292px] w-full"
            >
              <Image
                src={activeSlide.image}
                alt={activeSlide.title}
                fill
                priority
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/62 via-black/12 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h1 className="max-w-[78%] text-[25px] font-semibold leading-[1.04] text-white">
              {activeSlide.title}
            </h1>
          </div>
        </motion.button>

        <div className="mt-4 flex items-center justify-center gap-2.5">
          {preparedHeroSlides.map((slide) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveSlide(slide)}
              className={`rounded-full transition-all ${
                slide.id === activeSlide.id ? 'h-3.5 w-3.5 bg-[#FF8800]' : 'h-3 w-3 bg-[#D8D8D8]'
              }`}
              aria-label={slide.title}
            />
          ))}
        </div>

        <div className="mt-6 overflow-x-auto scrollbar-hide">
          <div className="flex w-max gap-4 px-1">
            {categoryShortcuts.map((category) => {
              const Icon = category.icon;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => navigateTo(category.route)}
                  className="flex w-[82px] flex-col items-center"
                >
                  <div
                    className={`flex h-[70px] w-[70px] items-center justify-center rounded-full bg-white shadow-[0_16px_32px_-24px_rgba(0,51,102,0.55)] ${
                      category.active ? 'border-[3px] border-[#FF8800]' : 'border border-[#E7EAF0]'
                    }`}
                  >
                    <Icon className="h-8 w-8 text-[#0A7AE8]" />
                  </div>
                  <span className="mt-2 text-center text-[14px] font-medium leading-tight text-[#1D1D1D]">
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[#171717]">
            Recommandé pour vous
          </h2>

          <div className="mt-4 overflow-x-auto scrollbar-hide">
            <div className="flex w-max gap-4 pb-2">
              {validRecommendations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.route)}
                  className="w-[134px] overflow-hidden rounded-[18px] bg-white text-left shadow-[0_18px_36px_-24px_rgba(0,0,0,0.3)]"
                >
                  <div className="relative">
                    <SafeImage
                      src={item.image}
                      alt={item.title}
                      className="h-[120px] w-full object-cover"
                      fallbackText="Image"
                    />
                    <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full border border-[#FF8800]/35 bg-white px-2 py-1 text-[11px] font-semibold text-[#FF8800] shadow-sm">
                      <Star className="h-3 w-3 fill-[#FF8800] text-[#FF8800]" />
                      {item.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="px-3 pb-4 pt-3">
                    <p className="line-clamp-2 text-[15px] font-semibold leading-[1.02] text-[#171717]">
                      {item.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

      </div>

      <BottomNav />
    </div>
  );
}
