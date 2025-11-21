module.exports = {
  reactStrictMode: true,
  // Forțează regenerarea completă a build-ului
  generateBuildId: async () => {
    return 'clean-build-' + Date.now()
  },
  // Dezactivează toate optimizările care ar putea folosi cache
  experimental: {
    optimizePackageImports: [],
  },
}
