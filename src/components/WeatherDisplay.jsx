const WeatherDisplay = ({ weather }) => {
  if (!weather) {
    return (
      <div className="mt-4 p-4 rounded-xl bg-sky-50 border border-sky-200">
        <div className="text-center text-gray-500 text-sm">
          Weather data unavailable
        </div>
      </div>
    );
  }

  const { current, today, tomorrow } = weather;

  return (
    <div className="mt-4 p-4 rounded-xl bg-sky-50 border border-sky-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-700">🏔️ Weather @ 2000m</div>
        <div className="text-xs text-gray-500">Live data</div>
      </div>

      {/* Main weather info */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {/* Current temp */}
        <div>
          <div className="text-2xl font-bold text-gray-800">{current.temperature}°</div>
          <div className="text-xs text-gray-600">Now</div>
        </div>

        {/* Conditions */}
        <div>
          <div className="text-xl">{current.weatherText.split(' ')[0]}</div>
          <div className="text-xs text-gray-600">
            {current.weatherText.split(' ').slice(1).join(' ')}
          </div>
        </div>

        {/* Wind */}
        <div>
          <div className="text-sm font-semibold text-gray-800">
            {current.windSpeed} km/h
          </div>
          <div className="text-xs text-gray-600">
            Wind {current.windDirection}
          </div>
        </div>
      </div>

      {/* Today's range and snow */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-sky-200">
        <div className="text-sm">
          <span className="text-gray-600">Today: </span>
          <span className="font-semibold text-gray-800">{today.tempMax}°</span>
          <span className="text-gray-600"> / </span>
          <span className="text-gray-700">{today.tempMin}°</span>
          {today.snowfall > 0 && (
            <span className="ml-2 text-blue-600">❄️ {today.snowfall}cm</span>
          )}
        </div>

        <div className="text-sm">
          <span className="text-gray-600">Max wind: </span>
          <span className="font-semibold text-gray-800">{today.maxWind} km/h</span>
        </div>
      </div>

      {/* Tomorrow */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-sky-200">
        <div className="text-sm">
          <span className="text-gray-600">Tomorrow: </span>
          <span className="text-lg">{tomorrow.weatherText.split(' ')[0]}</span>
        </div>
        <div className="text-sm text-right">
          <span className="font-semibold text-gray-800">{tomorrow.tempMax}°</span>
          <span className="text-gray-600"> / </span>
          <span className="text-gray-700">{tomorrow.tempMin}°</span>
          {tomorrow.snowfall > 0 && (
            <span className="ml-2 text-blue-600">❄️ {tomorrow.snowfall}cm</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;