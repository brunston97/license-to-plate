export const MOBILE_WIDTH_CUTOFF = 768
export const PLATE_YEAR = '2025'
export const BUCKET_URL = import.meta.env.DEV
  ? `api/images`
  : `https://storage.googleapis.com/license-to-plate-plates/plates_${PLATE_YEAR}`
export const API_URL = import.meta.env.DEV
  ? `http://localhost:${import.meta.env.VITE_PORT ?? 8080}/api`
  : `https://server-186646240494.us-central1.run.app/api`
export const MAX_FLEET_SIZE = 4
