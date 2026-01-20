import { useParams } from 'react-router-dom'

export default function ReportView() {
  const { sessionId } = useParams()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6">Interview Report</h1>
        
        {/* Overall Score */}
        <div className="mb-8 text-center">
          <div className="text-6xl font-bold text-primary-600 mb-2">0/100</div>
          <p className="text-gray-600">Overall Interview Score</p>
        </div>

        {/* Metrics Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 mb-2">Eye Contact</div>
            <div className="text-2xl font-bold">0%</div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 mb-2">Posture</div>
            <div className="text-2xl font-bold">0%</div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 mb-2">Filler Words</div>
            <div className="text-2xl font-bold">0</div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600 mb-2">Speaking Pace</div>
            <div className="text-2xl font-bold">0 wpm</div>
          </div>
        </div>

        {/* AI Feedback */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">AI Feedback</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-600">
              Detailed AI feedback will appear here after the interview is analyzed.
            </p>
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold mb-3 text-green-600">Strengths</h3>
            <ul className="space-y-2">
              <li className="text-gray-600">Will be populated after analysis</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3 text-orange-600">Areas for Improvement</h3>
            <ul className="space-y-2">
              <li className="text-gray-600">Will be populated after analysis</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
