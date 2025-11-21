/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimizări pentru producție
  swcMinify: true,
  // Asigură-te că fișierele statice sunt servite corect
  trailingSlash: false,
  // Configurație pentru producție pe Hostinger
  output: 'standalone',
  // Fix pentru ChunkLoadError - asigură-te că chunks-urile sunt generate corect
  generateBuildId: async () => {
    // Folosește un build ID consistent pentru a evita problemele cu chunks
    return process.env.BUILD_ID || 'build-' + Date.now();
  },
  // Asigură-te că chunk-urile sunt generate corect
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    // Optimizări pentru chunks - evită problemele cu ChunkLoadError
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Creează un chunk pentru vendor libraries
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Creează chunks separate pentru fiecare page
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }
    return config;
  },
}

module.exports = nextConfig


