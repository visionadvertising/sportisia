/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Optimizări pentru producție
  swcMinify: true,
  // Asigură-te că fișierele statice sunt servite corect
  trailingSlash: false,
  // NOTĂ: env din next.config.js este doar pentru build time, nu pentru runtime
  // Pentru runtime, variabilele trebuie setate în environment-ul serverului
  // Configurație pentru producție pe Hostinger
  // output: 'standalone', // Comentat - poate cauza probleme pe Hostinger
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


