import React from 'react';

const mockResult = {
  disease: 'Late Blight',
  confidence: 92,
  severity: 'Severe',
  reference: {
    healthy: 'https://images.unsplash.com/photo-healthy-crop?auto=format&fit=crop&w=400&q=80',
    infected: 'https://images.unsplash.com/photo-infected-crop?auto=format&fit=crop&w=400&q=80',
  },
};

const ResultPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 py-16 px-4">
      <h1 className="text-3xl font-bold text-green-800 mb-8">Detection Result</h1>
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl text-center">
        <div className="mb-6">
          <span className="text-2xl font-semibold text-green-700">
            {mockResult.disease}
          </span>
          <span className="ml-2 text-lg text-gray-500">– {mockResult.confidence}%</span>
        </div>
        <div className="mb-8">
          <span className={`inline-block px-4 py-1 rounded-full text-white text-sm font-medium ${
            mockResult.severity === 'Severe' ? 'bg-red-600' : mockResult.severity === 'Moderate' ? 'bg-yellow-500' : 'bg-green-600'
          }`}>
            {mockResult.severity} Severity
          </span>
        </div>
        {/* Reference Photos */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-green-800 mb-4">Reference Photos</h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="flex flex-col items-center">
              <img
                src={mockResult.reference.healthy}
                alt="Healthy Crop"
                className="w-40 h-32 object-cover rounded-lg shadow border border-green-200 mb-2"
              />
              <span className="text-green-700 text-sm font-medium">Healthy</span>
            </div>
            <div className="flex flex-col items-center">
              <img
                src={mockResult.reference.infected}
                alt="Infected Crop"
                className="w-40 h-32 object-cover rounded-lg shadow border border-red-200 mb-2"
              />
              <span className="text-red-700 text-sm font-medium">Infected</span>
            </div>
          </div>
        </div>
        <p className="text-green-700 text-lg">Results will be shown here.</p>
        <div className="h-32" />
      </div>
    </div>
  );
};

export default ResultPage;