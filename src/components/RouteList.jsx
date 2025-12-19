import RouteCard from './RouteCard';
import { getTopRoutes } from '../utils/routeRanking';

const RouteList = ({ routes, visorData, showTopOnly = false }) => {
  if (!routes || routes.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-2">🏔️</div>
        <p className="text-gray-600">No routes found matching your filters.</p>
      </div>
    );
  }

  const displayRoutes = showTopOnly ? getTopRoutes(routes, 3) : routes;

  return (
    <div className="space-y-4">
      {showTopOnly && (
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-1">🏆 Top 3 Recommended Routes</h2>
          <p className="text-green-100 text-sm">Based on current conditions and ratings</p>
        </div>
      )}

      <div className="grid gap-4">
        {displayRoutes.map((route, index) => (
          <RouteCard
            key={route.route_index_global || index}
            route={route}
            visorData={visorData}
            rank={showTopOnly ? index + 1 : null}
          />
        ))}
      </div>

      {showTopOnly && routes.length > 3 && (
        <div className="text-center">
          <p className="text-white text-sm">
            Showing top 3 of {routes.length} routes. Use filters to see more.
          </p>
        </div>
      )}
    </div>
  );
};

export default RouteList;