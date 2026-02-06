import { getDangerLevel, getSnowRating } from '../utils/routeRanking';
import { useState } from 'react';

const Legend = ({ isOpen, onToggle }) => {
  const [showTerrainInfo, setShowTerrainInfo] = useState(false);
  const [showSnowInfo, setShowSnowInfo] = useState(false);
  const [showMethodologyImage, setShowMethodologyImage] = useState(false);

  const dangerLevels = [
    { rating: 4, description: 'Good conditions', detail: 'Low terrain complexity + Low avalanche risk' },
    { rating: 3, description: 'Caution required', detail: 'Moderate terrain complexity or Moderate avalanche risk' },
    { rating: 2, description: 'High caution required', detail: 'High terrain complexity or High avalanche risk' },
    { rating: 1, description: 'Dangerous conditions', detail: 'Very high terrain complexity + High avalanche risk' },
    { rating: 0, description: 'Too dangerous', detail: 'Extreme terrain complexity + Very high avalanche risk' }
  ];

  const snowLevels = [
    { rating: 5, description: '25+ cm snow depth', detail: 'At least 25cm at lowest altitude and orientation' },
    { rating: 4, description: '20+ cm snow depth', detail: 'At least 20cm at lowest altitude and orientation' },
    { rating: 3, description: '15+ cm snow depth', detail: 'At least 15cm at lowest altitude and orientation' },
    { rating: 2, description: '10+ cm snow depth', detail: 'At least 10cm at lowest altitude and orientation' },
    { rating: 1, description: '5+ cm snow depth', detail: 'At least 5cm at lowest altitude and orientation' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <button
        onClick={onToggle}
        className="w-full p-4 text-left font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
      >
        📚 Methodology & Data Sources {isOpen ? '▼' : '▶'}
      </button>

      {isOpen && (
        <div className="p-4 border-t space-y-6">
          {/* Danger Levels */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-700">Safety Levels</h3>
              <button
                onClick={() => setShowTerrainInfo(!showTerrainInfo)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                ℹ️ How we calculate this
              </button>
            </div>

            {showTerrainInfo && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="text-xs text-gray-700 mb-2">
                  <strong>Assessment Method:</strong> We combine terrain complexity (relief) with current avalanche risk following
                  <button
                    onClick={() => setShowMethodologyImage(!showMethodologyImage)}
                    className="text-blue-600 hover:underline ml-1 underline cursor-pointer"
                  >
                    Avalanche Canada's methodology
                    <span className="ml-1">{showMethodologyImage ? '▼' : '▶'}</span>
                  </button>
                </div>

                {/* Methodology Image */}
                {showMethodologyImage && (
                  <div className="mb-3 w-full">
                    <img
                      src={`${import.meta.env.BASE_URL}assets/avaluator.jpg`}
                      alt="Avalanche Canada Methodology"
                      className="w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div
                      className="hidden w-full p-4 bg-gray-100 rounded-lg border border-gray-200 text-center text-sm text-gray-600"
                    >
                      📷 Avalanche Canada methodology image not found
                      <br />
                      <span className="text-xs">Place avaluator.jpg in public/assets/ directory</span>
                    </div>
                  </div>
                )}
                <div className="text-xs text-gray-600 mb-2">
                  <strong>Terrain Complexity:</strong> Steepness, exposure, terrain traps, escape routes, and technical difficulty of the relief.
                </div>
                <div className="text-xs text-gray-600">
                  <strong>Avalanche Risk:</strong> Current bulletin conditions from
                  <a href="https://www.meteo.ad/estatneu" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                    meteo.ad
                  </a>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {dangerLevels.map(({ rating, description, detail }) => {
                const danger = getDangerLevel(rating);
                return (
                  <div key={rating} className="flex items-start space-x-3 text-sm">
                    <span className={`${danger.color} font-mono text-lg mt-0.5`}>{danger.icon}</span>
                    <div>
                      <div className="text-gray-800 font-medium">{description}</div>
                      <div className="text-xs text-gray-500">{detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Snow Quantity */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-700">Snow Quantity</h3>
              <button
                onClick={() => setShowSnowInfo(!showSnowInfo)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                ℹ️ How we measure this
              </button>
            </div>

            {showSnowInfo && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="text-xs text-gray-700 mb-2">
                  <strong>Snow Depth Assessment:</strong> We consider the snow height at the lowest altitude and most unfavorable orientation of each route.
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  <strong>Data Sources:</strong>
                  <a href="https://www.meteo.ad/estatneu" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                    meteo.ad snow depth data
                  </a> and
                  <a href="https://visor.allaus.ad" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                    visor.allaus.ad route profiles
                  </a>
                </div>
                <div className="text-xs text-gray-600">
                  <strong>Conservative Approach:</strong> We use the most challenging conditions for each route to ensure safety.
                </div>
              </div>
            )}

            <div className="space-y-2">
              {snowLevels.map(({ rating, description, detail }) => {
                const snow = getSnowRating(rating);
                return (
                  <div key={rating} className="flex items-start space-x-3 text-sm">
                    <span className="font-mono text-lg mt-0.5">{snow.snowflakes || '❄️'}</span>
                    <div>
                      <div className="text-gray-800 font-medium">{description}</div>
                      <div className="text-xs text-gray-500">{detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exposed Slopes */}
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Exposed Slopes</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-lg">⚠️</span>
                <div>
                  <div className="text-gray-800 font-medium">Exposed slopes detected</div>
                  <div className="text-xs text-gray-500">Route has problematic slope orientations</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-mono text-lg">✅</span>
                <div>
                  <div className="text-gray-800 font-medium">Safe orientation</div>
                  <div className="text-xs text-gray-500">No problematic exposed slopes detected</div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="border-t pt-3">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Data Sources</h3>
            <div className="space-y-1 text-xs">
              <div>
                🌐 <a href="https://www.meteo.ad/estatneu" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  meteo.ad
                </a> - Official Andorra avalanche bulletins and snow data
              </div>
              <div>
                🗺️ <a href="https://visor.allaus.ad" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  visor.allaus.ad
                </a> - ATES terrain classification and route profiles
              </div>
              <div>
                🌤️ <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  open-meteo.com
                </a> - Real-time weather data at 2000m elevation
              </div>
            </div>
          </div>

          {/* Methodology */}
          <div className="text-xs text-gray-500 border-t pt-2">
            Routes ranked by: Recommended Rating → Safety Level → Snow Quantity → Wind Safety
          </div>
        </div>
      )}
    </div>
  );
};

export default Legend;
