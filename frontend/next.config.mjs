/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  devIndicators: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75, 80],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  transpilePackages: ['@bizpockethub/shared'],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@bizpockethub/shared'],
  },
  webpack: (config) => {
    // In-memory cache eliminates Windows NTFS PackFileCacheStrategy file rename collisions and transient EPERM mkdir errors
    config.cache = {
      type: 'memory',
    };
    return config;
  },
  async headers() {
    return [
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=120, stale-while-revalidate=600',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/search',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=15, stale-while-revalidate=60',
          },
        ],
      },
      {
        source: '/business/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/categories/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=180, stale-while-revalidate=600',
          },
        ],
      },
      {
        source: '/countries/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=180, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
