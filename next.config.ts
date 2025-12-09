import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Note: output: 'export' désactivé car l'app utilise des API routes
  // Pour le déploiement, utiliser Firebase App Hosting ou Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optimisations de performance
  compress: true,
  poweredByHeader: false,
  // Configuration webpack pour Leaflet
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Résoudre les problèmes avec Leaflet côté client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  images: {
    // Optimisations pour les images
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.firebasestorage.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.appspot.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
