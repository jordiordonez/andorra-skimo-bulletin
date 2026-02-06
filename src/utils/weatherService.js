// Weather service for fetching Open-Meteo data at 2000m elevation
const weatherPoints = {
  zona_nord: { lat: 42.49, lon: 1.53, elevation: 2000 },
  zona_centre: { lat: 42.42, lon: 1.50, elevation: 2000 },
  zona_sud: { lat: 42.35, lon: 1.39, elevation: 2000 }
};

// Weather code interpretations
const weatherCodes = {
  0: '☀️ Clear',
  1: '🌤️ Mainly clear',
  2: '⛅ Partly cloudy',
  3: '☁️ Overcast',
  45: '🌫️ Foggy',
  48: '🌫️ Rime fog',
  51: '🌦️ Light drizzle',
  53: '🌦️ Drizzle',
  55: '🌧️ Heavy drizzle',
  61: '🌧️ Light rain',
  63: '🌧️ Rain',
  65: '🌧️ Heavy rain',
  71: '❄️ Light snow',
  73: '❄️ Snow',
  75: '❄️ Heavy snow',
  77: '❄️ Snow grains',
  80: '🌦️ Light showers',
  81: '🌧️ Showers',
  82: '⛈️ Heavy showers',
  85: '🌨️ Light snow showers',
  86: '🌨️ Snow showers',
  95: '⛈️ Thunderstorm',
  96: '⛈️ Thunderstorm with hail',
  99: '⛈️ Severe thunderstorm'
};

// Wind direction converter
const getWindDirection = (degrees) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

// Fetch weather for a specific zone
const fetchWeatherForZone = async (zona) => {
  const point = weatherPoints[zona];
  if (!point) {
    console.error(`Unknown zone: ${zona}`);
    return null;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${point.lat}&` +
      `longitude=${point.lon}&` +
      `elevation=${point.elevation}&` +
      `current=temperature_2m,windspeed_10m,winddirection_10m,weathercode&` +
      `daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,weathercode&` +
      `hourly=temperature_2m,windspeed_10m&` +
      `forecast_days=2&` +
      `timezone=Europe/Madrid`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    return formatWeatherData(data, zona);
  } catch (error) {
    console.error(`Error fetching weather for ${zona}:`, error);
    return null;
  }
};

// Format weather data for display
const formatWeatherData = (data, zona) => {
  const current = data.current || {};
  const daily = data.daily || {};
  const hourly = data.hourly || {};

  // Get today and tomorrow indices
  const todayIndex = 0;
  const tomorrowIndex = 1;

  // Find max wind for next 24 hours
  const next24Hours = hourly.windspeed_10m?.slice(0, 24) || [];
  const maxWind = Math.max(...next24Hours);
  const avgWind = next24Hours.reduce((a, b) => a + b, 0) / next24Hours.length;

  return {
    zona,
    current: {
      temperature: Math.round(current.temperature_2m || 0),
      windSpeed: Math.round(current.windspeed_10m || 0),
      windDirection: getWindDirection(current.winddirection_10m || 0),
      weatherCode: current.weathercode || 0,
      weatherText: weatherCodes[current.weathercode] || '❓ Unknown'
    },
    today: {
      tempMax: Math.round(daily.temperature_2m_max?.[todayIndex] || 0),
      tempMin: Math.round(daily.temperature_2m_min?.[todayIndex] || 0),
      precipitation: Math.round(daily.precipitation_sum?.[todayIndex] || 0),
      snowfall: Math.round(daily.snowfall_sum?.[todayIndex] || 0),
      weatherCode: daily.weathercode?.[todayIndex] || 0,
      weatherText: weatherCodes[daily.weathercode?.[todayIndex]] || '❓ Unknown',
      maxWind: Math.round(maxWind),
      avgWind: Math.round(avgWind)
    },
    tomorrow: {
      tempMax: Math.round(daily.temperature_2m_max?.[tomorrowIndex] || 0),
      tempMin: Math.round(daily.temperature_2m_min?.[tomorrowIndex] || 0),
      precipitation: Math.round(daily.precipitation_sum?.[tomorrowIndex] || 0),
      snowfall: Math.round(daily.snowfall_sum?.[tomorrowIndex] || 0),
      weatherCode: daily.weathercode?.[tomorrowIndex] || 0,
      weatherText: weatherCodes[daily.weathercode?.[tomorrowIndex]] || '❓ Unknown'
    },
    lastUpdated: new Date().toISOString()
  };
};

import { loadCache, saveCache, isCacheValid } from './weatherCache';

// Fetch weather for all zones
export const fetchAllWeather = async () => {
  // Check cache first
  const cachedData = loadCache();
  if (cachedData && isCacheValid(cachedData)) {
    return cachedData.data;
  }

  const weatherData = {};

  try {
    console.log('Fetching fresh weather data from Open-Meteo...');

    // Fetch weather for all zones in parallel
    const promises = Object.keys(weatherPoints).map(zona =>
      fetchWeatherForZone(zona)
    );

    const results = await Promise.all(promises);

    // Map results to zones
    Object.keys(weatherPoints).forEach((zona, index) => {
      if (results[index]) {
        weatherData[zona] = results[index];
      }
    });

    console.log('Weather data fetched successfully:', weatherData);

    // Cache the results
    saveCache(weatherData);

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // If fetch fails, try to return stale cache if available
    if (cachedData) {
      console.log('Using stale cache due to fetch error');
      return cachedData.data;
    }
    return weatherData;
  }
};

// Get weather for a specific route
export const getRouteWeather = (weatherData, route) => {
  if (!route?.zona_meteo || !weatherData) {
    return null;
  }
  return weatherData[route.zona_meteo];
};

export default {
  fetchAllWeather,
  getRouteWeather
};