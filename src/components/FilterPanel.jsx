import React, { useState, useEffect } from 'react';

const FilterPanel = ({ filters, onFiltersChange, zones, isOpen, onToggle, allRoutes }) => {
  const [showRouteDropdown, setShowRouteDropdown] = useState(false);
  const [showAllRoutes, setShowAllRoutes] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  // Update search value when filters are cleared externally
  useEffect(() => {
    if (!filters.search) {
      setSearchValue('');
    }
  }, [filters.search]);

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
    handleFilterChange('search', value);
    setShowRouteDropdown(value.length > 0 && !showAllRoutes);
  };

  const handleRouteSelect = (routeName) => {
    setSearchValue(routeName);
    handleFilterChange('search', routeName);
    setShowRouteDropdown(false);
    setShowAllRoutes(false);
  };

  const toggleAllRoutes = () => {
    setShowAllRoutes(!showAllRoutes);
    setShowRouteDropdown(false);
  };

  // Check if any filters are active
  const hasActiveFilters = filters.search || (filters.zone && filters.zone !== 'all') || filters.minRatingFinal || filters.minRatingPerill || filters.minRatingNeu;

  // Filter routes based on search term
  const filteredRouteNames = allRoutes
    ? allRoutes
        .filter(route =>
          route.route_name &&
          route.route_name.toLowerCase().includes(searchValue.toLowerCase())
        )
        .map(route => route.route_name)
        .filter((name, index, arr) => arr.indexOf(name) === index) // Remove duplicates
        .slice(0, 10) // Limit to 10 results
    : [];

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
      <div className="flex items-center justify-between p-6">
        <button
          onClick={onToggle}
          className="flex-1 text-left font-bold text-gray-800 hover:bg-blue-50 rounded-xl transition-all duration-300 text-lg p-2"
        >
          🔍 Smart Filters {isOpen ? '▼' : '▶'}
        </button>

        {/* Clear Filters Button - only show when filters are active */}
        {hasActiveFilters && (
          <button
            onClick={() => onFiltersChange({})}
            className="ml-3 px-3 py-2 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            🔄 Clear
          </button>
        )}
      </div>

      {isOpen && (
        <div className="p-6 border-t border-gray-100 space-y-6">
          {/* Search */}
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              🔎 Your Route
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchValue.length > 0 && !showAllRoutes && setShowRouteDropdown(true)}
                onBlur={() => {
                  // Delay hiding dropdown to allow clicking on options
                  setTimeout(() => {
                    setShowRouteDropdown(false);
                    setShowAllRoutes(false);
                  }, 150);
                }}
                placeholder="Type route name..."
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/80"
              />
              <button
                onClick={toggleAllRoutes}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className={`transform transition-transform duration-200 ${showAllRoutes ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
            </div>

            {/* Dropdown with filtered route suggestions */}
            {showRouteDropdown && filteredRouteNames.length > 0 && !showAllRoutes && (
              <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                {filteredRouteNames.map((routeName, index) => (
                  <button
                    key={index}
                    onClick={() => handleRouteSelect(routeName)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100 last:border-b-0 text-sm"
                  >
                    🏔️ {routeName}
                  </button>
                ))}
                {allRoutes && allRoutes.length > 10 && (
                  <div className="px-4 py-2 text-xs text-gray-500 text-center border-t">
                    {allRoutes.filter(route =>
                      route.route_name &&
                      route.route_name.toLowerCase().includes(searchValue.toLowerCase())
                    ).length > 10
                      ? `${allRoutes.filter(route =>
                          route.route_name &&
                          route.route_name.toLowerCase().includes(searchValue.toLowerCase())
                        ).length - 10} more routes available...`
                      : ''}
                  </div>
                )}
              </div>
            )}

            {/* Dropdown with ALL routes */}
            {showAllRoutes && allRoutes && allRoutes.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
                <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs text-gray-600 font-medium">
                  All {allRoutes.length} routes available
                </div>
                {allRoutes
                  .filter(route => route.route_name)
                  .sort((a, b) => a.route_name.localeCompare(b.route_name))
                  .map((route, index) => (
                    <button
                      key={index}
                      onClick={() => handleRouteSelect(route.route_name)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100 last:border-b-0 text-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">🏔️ {route.route_name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {route.zona_meteo && (
                              <span className="mr-3">📍 {route.zona_meteo}</span>
                            )}
                            {route.difficulty && (
                              <span className="mr-3">⚡ {route.difficulty}</span>
                            )}
                            {route.distance && (
                              <span>📏 {route.distance}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-blue-600 font-medium ml-2">
                          {parseFloat(route.rating_final || 0).toFixed(1)}/5
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Zone Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              🗺️ Geographic Zone
            </label>
            <select
              value={filters.zone || 'all'}
              onChange={(e) => handleFilterChange('zone', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
            >
              <option value="all">🌍 All zones</option>
              {zones.map(zone => (
                <option key={zone} value={zone}>📍 {zone}</option>
              ))}
            </select>
          </div>

          {/* Rating Filters */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700">⭐ Minimum Ratings</h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-green-50 p-4 rounded-xl">
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  🏔️ Final Rating
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={filters.minRatingFinal || ''}
                  onChange={(e) => handleFilterChange('minRatingFinal', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0-5"
                />
              </div>

              <div className="bg-orange-50 p-4 rounded-xl">
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  ⚠️ Safety Rating
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={filters.minRatingPerill || ''}
                  onChange={(e) => handleFilterChange('minRatingPerill', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0-5"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-xl">
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  ❄️ Snow Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={filters.minRatingNeu || ''}
                  onChange={(e) => handleFilterChange('minRatingNeu', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0-5"
                />
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default FilterPanel;