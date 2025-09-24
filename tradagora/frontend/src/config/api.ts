const API_BASE_URL = 'https://takasbende.onrender.com';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    ME: `${API_BASE_URL}/api/auth/me`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
  },
  LISTINGS: {
    BASE: `${API_BASE_URL}/api/listings`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/listings/${id}`,
  },
  OFFERS: {
    BASE: `${API_BASE_URL}/api/offers`,
  },
  MESSAGES: {
    BASE: `${API_BASE_URL}/api/messages`,
    START_FROM_LISTING: `${API_BASE_URL}/api/messages/start-from-listing`,
  },
  USERS: {
    PROFILE: `${API_BASE_URL}/api/users/profile`,
    LISTINGS: `${API_BASE_URL}/api/users/listings`,
    FAVORITES: `${API_BASE_URL}/api/users/favorites`,
  },
  MATCHING: {
    BASE: `${API_BASE_URL}/api/matching`,
  },
};

export default API_BASE_URL;
