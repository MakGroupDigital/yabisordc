'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdsToggleProps {
  onToggle: (showAds: boolean) => void;
  className?: string;
}

export function AdsToggle({ onToggle, className }: AdsToggleProps) {
  const [showAds, setShowAds] = useState(true);

  const handleToggle = () => {
    const newState = !showAds;
    setShowAds(newState);
    onToggle(newState);
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
        showAds
          ? "bg-white/70 text-slate-600 hover:bg-white/90"
          : "border border-[#FF8800] bg-[#FF8800] text-white",
        className
      )}
    >
      {showAds ? (
        <>
          <Eye className="h-4 w-4" />
          <span>Masquer les pubs</span>
        </>
      ) : (
        <>
          <EyeOff className="h-4 w-4" />
          <span>Afficher les pubs</span>
        </>
      )}
    </button>
  );
}
