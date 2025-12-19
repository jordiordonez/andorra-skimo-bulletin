// Route ranking and filtering utilities

export const rankRoutes = (routes) => {
  return routes
    .map(route => ({
      ...route,
      rating_final: parseFloat(route.rating_final) || 0,
      rating_perill: parseFloat(route.rating_perill) || 0,
      rating_neu: parseFloat(route.rating_neu) || 0,
      rating_vent: route.rating_vent || ''
    }))
    .sort((a, b) => {
      // 1. Primary: rating_final (highest first)
      if (a.rating_final !== b.rating_final) {
        return b.rating_final - a.rating_final;
      }

      // 2. Secondary: rating_perill (highest first)
      if (a.rating_perill !== b.rating_perill) {
        return b.rating_perill - a.rating_perill;
      }

      // 3. Tertiary: rating_neu (highest first)
      if (a.rating_neu !== b.rating_neu) {
        return b.rating_neu - a.rating_neu;
      }

      // 4. Quaternary: rating_vent (empty first, then alphabetical)
      if (a.rating_vent !== b.rating_vent) {
        if (a.rating_vent === '') return -1;
        if (b.rating_vent === '') return 1;
        return a.rating_vent.localeCompare(b.rating_vent);
      }

      return 0;
    });
};

export const getTopRoutes = (routes, count = 3) => {
  return rankRoutes(routes).slice(0, count);
};

export const filterRoutes = (routes, filters) => {
  return routes.filter(route => {
    // Zone filter
    if (filters.zone && filters.zone !== 'all') {
      if (route.zona_meteo !== filters.zone) return false;
    }

    // Rating filters
    if (filters.minRatingFinal !== undefined) {
      if ((parseFloat(route.rating_final) || 0) < filters.minRatingFinal) return false;
    }

    if (filters.minRatingPerill !== undefined) {
      if ((parseFloat(route.rating_perill) || 0) < filters.minRatingPerill) return false;
    }

    if (filters.minRatingNeu !== undefined) {
      if ((parseFloat(route.rating_neu) || 0) < filters.minRatingNeu) return false;
    }

    // Search by name
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      if (!route.route_name?.toLowerCase().includes(searchTerm)) return false;
    }

    return true;
  });
};

export const getUniqueZones = (routes) => {
  const zones = [...new Set(routes.map(route => route.zona_meteo))];
  return zones.filter(Boolean).sort();
};

// Get danger level icon and color based on rating_perill
export const getDangerLevel = (rating) => {
  const numRating = parseFloat(rating) || 0;

  if (numRating >= 4) return { level: 'ok', icon: '✅', color: 'text-green-600', text: 'OK' };
  if (numRating >= 3) return { level: 'caution', icon: '⚠️', color: 'text-yellow-600', text: 'Be cautious' };
  if (numRating >= 2) return { level: 'very-caution', icon: '⚠️⚠️', color: 'text-orange-600', text: 'Be very cautious' };
  if (numRating >= 1) return { level: 'danger', icon: '⚠️⚠️⚠️', color: 'text-red-600', text: 'Dangerous' };
  return { level: 'too-danger', icon: '❌', color: 'text-red-800', text: 'Too dangerous' };
};

// Get snow rating snowflakes
export const getSnowRating = (rating) => {
  const numRating = Math.round(parseFloat(rating) || 0);
  const snowflakes = '❄️'.repeat(Math.max(0, Math.min(5, numRating)));
  return { snowflakes, count: numRating };
};

// Sort routes by different criteria
export const sortRoutes = (routes, sortBy) => {
  return routes.slice().sort((a, b) => {
    const aFinal = parseFloat(a.rating_final) || 0;
    const bFinal = parseFloat(b.rating_final) || 0;
    const aSafety = parseFloat(a.rating_perill) || 0;
    const bSafety = parseFloat(b.rating_perill) || 0;
    const aSnow = parseFloat(a.rating_neu) || 0;
    const bSnow = parseFloat(b.rating_neu) || 0;

    switch (sortBy) {
      case 'final':
        return bFinal - aFinal; // Highest first

      case 'safety':
        if (bSafety !== aSafety) return bSafety - aSafety; // Highest safety first
        return bFinal - aFinal; // Then by final rating

      case 'snow':
        if (bSnow !== aSnow) return bSnow - aSnow; // Best snow first
        return bFinal - aFinal; // Then by final rating

      case 'wind':
        const aHasWind = !!a.rating_vent;
        const bHasWind = !!b.rating_vent;
        if (aHasWind !== bHasWind) {
          return aHasWind ? 1 : -1; // No wind first
        }
        return bFinal - aFinal; // Then by final rating

      default:
        return bFinal - aFinal;
    }
  });
};