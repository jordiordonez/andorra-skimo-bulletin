import { useState } from 'react';

const RatingLegend = () => {
  const [isOpen, setIsOpen] = useState(false);

  const recommendedScale = [
    { value: '5/5', label: 'Top Recommended', color: 'bg-green-500' },
    { value: '4/5', label: 'Recommended', color: 'bg-green-400' },
    { value: '3/5', label: 'Acceptable', color: 'bg-yellow-400' },
    { value: '2/5', label: 'Not Ideal', color: 'bg-orange-400' },
    { value: '1/5', label: 'Not Recommended', color: 'bg-red-400' },
    { value: '0/5', label: 'Avoid', color: 'bg-gray-400' },
  ];

  const safetyScale = [
    { value: '5/5', label: 'Very Safe', color: 'bg-green-500' },
    { value: '4/5', label: 'Safe', color: 'bg-yellow-400' },
    { value: '3/5', label: 'Moderate Risk', color: 'bg-orange-400' },
    { value: '2/5', label: 'High Risk', color: 'bg-orange-500' },
    { value: '1/5', label: 'Very High Risk', color: 'bg-red-500' },
    { value: '0/5', label: 'Extreme Risk', color: 'bg-red-600' },
  ];

  const snowScale = [
    { value: '5/5', label: 'Excellent', color: 'bg-blue-500' },
    { value: '4/5', label: 'Good', color: 'bg-blue-400' },
    { value: '3/5', label: 'Fair', color: 'bg-sky-400' },
    { value: '2/5', label: 'Poor', color: 'bg-gray-300' },
    { value: '1/5', label: 'Very Poor', color: 'bg-gray-200' },
    { value: '0/5', label: 'No Snow', color: 'bg-gray-100' },
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all duration-300 hover:scale-110"
        title="Show Rating Scales"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>

      {/* Legend Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">📊 Rating Scales Guide</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Recommended Scale */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>🏔️</span> Recommended Rating
                </h3>
                <div className="space-y-2">
                  {recommendedScale.map((item) => (
                    <div key={item.value} className="flex items-center gap-3">
                      <div className={`${item.color} text-white px-3 py-2 rounded-lg min-w-[60px] text-center font-bold`}>
                        {item.value}
                      </div>
                      <span className="text-gray-700 font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Scale */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>⚠️</span> Safety Level
                </h3>
                <div className="space-y-2">
                  {safetyScale.map((item) => (
                    <div key={item.value} className="flex items-center gap-3">
                      <div className={`${item.color} text-white px-3 py-2 rounded-lg min-w-[60px] text-center font-bold`}>
                        {item.value}
                      </div>
                      <span className="text-gray-700 font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Snow Scale */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>❄️</span> Snow Quality
                </h3>
                <div className="space-y-2">
                  {snowScale.map((item) => (
                    <div key={item.value} className="flex items-center gap-3">
                      <div className={`${item.color} ${item.color.includes('gray') ? 'text-gray-700' : 'text-white'} px-3 py-2 rounded-lg min-w-[60px] text-center font-bold`}>
                        {item.value}
                      </div>
                      <span className="text-gray-700 font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wind Scale */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>🌬️</span> Wind Exposure
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 text-white px-3 py-2 rounded-lg min-w-[100px] text-center font-bold">
                      ✅ Safe
                    </div>
                    <span className="text-gray-700 font-medium">No problematic winds</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-500 text-white px-3 py-2 rounded-lg min-w-[100px] text-center font-bold">
                      🌬️ Exposed
                    </div>
                    <span className="text-gray-700 font-medium">Wind exposed area - Check conditions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RatingLegend;