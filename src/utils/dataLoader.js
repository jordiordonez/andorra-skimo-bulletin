const withCacheBust = (url) => `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`;

export const loadButlletiData = async () => {
  try {
    const response = await fetch(withCacheBust('https://jordiordonez.github.io/andorra-skimo-bulletin/data/butlleti_allaus.json'), { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error loading butlleti data:', error);
    return null;
  }
};

export const loadVisorData = async () => {
  try {
    const response = await fetch(withCacheBust('https://jordiordonez.github.io/andorra-skimo-bulletin/data/visor_allaus.json'), { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error loading visor data:', error);
    return null;
  }
};

export const loadRoutesCSV = async () => {
  try {
    const response = await fetch(withCacheBust('https://jordiordonez.github.io/andorra-skimo-bulletin/data/routes.csv'), { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
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
    // Generate potential filenames for a range of dates (30 days back from today)
    const fileNames = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      fileNames.push({
        name: `butlleti_${year}_${month}_${day}.csv`,
        date: new Date(year, date.getMonth(), date.getDate()),
        dateString: `${day}/${month}/${year}`
      });
    }

    // Try to find the most recent available bulletin file
    let mostRecentData = null;
    let mostRecentDate = null;
    let sourceDate = null;

    for (const fileInfo of fileNames) {
      try {
        const response = await fetch(withCacheBust(`https://jordiordonez.github.io/andorra-skimo-bulletin/data/${fileInfo.name}`), { cache: 'no-store' });
        if (!response.ok) continue;

        const text = await response.text();
        console.log(`Found bulletin file: ${fileInfo.name}`);

        // If this is the first file found, or if it's more recent than our current most recent
        if (!mostRecentDate || fileInfo.date > mostRecentDate) {
          mostRecentData = parseCSV(text, ',');
          mostRecentDate = fileInfo.date;
          sourceDate = fileInfo.dateString;
          console.log(`Using most recent bulletin from: ${fileInfo.name} (${sourceDate})`);
        }
      } catch {
        continue;
      }
    }

    if (!mostRecentData) {
      console.error('No bulletin CSV file found');
      return null;
    }

    return {
      data: mostRecentData,
      sourceDate: sourceDate
    };
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
  const [butlleti, visor, routes, ratingResult] = await Promise.all([
    loadButlletiData(),
    loadVisorData(),
    loadRoutesCSV(),
    loadRatingsCSV()
  ]);

  const ratings = ratingResult?.data ?? null;
  const ratingSourceDate = ratingResult?.sourceDate ?? null;

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
    routes: mergedRoutes,
    ratingSourceDate: ratingSourceDate
  };
};
