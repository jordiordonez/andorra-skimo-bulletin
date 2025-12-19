import { useState, useEffect } from 'react';
import { getAllData } from './utils/dataLoader';
import { filterRoutes, getUniqueZones, sortRoutes } from './utils/routeRanking';
import FilterPanel from './components/FilterPanel';
import Legend from './components/Legend';
import RouteList from './components/RouteList';

function App() {
  const [data, setData] = useState({
    butlleti: null,
    visor: null,
    routes: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [viewMode, setViewMode] = useState('top3'); // 'top3' or 'all'
  const [sortBy, setSortBy] = useState('final'); // 'final', 'safety', 'snow', 'wind'

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const allData = await getAllData();
        setData(allData);

        if (!allData.routes) {
          setError('Could not load route data');
        }
      } catch (err) {
        setError('Failed to load data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredRoutes = data.routes ? filterRoutes(data.routes, filters) : [];
  const sortedRoutes = filteredRoutes.length > 0 ? sortRoutes(filteredRoutes, sortBy) : [];
  const zones = data.routes ? getUniqueZones(data.routes) : [];
  const bulletinMetadata = data.butlleti?.metadata;

  // Check if any filters are active
  const hasActiveFilters = filters.search || (filters.zone && filters.zone !== 'all') || filters.minRatingFinal || filters.minRatingPerill || filters.minRatingNeu;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏔️</div>
          <div className="text-lg text-gray-600">Loading avalanche data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-900">
      {/* Hero Header */}
      <header className="relative overflow-hidden min-h-screen flex items-center">
        {/* Full-width Hero Background Image */}
        <div className="absolute inset-0 bg-blue-900">
          {/* You can replace this with your hero.png background */}
          <div className="absolute inset-0 bg-[url('/src/assets/hero.png')] bg-cover bg-center bg-no-repeat opacity-30"></div>
          <div className="absolute inset-0 bg-blue-800/40"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-6 py-16 lg:py-20">
          <div className="text-center">
            <h1 className="text-6xl lg:text-8xl font-black mb-8 text-white">
              Andorra Skimo Bulletin
            </h1>
            <p className="text-2xl lg:text-3xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Intelligent avalanche risk assessment and route recommendations
              for the Pyrenees
            </p>

            {/* Stats Bar */}
            <div className="inline-flex bg-white/10 backdrop-blur-md rounded-full px-12 py-6 space-x-12 text-white mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold">{data.routes?.length || 0}</div>
                <div className="text-sm text-blue-200 font-medium">Routes</div>
              </div>
              <div className="w-px bg-white/30 h-12"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">{zones.length}</div>
                <div className="text-sm text-blue-200 font-medium">Zones</div>
              </div>
              <div className="w-px bg-white/30 h-12"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">LIVE</div>
                <div className="text-sm text-blue-200 font-medium">Data</div>
              </div>
            </div>

            {/* Bulletin Info */}
            {bulletinMetadata && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl text-white shadow-lg border border-white/10">
                  <span className="text-2xl">📡</span>
                  <div className="text-left leading-tight">
                    <div className="text-sm uppercase tracking-wide text-blue-200">Updated</div>
                    <div className="text-lg font-semibold">{bulletinMetadata.data_elaboracio || '—'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl text-white shadow-lg border border-white/10">
                  <span className="text-2xl">⏭️</span>
                  <div className="text-left leading-tight">
                    <div className="text-sm uppercase tracking-wide text-blue-200">Next update</div>
                    <div className="text-lg font-semibold">{bulletinMetadata.valid_fins || '—'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll to Routes Button */}
            <button
              onClick={() => {
                document.getElementById('route-explorer').scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
              className="inline-flex items-center space-x-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <span>🏔️ Today's Top Recommended Routes</span>
              <span className="text-xl">↓</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative -mt-8">
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                zones={zones}
                allRoutes={data.routes}
                isOpen={showFilters}
                onToggle={() => setShowFilters(!showFilters)}
              />

              <Legend
                isOpen={showLegend}
                onToggle={() => setShowLegend(!showLegend)}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* View Mode Toggle */}
              <div id="route-explorer" className="mb-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold text-gray-800">Route Explorer</h2>
                    {/* Clear Filters Button - only show when filters are active */}
                    {hasActiveFilters && (
                      <button
                        onClick={() => setFilters({})}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        🔄 Clear Filters
                      </button>
                    )}
                  </div>
                  <div className="flex bg-gray-100 rounded-full p-1">
                    <button
                      onClick={() => setViewMode('top3')}
                      className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                        viewMode === 'top3'
                          ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-700 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      🏔️ Top Picks
                    </button>
                    <button
                      onClick={() => setViewMode('all')}
                      className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                        viewMode === 'all'
                          ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-700 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      🗺️ All Routes
                    </button>
                  </div>
                </div>

                {/* Sorting Controls - Only show when viewing all routes */}
                {viewMode === 'all' && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-semibold text-gray-700">📊 Sort by:</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSortBy('final')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            sortBy === 'final'
                              ? 'bg-green-500 text-white shadow-md transform scale-105'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                          }`}
                        >
                          🏔️ Recommended
                        </button>
                        <button
                          onClick={() => setSortBy('safety')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            sortBy === 'safety'
                              ? 'bg-orange-500 text-white shadow-md transform scale-105'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                          }`}
                        >
                          ⚠️ Safety Level
                        </button>
                        <button
                          onClick={() => setSortBy('snow')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            sortBy === 'snow'
                              ? 'bg-blue-500 text-white shadow-md transform scale-105'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                          }`}
                        >
                          ❄️ Snow Quality
                        </button>
                        <button
                          onClick={() => setSortBy('wind')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            sortBy === 'wind'
                              ? 'bg-green-600 text-white shadow-md transform scale-105'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                          }`}
                        >
                          🌬️ Wind Safe First
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  Showing {filteredRoutes.length} routes with current avalanche conditions
                  {viewMode === 'all' && (
                    <span className="ml-2 text-blue-600 font-medium">
                      • Sorted by {sortBy === 'final' ? 'Recommended' : sortBy === 'safety' ? 'Safety Level' : sortBy === 'snow' ? 'Snow Quality' : 'Wind Safety'}
                    </span>
                  )}
                </div>
              </div>

              {/* Routes */}
              <RouteList
                routes={sortedRoutes}
                visorData={data.visor}
                showTopOnly={viewMode === 'top3'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">
            ⚠️ This tool provides informational data only. Always consult official avalanche bulletins
            and use proper safety equipment when mountaineering.
          </p>
          <p className="text-xs mt-2 text-gray-400">
            Data sources: <a href="https://www.meteo.ad/estatneu" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">meteo.ad</a> • <a href="https://visor.allaus.ad" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">visor.allaus.ad</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
