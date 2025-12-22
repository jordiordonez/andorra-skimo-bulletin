// Data loading utilities for static JSON/CSV files with proxy-aware paths

const buildPathCandidates = (relativePath, absoluteFallbacks = []) => {
  const candidates = new Set();
  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  );

  // Always try live GitHub sources first (raw → GitHub Pages), which update when the repo data updates.
  absoluteFallbacks.forEach(url => candidates.add(url));

  // Only fall back to bundled /public data when developing locally; production skips baked assets to avoid staleness.
  if (isLocalhost) {
    const bases = [];
    const path = typeof window !== 'undefined' ? window.location.pathname : '';

    if (path.startsWith('/skimo')) bases.push('/skimo');
    if (path.startsWith('/andorra-skimo-bulletin')) bases.push('/andorra-skimo-bulletin');
    bases.push(''); // direct relative path in dev server

    bases.forEach(base => {
      const sep = relativePath.startsWith('/') ? '' : '/';
      candidates.add(`${base}${sep}${relativePath}`);
    });
  }

  return [...candidates];
};

const withCacheBust = (url) => `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`;

const GH_RAW_BASE = 'https://raw.githubusercontent.com/jordiordonez/andorra-skimo-bulletin/main';
const GH_PAGES_BASE = 'https://jordiordonez.github.io/andorra-skimo-bulletin';

const fetchWithFallbacks = async (paths) => {
  for (const path of paths) {
    try {
      const response = await fetch(withCacheBust(path), { cache: 'no-store' });
      if (response.ok) return response;
    } catch (error) {
      console.warn(`Fetch failed for ${path}:`, error);
    }
  }
  throw new Error(`All fetch attempts failed for: ${paths.join(', ')}`);
};

export const loadButlletiData = async () => {
  try {
    const response = await fetchWithFallbacks(buildPathCandidates('data/butlleti_allaus.json', [
      `${GH_RAW_BASE}/data/butlleti_allaus.json`,
      `${GH_PAGES_BASE}/data/butlleti_allaus.json`
    ]));
    return await response.json();
  } catch (error) {
    console.error('Error loading butlleti data:', error);
    return null;
  }
};

export const loadVisorData = async () => {
  try {
    const response = await fetchWithFallbacks(buildPathCandidates('data/visor_allaus.json', [
      `${GH_RAW_BASE}/data/visor_allaus.json`,
      `${GH_PAGES_BASE}/data/visor_allaus.json`
    ]));
    return await response.json();
  } catch (error) {
    console.error('Error loading visor data:', error);
    return null;
  }
};

export const loadRoutesCSV = async () => {
  try {
    const response = await fetchWithFallbacks(buildPathCandidates('data/routes.csv', [
      `${GH_RAW_BASE}/data/routes.csv`,
      `${GH_PAGES_BASE}/data/routes.csv`
    ]));
    const text = await response.text();
    console.log(`Successfully loaded routes from: ${response.url}`);
    return parseCSV(text, ';');
  } catch (error) {
    console.error('Error loading routes CSV:', error);
    return null;
  }
};

export const loadRatingsCSV = async () => {
  try {
    // Generate potential filenames for the last 7 days, starting from today
    const fileNames = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      fileNames.push(`butlleti_${year}_${month}_${day}.csv`);
    }

    for (const name of fileNames) {
      try {
        const response = await fetchWithFallbacks(buildPathCandidates(`data/${name}`, [
          `${GH_RAW_BASE}/data/${name}`,
          `${GH_PAGES_BASE}/data/${name}`
        ]));
        const text = await response.text();
        console.log(`Successfully loaded bulletin from: ${response.url}`);
        return parseCSV(text, ',');
      } catch (e) {
        continue;
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
