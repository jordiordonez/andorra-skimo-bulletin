import { getDangerLevel, getSnowRating } from '../utils/routeRanking';

const RouteCard = ({ route, rank }) => {
  const danger = getDangerLevel(route.rating_perill);
  const snow = getSnowRating(route.rating_neu);

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
      <div className="relative p-6 pb-4 bg-blue-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
              🏔️ {route.route_name || 'Unknown Route'}
            </h3>

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
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
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
          <div className="ml-4">
            <div className="bg-green-500 text-white rounded-full w-20 h-20 flex flex-col items-center justify-center font-bold shadow-lg">
              <div className="text-lg">{parseFloat(route.rating_final || 0).toFixed(1)}</div>
              <div className="text-xs opacity-90">/5</div>
            </div>
            <div className="text-xs text-center text-gray-500 mt-1 font-semibold">Recommended</div>
          </div>
        </div>
      </div>

      {/* Ratings Section */}
      <div className="px-6 py-4 bg-white">
        <div className="grid grid-cols-2 gap-6">
          {/* Snow Rating */}
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-lg mb-2 break-all leading-tight h-12 flex items-center justify-center overflow-hidden">
              {snow.snowflakes || '❄️'}
            </div>
            <div className="text-xs font-semibold text-gray-700 mb-1">Snow Quantity</div>
            <div className="text-lg font-bold text-blue-600">
              {parseFloat(route.rating_neu || 0).toFixed(1)}/5
            </div>
          </div>

          {/* Danger Level */}
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <div className={`text-3xl mb-2 ${danger.color}`}>{danger.icon}</div>
            <div className="text-xs font-semibold text-gray-700 mb-1">Safety Level</div>
            <div className="text-lg font-bold text-orange-600">
              {parseFloat(route.rating_perill || 0).toFixed(1)}/5
            </div>
          </div>
        </div>

        {/* Wind Exposure - Always show */}
        <div className={`mt-4 p-4 rounded-xl border ${
          route.rating_vent
            ? 'bg-yellow-100 border-yellow-200'
            : 'bg-green-100 border-green-200'
        }`}>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">
              {route.rating_vent ? '🌬️' : '✅'}
            </span>
            <div>
              <div className="text-sm font-semibold text-gray-700">Wind Exposure</div>
              <div className={`font-bold ${
                route.rating_vent ? 'text-orange-700' : 'text-green-700'
              }`}>
                {route.rating_vent || 'Safe - No problematic winds'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-6 pt-0">
        <button
          onClick={handleRouteClick}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          📋 Click & paste in "Tria una ruta"
        </button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full opacity-50"></div>
      <div className="absolute bottom-4 right-4 w-1 h-1 bg-purple-400 rounded-full opacity-30"></div>
    </div>
  );
};

export default RouteCard;