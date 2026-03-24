'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

const PULL_THRESHOLD = 84;
const MAX_PULL = 110;

export function PullToRefresh({ children }: { children: ReactNode }) {
  const startY = useRef<number | null>(null);
  const dragging = useRef(false);
  const triggered = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const pullDistanceRef = useRef(0);

  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (window.scrollY > 0) return;
      startY.current = event.touches[0]?.clientY ?? null;
      dragging.current = true;
      triggered.current = false;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!dragging.current || startY.current === null || window.scrollY > 0) return;

      const currentY = event.touches[0]?.clientY ?? startY.current;
      const distance = currentY - startY.current;
      if (distance <= 0) {
        pullDistanceRef.current = 0;
        setPullDistance(0);
        return;
      }

      const nextDistance = Math.min(distance * 0.55, MAX_PULL);
      pullDistanceRef.current = nextDistance;
      setPullDistance(nextDistance);

      if (distance > 8) {
        event.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (pullDistanceRef.current >= PULL_THRESHOLD && !triggered.current) {
        triggered.current = true;
        setPullDistance(PULL_THRESHOLD);
        window.location.reload();
        return;
      }

      dragging.current = false;
      startY.current = null;
      pullDistanceRef.current = 0;
      setPullDistance(0);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div className="relative min-h-screen">
      <div
        className="pointer-events-none fixed left-1/2 top-3 z-[70] -translate-x-1/2 transition-all duration-150 md:hidden"
        style={{
          opacity: pullDistance > 0 ? 1 : 0,
          transform: `translateX(-50%) translateY(${Math.min(pullDistance - 28, 18)}px)`,
        }}
      >
        <div className="rounded-full border border-[#003366]/12 bg-white px-4 py-2 text-xs font-semibold text-[#003366] shadow-lg">
          {progress >= 1 ? 'Relachez pour actualiser' : 'Tirez pour actualiser'}
        </div>
      </div>

      <div
        style={{
          transform: pullDistance ? `translateY(${pullDistance}px)` : undefined,
          transition: dragging.current ? 'none' : 'transform 180ms ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
