/** Backend API base URL. Override with VITE_API_URL in .env files. */
export const API_BASE =
  import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
