module.exports = {
  reactStrictMode: true,
  // Configurație simplificată pentru Hostinger
  swcMinify: true,
  // Asigură că assetPrefix este gol
  assetPrefix: '',
  // Configurație webpack pentru a preveni problemele cu chunks
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    // Optimizare pentru chunks
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
        },
      },
    };
    return config;
  },
}
