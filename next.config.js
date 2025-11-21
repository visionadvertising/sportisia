/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimizări pentru producție
  swcMinify: true,
  // Asigură-te că fișierele statice sunt servite corect
  trailingSlash: false,
  // Nu folosim standalone pe Hostinger - cauzează probleme cu chunks
  // output: 'standalone',
  // Fix pentru ChunkLoadError - dezactivează optimizările care pot cauza probleme
  experimental: {
    // Dezactivează optimizările care pot cauza probleme cu chunks
    optimizeCss: false,
  },
  // Asigură-te că chunk-urile sunt generate corect
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    // Simplifică chunk-urile pentru a evita problemele de loading
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
          },
        },
      };
    }
    return config;
  },
}

module.exports = nextConfig


