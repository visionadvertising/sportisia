/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: false,
  // Forțează generarea unui build ID static pentru a evita problemele cu chunks
  generateBuildId: async () => {
    // Folosim un build ID static în loc de timestamp pentru a evita cache issues
    return 'production-build';
  },
  // Configurație minimă - lăsăm Next.js să gestioneze chunks-urile
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

module.exports = nextConfig
