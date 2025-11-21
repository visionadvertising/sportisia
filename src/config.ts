// Configurare API URL
// Pentru development local, folosește proxy-ul din vite.config.ts
// Pentru production, folosește URL-ul complet al backend-ului

const isDevelopment = import.meta.env.DEV
const API_BASE_URL = isDevelopment 
  ? '/api'  // Folosește proxy în development
  : import.meta.env.VITE_API_URL || 'https://api.papayawhip-narwhal-717195.hostingersite.com/api'

export default API_BASE_URL

