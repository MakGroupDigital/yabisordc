export interface SalleFete {
  id: string;
  name: string;
  description: string;
  images: string[];
  capacity: number;
  pricePerHour: number;
  pricePerDay: number;
  category: 'mariage' | 'conference' | 'anniversaire' | 'corporate' | 'reception' | 'autre';
  amenities: string[];
  location: {
    address: string;
    city: string;
    province: string;
    region: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    email?: string;
    whatsapp?: string;
  };
  availability: {
    [date: string]: boolean; // YYYY-MM-DD format
  };
  rating: number;
  reviews: Review[];
  features: {
    parking: boolean;
    airConditioning: boolean;
    soundSystem: boolean;
    lighting: boolean;
    catering: boolean;
    decoration: boolean;
    security: boolean;
    wifi: boolean;
  };
  rules: string[];
  cancellationPolicy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

export interface SalleReservation {
  id: string;
  salleId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in hours
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  guestCount: number;
  eventType: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalleFilters {
  city?: string;
  province?: string;
  region?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  maxCapacity?: number;
  date?: string;
  amenities?: string[];
  sortBy?: 'price' | 'rating' | 'capacity' | 'name';
  sortOrder?: 'asc' | 'desc';
}