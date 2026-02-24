import type { ReactNode } from 'react';

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="home-unified relative min-h-screen bg-[#F5F8FD]">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#FFCC00]/18 blur-3xl" />
        <div className="absolute top-40 -right-24 h-96 w-96 rounded-full bg-[#003366]/12 blur-3xl" />
        <div className="absolute bottom-10 -left-24 h-80 w-80 rounded-full bg-[#FF8800]/12 blur-3xl" />
      </div>
      {children}
    </div>
  );
}
