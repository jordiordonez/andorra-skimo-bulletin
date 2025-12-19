// Data loading utilities for static JSON files

export const loadButlletiData = async () => {
  try {
    const response = await fetch('/data/butlleti_allaus.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading butlleti data:', error);
    return null;
  }
};

export const loadVisorData = async () => {
  try {
    const response = await fetch('/data/visor_allaus.json');
    return await response.json();
  } catch (error) {
    console.error('Error loading visor data:', error);
    return null;
  }
};

export const loadRoutesCSV = async () => {
  try {
    // Try multiple path configurations for different deployment scenarios
    const possiblePaths = [
      // Direct proxy access (joasolucions.com/skimo)
      '/skimo/data/routes.csv',
      // GitHub Pages direct access
      '/andorra-skimo-bulletin/data/routes.csv',
      // Local development
      '/data/routes.csv',
      // Fallback absolute GitHub URL
      'https://jordiordonez.github.io/andorra-skimo-bulletin/data/routes.csv'
    ];

    for (const path of possiblePaths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          const text = await response.text();
          console.log(`Successfully loaded routes from: ${path}`);
          return parseCSV(text, ';'); // Semicolon separator
        }
      } catch (e) {
        continue;
      }
    }

    console.error('Routes CSV file not found');
    return null;
  } catch (error) {
    console.error('Error loading routes CSV:', error);
    return null;
  }
};

export const loadRatingsCSV = async () => {
  try {
    // Try to find the most recent bulletin CSV file
    const possibleFiles = [
      '/andorra-skimo-bulletin/data/butlleti_2025_12_19.csv',
      '/andorra-skimo-bulletin/data/butlleti_2025_12_18.csv',
      '/andorra-skimo-bulletin/data/butlleti_2025_12_17.csv',
      // Fallback for local development
      '/data/butlleti_2025_12_19.csv',
      '/data/butlleti_2025_12_18.csv',
      '/data/butlleti_2025_12_17.csv',
    ];

    for (const file of possibleFiles) {
      try {
        const response = await fetch(file);
        if (response.ok) {
          const text = await response.text();
          console.log(`Successfully loaded bulletin from: ${file}`);
          return parseCSV(text, ',');
        }
      } catch (e) {
        continue; // Try next file
      }
    }

    console.error('No bulletin CSV file found');
    return null;
  } catch (error) {
    console.error('Error loading ratings CSV:', error);
    return null;
  }
};

// Simple CSV parser with configurable separator
const parseCSV = (text, separator = ',') => {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(separator).map(h => h.trim().replace(/"/g, ''));

  return lines.slice(1).map(line => {
    const values = line.split(separator).map(v => v.trim().replace(/"/g, ''));
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  });
};

export const getAllData = async () => {
  const [butlleti, visor, routes, ratings] = await Promise.all([
    loadButlletiData(),
    loadVisorData(),
    loadRoutesCSV(),
    loadRatingsCSV()
  ]);

  // Merge routes with ratings based on route_index_global
  const mergedRoutes = routes ? routes.map(route => {
    const rating = ratings ? ratings.find(r => r.route_index_global === route.route_index_global) : null;
    return {
      ...route,
      route_name: route.name, // Map 'name' field to 'route_name' for consistency
      zona_meteo: route.zone, // Map 'zone' field to 'zona_meteo' for consistency
      ...rating // Merge rating data (rating_neu, rating_perill, rating_vent, rating_final)
    };
  }) : null;

  return {
    butlleti,
    visor,
    routes: mergedRoutes
  };
};