export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Progress Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Total Sessions</div>
          <div className="text-3xl font-bold text-gray-900">0</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Average Score</div>
          <div className="text-3xl font-bold text-primary-600">0%</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Improvement</div>
          <div className="text-3xl font-bold text-green-600">+0%</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-sm font-medium text-gray-600 mb-1">Last Practice</div>
          <div className="text-lg font-medium text-gray-700">Never</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Performance Over Time</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          <p className="text-gray-500">Charts will be implemented later</p>
        </div>
      </div>

      {/* Session History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Interview History</h2>
        <div className="text-center py-12 text-gray-500">
          No practice sessions yet. Start your first interview!
        </div>
      </div>
    </div>
  )
}
