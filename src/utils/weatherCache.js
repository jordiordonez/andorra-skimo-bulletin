// Weather caching utility to reduce API calls
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const CACHE_KEY = 'andorra_skimo_weather_cache';

// Load cache from localStorage
const loadCache = () => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      const cache = JSON.parse(stored);
      // Check if cache is still valid
      if (cache.timestamp && Date.now() - cache.timestamp < CACHE_DURATION) {
        console.log('Using cached weather data (saved API calls!)');
        return cache;
      }
    }
  } catch (error) {
    console.warn('Failed to load weather cache:', error);
  }
  return null;
};

// Save cache to localStorage
const saveCache = (data) => {
  try {
    const cache = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    console.log('Weather data cached for 15 minutes');
  } catch (error) {
    console.warn('Failed to save weather cache:', error);
  }
};

// Clear expired cache
const clearCache = () => {
  localStorage.removeItem(CACHE_KEY);
};

// Check if cache is valid
const isCacheValid = (cache) => {
  return cache &&
         cache.timestamp &&
         cache.data &&
         (Date.now() - cache.timestamp < CACHE_DURATION);
};

export { loadCache, saveCache, clearCache, isCacheValid };