// Configurare API URL
// Pentru development local, folosește proxy-ul din vite.config.ts
// Pentru production, folosește URL-ul relativ (același domeniu)

const isDevelopment = import.meta.env.DEV

// În production, folosește URL relativ pentru același domeniu
// .htaccess va face proxy către backend-ul Node.js
const API_BASE_URL = isDevelopment 
  ? '/api'  // Folosește proxy în development
  : '/api'  // Folosește proxy în production (același domeniu)

export default API_BASE_URL
