import { getDangerLevel, getSnowRating } from '../utils/routeRanking';
import WeatherDisplay from './WeatherDisplay';

const RouteCard = ({ route, rank, weather }) => {
  const danger = getDangerLevel(route.rating_perill);
  const snow = getSnowRating(route.rating_neu);

  // Color scales for ratings
  const getRecommendedColor = (rating) => {
    const val = parseFloat(rating || 0);
    if (val >= 4.5) return 'bg-green-500';
    if (val >= 3.5) return 'bg-green-400';
    if (val >= 2.5) return 'bg-yellow-400';
    if (val >= 1.5) return 'bg-orange-400';
    if (val >= 0.5) return 'bg-red-400';
    return 'bg-gray-400';
  };

  const getSafetyColor = (rating) => {
    const val = parseFloat(rating || 0);
    if (val >= 4.5) return 'bg-green-500';
    if (val >= 3.5) return 'bg-yellow-400';
    if (val >= 2.5) return 'bg-orange-400';
    if (val >= 1.5) return 'bg-orange-500';
    if (val >= 0.5) return 'bg-red-500';
    return 'bg-red-600';
  };

  const getSnowColor = (rating) => {
    const val = parseFloat(rating || 0);
    if (val >= 4.5) return 'bg-blue-500';
    if (val >= 3.5) return 'bg-blue-400';
    if (val >= 2.5) return 'bg-sky-400';
    if (val >= 1.5) return 'bg-gray-300';
    if (val >= 0.5) return 'bg-gray-200';
    return 'bg-gray-100';
  };

  const getRecommendedText = (rating) => {
    const val = parseFloat(rating || 0);
    if (val >= 4.5) return 'Top Recommended';
    if (val >= 3.5) return 'Recommended';
    if (val >= 2.5) return 'Acceptable';
    if (val >= 1.5) return 'Not Ideal';
    if (val >= 0.5) return 'Not Recommended';
    return 'Avoid';
  };

  const getSafetyText = (rating) => {
    const val = parseFloat(rating || 0);
    if (val >= 4.5) return 'Very Safe';
    if (val >= 3.5) return 'Safe';
    if (val >= 2.5) return 'Moderate Risk';
    if (val >= 1.5) return 'High Risk';
    if (val >= 0.5) return 'Very High Risk';
    return 'Extreme Risk';
  };

  const getSnowText = (rating) => {
    const val = parseFloat(rating || 0);
    if (val >= 4.5) return 'Excellent';
    if (val >= 3.5) return 'Good';
    if (val >= 2.5) return 'Fair';
    if (val >= 1.5) return 'Poor';
    if (val >= 0.5) return 'Very Poor';
    return 'No Snow';
  };

  const handleRouteClick = async () => {
    // First, copy route name to clipboard and wait for user permission
    if (navigator.clipboard && route.route_name) {
      try {
        await navigator.clipboard.writeText(route.route_name);
        console.log(`Route name "${route.route_name}" copied to clipboard`);

        // Only open the page after clipboard operation succeeds
        window.open('https://visor.allaus.ad', '_blank');
      } catch (error) {
        console.log('Could not copy to clipboard:', error);

        // If clipboard fails, still open the page
        window.open('https://visor.allaus.ad', '_blank');
        alert(`Please manually copy this route name: ${route.route_name}`);
      }
    } else {
      // Fallback for browsers without clipboard support
      window.open('https://visor.allaus.ad', '_blank');
      alert(`Please manually copy this route name: ${route.route_name}`);
    }
  };

  return (
    <div className="group relative bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-500">

      {/* Rank Badge */}
      {rank && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-orange-500 text-white px-4 py-2 rounded-bl-2xl rounded-tr-2xl font-bold text-lg shadow-lg">
            #{rank}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative p-4 sm:p-6 pb-4 bg-blue-50">
        <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                🏔️ {route.route_name || 'Unknown Route'}
              </h3>
              <button
                onClick={handleRouteClick}
                className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all self-start sm:self-auto"
                title="Copy name and open in Visor Allaus"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="hidden sm:inline">See in Visor</span>
                <span className="sm:hidden">Visor</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              {route.zona_meteo && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white">
                  📍 {route.zona_meteo}
                </span>
              )}
              {route.difficulty && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-600 text-white">
                  ⚡ {route.difficulty}
                </span>
              )}
            </div>

            {/* Route Details */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
              {route.distance && (
                <div className="flex items-center space-x-2">
                  <span>📏</span>
                  <span>{route.distance}</span>
                </div>
              )}
              {route.elevation_gain && (
                <div className="flex items-center space-x-2">
                  <span>📈</span>
                  <span>{route.elevation_gain}</span>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Rating Badge */}
          <div className="sm:ml-4 flex-shrink-0">
            <div className={`${getRecommendedColor(route.rating_final)} text-white rounded-full w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center font-bold shadow-lg border-2 border-white`}>
              <div className="text-xl sm:text-2xl">{parseFloat(route.rating_final || 0).toFixed(1)}</div>
              <div className="text-xs opacity-90">/5</div>
            </div>
            <div className="text-xs text-center text-gray-700 mt-1 font-bold max-w-[64px] sm:max-w-[80px] break-words">{getRecommendedText(route.rating_final)}</div>
          </div>
        </div>
      </div>

      {/* Ratings Section */}
      <div className="px-4 sm:px-6 py-4 bg-white">
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {/* Snow Rating */}
          <div className={`text-center p-3 sm:p-4 rounded-xl ${getSnowColor(route.rating_neu)} text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="text-sm sm:text-lg mb-1 sm:mb-2 break-all leading-tight h-8 sm:h-12 flex items-center justify-center overflow-hidden">
                {snow.snowflakes || '❄️'}
              </div>
              <div className="text-xs font-bold opacity-90 mb-1">Snow Quantity</div>
              <div className="text-lg sm:text-2xl font-bold">
                {parseFloat(route.rating_neu || 0).toFixed(1)}/5
              </div>
              <div className="text-xs mt-1 font-medium opacity-90 hidden sm:block">{getSnowText(route.rating_neu)}</div>
            </div>
          </div>

          {/* Safety Level */}
          <div className={`text-center p-3 sm:p-4 rounded-xl ${getSafetyColor(route.rating_perill)} text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className={`text-2xl sm:text-3xl mb-1 sm:mb-2`}>{danger.icon}</div>
              <div className="text-xs font-bold opacity-90 mb-1">Safety Level</div>
              <div className="text-lg sm:text-2xl font-bold">
                {parseFloat(route.rating_perill || 0).toFixed(1)}/5
              </div>
              <div className="text-xs mt-1 font-medium opacity-90 hidden sm:block">{getSafetyText(route.rating_perill)}</div>
            </div>
          </div>
        </div>

        {/* Exposed Slopes - Always show */}
        <div className={`mt-4 p-4 rounded-xl border ${
          route.rating_vent
            ? 'bg-yellow-100 border-yellow-200'
            : 'bg-green-100 border-green-200'
        }`}>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">
              {route.rating_vent ? '⚠️' : '✅'}
            </span>
            <div>
              <div className="text-sm font-semibold text-gray-700">Exposed Slopes</div>
              <div className={`font-bold ${
                route.rating_vent ? 'text-orange-700' : 'text-green-700'
              }`}>
                {route.rating_vent || 'Safe - No problematic exposures'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Display */}
      <div className="px-4 sm:px-6">
        <WeatherDisplay weather={weather} />
      </div>


      {/* Decorative Elements */}
      <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full opacity-50"></div>
      <div className="absolute bottom-4 right-4 w-1 h-1 bg-purple-400 rounded-full opacity-30"></div>
    </div>
  );
};

export default RouteCard;