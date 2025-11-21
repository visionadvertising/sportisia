/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Dezactivează cache-ul pentru a forța actualizarea
  generateEtags: false,
  poweredByHeader: false,
  // Forțează regenerarea build-ului
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig
