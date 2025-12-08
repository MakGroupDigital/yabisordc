export interface Place {
  id: string;
  nom: string;
  description: string;
  images: string[];
  prix: number;
  ville: string;
  categorie: 'Nature' | 'Hôtel' | 'Histoire' | string;
}

export interface User {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  phoneNumber?: string | null;
  role?: 'user' | 'admin';
}

export interface PostMedia {
  type: 'image' | 'video';
  url: string;
}

export interface Post {
  id: string;
  author: string;
  authorId: string;
  location: string;
  avatarUrl: string;
  media: PostMedia[];
  caption: string;
  likes: number;
  comments: number;
  favorites?: number;
  shares?: number;
  views?: number;
  createdAt: Date;
  updatedAt?: Date;
}
