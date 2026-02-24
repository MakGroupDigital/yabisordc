'use client';

import { BottomNav } from "@/components/home/bottom-nav";
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrdersPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-transparent">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#003366]/10">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900">Mes Commandes</h1>
          <p className="text-sm text-gray-500 mt-1">Suivi de vos commandes en cours et passées</p>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="h-full overflow-y-scroll scrollbar-hide overscroll-none pt-24 pb-24">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Empty State */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune commande</h2>
            <p className="text-gray-500 text-center mb-6">
              Vous n'avez pas encore passé de commande. Explorez nos services pour commencer.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-[#003366] to-[#0A6AB8] text-white rounded-xl font-semibold hover:opacity-95 transition-all">
              Explorer les services
            </button>
          </motion.div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
