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
}

module.exports = nextConfig


