/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimizări pentru producție
  swcMinify: true,
  // Asigură-te că fișierele statice sunt servite corect
  trailingSlash: false,
  // Asigură-te că DATABASE_URL este disponibil la runtime
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  // Configurație pentru producție pe Hostinger
  output: 'standalone',
  // Asigură-te că chunk-urile sunt generate corect
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


