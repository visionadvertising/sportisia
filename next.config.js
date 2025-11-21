/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimizări pentru producție
  swcMinify: true,
  // Asigură-te că fișierele statice sunt servite corect
  trailingSlash: false,
  // Nu folosim standalone pe Hostinger - cauzează probleme cu chunks
  // output: 'standalone',
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


