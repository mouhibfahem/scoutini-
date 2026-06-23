// Centralized configuration for API Base URL
// Falls back to local server in development, uses environment variable in production
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
