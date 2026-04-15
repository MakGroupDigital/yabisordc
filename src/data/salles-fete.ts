import { SalleFete } from '@/types/salle-fete';

export const sallesFete: SalleFete[] = [
  {
    id: 'salle-1',
    name: 'Grand Palais des Fêtes',
    description: 'Magnifique salle de réception avec vue panoramique sur Kinshasa. Parfaite pour les mariages et événements corporatifs.',
    images: [
      'https://picsum.photos/800/600?random=10',
      'https://picsum.photos/800/600?random=11',
      'https://picsum.photos/800/600?random=12'
    ],
    capacity: 500,
    pricePerHour: 150,
    pricePerDay: 2000,
    category: 'mariage',
    amenities: ['Climatisation', 'Système audio', 'Éclairage LED', 'Parking', 'Sécurité'],
    location: {
      address: '123 Avenue de la Paix, Gombe',
      city: 'Kinshasa',
      province: 'Kinshasa',
      region: 'Ouest',
      coordinates: { lat: -4.3317, lng: 15.3139 }
    },
    contact: {
      phone: '+243 81 234 5678',
      email: 'contact@grandpalais.cd',
      whatsapp: '+243 81 234 5678'
    },
    availability: {
      '2026-04-20': true,
      '2026-04-21': false,
      '2026-04-22': true
    },
    rating: 4.8,
    reviews: [
      {
        id: 'rev-1',
        userId: 'user-1',
        userName: 'Marie Kabila',
        rating: 5,
        comment: 'Excellente salle, service impeccable pour notre mariage!',
        date: '2026-03-15'
      }
    ],
    features: {
      parking: true,
      airConditioning: true,
      soundSystem: true,
      lighting: true,
      catering: true,
      decoration: true,
      security: true,
      wifi: true
    },
    rules: [
      'Pas de fumée à l\'intérieur',
      'Musique jusqu\'à 23h maximum',
      'Nettoyage obligatoire après événement'
    ],
    cancellationPolicy: 'Annulation gratuite 48h avant l\'événement',
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-04-01'
  },
  {
    id: 'salle-2',
    name: 'Salle Élégance',
    description: 'Salle moderne et élégante, idéale pour les conférences et événements d\'entreprise.',
    images: [
      'https://picsum.photos/800/600?random=13',
      'https://picsum.photos/800/600?random=14'
    ],
    capacity: 200,
    pricePerHour: 80,
    pricePerDay: 1200,
    category: 'conference',
    amenities: ['Projecteur', 'Wifi haut débit', 'Climatisation', 'Parking'],
    location: {
      address: '456 Boulevard du 30 Juin, Kalamu',
      city: 'Kinshasa',
      province: 'Kinshasa',
      region: 'Ouest'
    },
    contact: {
      phone: '+243 82 345 6789',
      email: 'info@elegance.cd'
    },
    availability: {
      '2026-04-20': true,
      '2026-04-21': true,
      '2026-04-22': false
    },
    rating: 4.5,
    reviews: [],
    features: {
      parking: true,
      airConditioning: true,
      soundSystem: true,
      lighting: true,
      catering: false,
      decoration: false,
      security: true,
      wifi: true
    },
    rules: [
      'Événements professionnels uniquement',
      'Pas de nourriture dans la salle principale'
    ],
    cancellationPolicy: 'Annulation gratuite 24h avant',
    isActive: true,
    createdAt: '2026-01-15',
    updatedAt: '2026-03-20'
  },
  {
    id: 'salle-3',
    name: 'Villa Jardin',
    description: 'Charmante villa avec jardin tropical, parfaite pour les anniversaires et réceptions intimes.',
    images: [
      'https://picsum.photos/800/600?random=15',
      'https://picsum.photos/800/600?random=16',
      'https://picsum.photos/800/600?random=17'
    ],
    capacity: 100,
    pricePerHour: 60,
    pricePerDay: 800,
    category: 'anniversaire',
    amenities: ['Jardin', 'Piscine', 'Barbecue', 'Parking'],
    location: {
      address: '789 Avenue Kasavubu, Lemba',
      city: 'Kinshasa',
      province: 'Kinshasa',
      region: 'Ouest'
    },
    contact: {
      phone: '+243 83 456 7890',
      whatsapp: '+243 83 456 7890'
    },
    availability: {
      '2026-04-20': false,
      '2026-04-21': true,
      '2026-04-22': true
    },
    rating: 4.3,
    reviews: [
      {
        id: 'rev-2',
        userId: 'user-2',
        userName: 'Jean Mukendi',
        rating: 4,
        comment: 'Très bel endroit, jardin magnifique!',
        date: '2026-03-10'
      }
    ],
    features: {
      parking: true,
      airConditioning: false,
      soundSystem: true,
      lighting: true,
      catering: true,
      decoration: false,
      security: false,
      wifi: true
    },
    rules: [
      'Respecter le jardin',
      'Piscine sous surveillance uniquement'
    ],
    cancellationPolicy: 'Annulation gratuite 72h avant',
    isActive: true,
    createdAt: '2026-02-01',
    updatedAt: '2026-04-05'
  },
  {
    id: 'salle-4',
    name: 'Centre Culturel Lumumba',
    description: 'Grand centre culturel avec plusieurs salles modulables pour tous types d\'événements.',
    images: [
      'https://picsum.photos/800/600?random=18',
      'https://picsum.photos/800/600?random=19'
    ],
    capacity: 800,
    pricePerHour: 200,
    pricePerDay: 3000,
    category: 'corporate',
    amenities: ['Scène', 'Système audio professionnel', 'Éclairage scénique', 'Parking VIP'],
    location: {
      address: '321 Avenue Lumumba, Lingwala',
      city: 'Kinshasa',
      province: 'Kinshasa',
      region: 'Ouest'
    },
    contact: {
      phone: '+243 84 567 8901',
      email: 'events@lumumba.cd'
    },
    availability: {
      '2026-04-20': true,
      '2026-04-21': true,
      '2026-04-22': true
    },
    rating: 4.7,
    reviews: [],
    features: {
      parking: true,
      airConditioning: true,
      soundSystem: true,
      lighting: true,
      catering: true,
      decoration: true,
      security: true,
      wifi: true
    },
    rules: [
      'Événements culturels et corporatifs',
      'Respect du matériel scénique'
    ],
    cancellationPolicy: 'Annulation avec frais selon délai',
    isActive: true,
    createdAt: '2026-01-10',
    updatedAt: '2026-04-01'
  },
  {
    id: 'salle-5',
    name: 'Salle Tropicale',
    description: 'Salle avec décoration tropicale, ambiance chaleureuse pour vos réceptions.',
    images: [
      'https://picsum.photos/800/600?random=20'
    ],
    capacity: 150,
    pricePerHour: 70,
    pricePerDay: 1000,
    category: 'reception',
    amenities: ['Décoration incluse', 'Bar', 'Terrasse'],
    location: {
      address: '654 Avenue Tombalbaye, Matete',
      city: 'Kinshasa',
      province: 'Kinshasa',
      region: 'Ouest'
    },
    contact: {
      phone: '+243 85 678 9012'
    },
    availability: {
      '2026-04-20': true,
      '2026-04-21': false,
      '2026-04-22': true
    },
    rating: 4.1,
    reviews: [],
    features: {
      parking: true,
      airConditioning: false,
      soundSystem: true,
      lighting: true,
      catering: true,
      decoration: true,
      security: false,
      wifi: false
    },
    rules: [
      'Décoration fournie uniquement',
      'Pas de modifications de l\'aménagement'
    ],
    cancellationPolicy: 'Annulation gratuite 48h avant',
    isActive: true,
    createdAt: '2026-02-15',
    updatedAt: '2026-03-30'
  }
];

export const categories = [
  { id: 'mariage', name: 'Mariage', icon: '💒' },
  { id: 'conference', name: 'Conférence', icon: '🎤' },
  { id: 'anniversaire', name: 'Anniversaire', icon: '🎂' },
  { id: 'corporate', name: 'Corporate', icon: '🏢' },
  { id: 'reception', name: 'Réception', icon: '🥂' },
  { id: 'autre', name: 'Autre', icon: '🎉' }
];

export const amenities = [
  'Climatisation',
  'Système audio',
  'Éclairage LED',
  'Parking',
  'Sécurité',
  'Wifi',
  'Projecteur',
  'Scène',
  'Bar',
  'Catering',
  'Décoration',
  'Jardin',
  'Piscine',
  'Terrasse'
];