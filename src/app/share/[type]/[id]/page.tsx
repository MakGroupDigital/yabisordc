'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Données statiques pour les différents types d'éléments
const dataStore: Record<string, Record<string, any>> = {
  // Hôpitaux
  hopital: {
    '1': { nom: 'Hôpital Général de Kinshasa', redirect: '/home/explorer/urgence-medicale' },
    '2': { nom: 'Centre Hospitalier Monkole', redirect: '/home/explorer/urgence-medicale' },
    '3': { nom: 'Hôpital Biamba Marie Mutombo', redirect: '/home/explorer/urgence-medicale' },
    '4': { nom: 'Clinique Ngaliema', redirect: '/home/explorer/urgence-medicale' },
    '5': { nom: 'Hôpital Central de Goma', redirect: '/home/explorer/urgence-medicale' },
  },
  // Restaurants
  restaurant: {
    '1': { nom: 'Restaurant Le Roi', redirect: '/home/explorer/restauration' },
    '2': { nom: 'La Terrasse', redirect: '/home/explorer/restauration' },
    '3': { nom: 'Mbote Restaurant', redirect: '/home/explorer/restauration' },
    '4': { nom: 'Pizza Express', redirect: '/home/explorer/restauration' },
    '5': { nom: 'Restaurant Nganda', redirect: '/home/explorer/restauration' },
  },
  // Sites touristiques
  site: {
    '1': { nom: 'Parc National des Virunga', redirect: '/home/explorer/site-touristique' },
    '2': { nom: 'Parc National de la Salonga', redirect: '/home/explorer/site-touristique' },
    '3': { nom: 'Lac Kivu', redirect: '/home/explorer/site-touristique' },
    '4': { nom: 'Chutes de Zongo', redirect: '/home/explorer/site-touristique' },
    '5': { nom: 'Monument de l\'Échangeur', redirect: '/home/explorer/site-touristique' },
    '6': { nom: 'Jardin Botanique de Kinshasa', redirect: '/home/explorer/site-touristique' },
    '7': { nom: 'Académie des Beaux-Arts', redirect: '/home/explorer/site-touristique' },
    '8': { nom: 'Stade des Martyrs', redirect: '/home/explorer/site-touristique' },
  },
  // Hébergements
  hebergement: {
    '1': { nom: 'Hôtel Grand Kivu', redirect: '/home/explorer/hebergement' },
    '2': { nom: 'Auberge du Lac', redirect: '/home/explorer/hebergement' },
    '3': { nom: 'Lodge Safari', redirect: '/home/explorer/hebergement' },
    '4': { nom: 'Hôtel Président', redirect: '/home/explorer/hebergement' },
  },
  // Appartements
  appartement: {
    'apt1': { nom: 'Appartement Moderne Gombe', redirect: '/home/explorer/hebergement' },
    'apt2': { nom: 'Studio Élégant Lingwala', redirect: '/home/explorer/hebergement' },
    'apt3': { nom: 'Appartement Familial Lubumbashi', redirect: '/home/explorer/hebergement' },
    'apt4': { nom: 'Duplex Moderne Goma', redirect: '/home/explorer/hebergement' },
  },
  // Salles de fête
  salle: {
    '1': { nom: 'Salle de Fête Le Palais', redirect: '/home/explorer/salle-fete-jeux' },
    '2': { nom: 'Arcade Zone - Centre de Jeux', redirect: '/home/explorer/salle-fete-jeux' },
    '3': { nom: 'Salle des Fêtes Royal', redirect: '/home/explorer/salle-fete-jeux' },
    '4': { nom: 'Fun Park - Parc de Jeux', redirect: '/home/explorer/salle-fete-jeux' },
    '5': { nom: 'Salle Événementielle Prestige', redirect: '/home/explorer/salle-fete-jeux' },
  },
  // Événements
  evenement: {
    default: { redirect: '/home/explorer/evenements' },
  },
  // Police
  police: {
    default: { redirect: '/home/explorer/securite' },
  },
};

export default function ShareRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const [message, setMessage] = useState('Redirection en cours...');
  
  const type = params.type as string;
  const id = params.id as string;

  useEffect(() => {
    // Stocker l'ID dans le localStorage pour le récupérer sur la page de destination
    if (typeof window !== 'undefined') {
      localStorage.setItem('shared_item_type', type);
      localStorage.setItem('shared_item_id', id);
    }

    // Trouver la redirection appropriée
    const typeData = dataStore[type];
    if (typeData) {
      const itemData = typeData[id] || typeData['default'];
      if (itemData) {
        setMessage(`Ouverture de ${itemData.nom || type}...`);
        
        // Rediriger après un court délai
        setTimeout(() => {
          router.replace(`${itemData.redirect}?highlight=${id}`);
        }, 500);
      } else {
        setMessage('Élément non trouvé');
        setTimeout(() => {
          router.replace('/home/explorer');
        }, 1500);
      }
    } else {
      setMessage('Type non reconnu');
      setTimeout(() => {
        router.replace('/home/explorer');
      }, 1500);
    }
  }, [type, id, router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        {/* Logo */}
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#FF8800] to-[#FF6600] rounded-2xl flex items-center justify-center">
          <span className="text-3xl font-bold text-white">YB</span>
        </div>
        
        {/* Spinner */}
        <Loader2 className="h-8 w-8 animate-spin text-[#FF8800] mx-auto" />
        
        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">Ya Biso RDC</h1>
          <p className="text-gray-400">{message}</p>
        </div>
      </div>
    </div>
  );
}

