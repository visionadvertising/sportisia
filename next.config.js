/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimizări pentru producție
  swcMinify: true,
  // Asigură-te că fișierele statice sunt servite corect
  trailingSlash: false,
  // Nu folosim standalone pe Hostinger - cauzează probleme cu chunks
  // output: 'standalone',
  // Dezactivează optimizările care pot cauza probleme cu chunks
  experimental: {
    optimizePackageImports: [],
  },
  // Forțează generarea corectă a chunks-urilor
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Reduce code splitting pentru a evita problemele cu chunks
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
      
      // Reduce code splitting în producție pentru a evita problemele cu chunks
      if (!dev) {
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              default: false,
              vendors: false,
              // Grupează toate chunks-urile într-un singur fișier pentru paginile din app
              app: {
                name: 'app',
                chunks: 'all',
                test: /[\\/]app[\\/]/,
                priority: 20,
              },
              // Grupează node_modules separat
              vendor: {
                name: 'vendor',
                chunks: 'all',
                test: /[\\/]node_modules[\\/]/,
                priority: 10,
              },
            },
          },
        };
      }
    }
    return config;
  },
}

module.exports = nextConfig


