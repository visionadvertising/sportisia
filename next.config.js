module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  // Configurație minimală pentru a evita problemele cu chunks
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}
