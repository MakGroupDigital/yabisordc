'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationPermissionModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  error?: string | null;
}

export function LocationPermissionModal({
  isOpen,
  isLoading,
  onConfirm,
  onCancel,
  error,
}: LocationPermissionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-white relative">
                <button
                  onClick={onCancel}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 rounded-full p-3">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold">Votre localisation</h2>
                </div>
                <p className="text-blue-100 text-sm">
                  Accédez à votre position pour une meilleure expérience
                </p>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-4">
                {error ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Ville et région
                          </p>
                          <p className="text-xs text-gray-500">
                            Découvrez les services près de vous
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Résultats personnalisés
                          </p>
                          <p className="text-xs text-gray-500">
                            Offres adaptées à votre localisation
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Données sécurisées
                          </p>
                          <p className="text-xs text-gray-500">
                            Vos données restent privées et sécurisées
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-3 mt-4">
                      <p className="text-xs text-blue-700">
                        💡 Vous pouvez modifier cette permission à tout moment dans les paramètres de votre navigateur.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Plus tard
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={cn(
                    'flex-1 px-4 py-3 rounded-xl font-medium text-white transition-all',
                    isLoading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg active:scale-95'
                  )}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Localisation...</span>
                    </div>
                  ) : (
                    'Autoriser'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
