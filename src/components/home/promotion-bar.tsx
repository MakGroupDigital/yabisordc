'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromotionCard {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  iconBgColor: string;
}

interface PromotionBarProps {
  cards: PromotionCard[];
  onCardClick?: (cardId: string) => void;
  onSearchChange?: (query: string) => void;
}

export function PromotionBar({ cards, onCardClick, onSearchChange }: PromotionBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkScroll();
  }, []);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="px-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Restaurant, service, lieu..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearchChange?.(e.target.value);
            }}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-full text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative group">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
        )}

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-4 px-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth' }}
        >
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onCardClick?.(card.id)}
                className="flex-shrink-0 w-40 snap-start cursor-pointer group/card"
              >
                <div
                  className={cn(
                    'relative overflow-hidden rounded-3xl p-4 h-48',
                    `bg-gradient-to-br ${card.gradient}`,
                    'flex flex-col justify-between transition-all duration-300 group-hover/card:scale-105 group-hover/card:shadow-2xl'
                  )}
                >
                  {/* Icon at top */}
                  <div className="flex justify-end">
                    <div className={cn('rounded-full p-2', card.iconBgColor)}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Text content at bottom */}
                  <div className="flex flex-col justify-end">
                    <h3 className="font-bold text-base text-white leading-tight mb-1">
                      {card.title}
                    </h3>
                    <p className="text-xs text-white opacity-90 leading-snug">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        )}
      </div>
    </div>
  );
}
