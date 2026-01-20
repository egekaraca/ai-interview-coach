import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { interviewAPI } from '../services/api'
import { Video, Briefcase, Code, Users } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState('general')
  const [jobRole, setJobRole] = useState('')

  const interviewTypes = [
    {
      id: 'behavioral',
      name: 'Behavioral',
      icon: Users,
      description: 'STAR method, past experiences',
    },
    {
      id: 'technical',
      name: 'Technical',
      icon: Code,
      description: 'Coding, system design, algorithms',
    },
    {
      id: 'general',
      name: 'General',
      icon: Briefcase,
      description: 'Mixed interview questions',
    },
  ]

  const handleStartInterview = async () => {
    setLoading(true)
    try {
      const session = await interviewAPI.startSession({
        interview_type: selectedType,
        job_role: jobRole || null,
      })
      
      // Navigate to interview session
      navigate(`/interview/${session.id}`)
    } catch (error) {
      console.error('Failed to start interview:', error)
      alert('Failed to start interview. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Master Your Interview Skills with AI
        </h1>
        <p className="text-xl text-gray-600">
          Practice interviews, get real-time feedback, and track your progress
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
            <Video className="text-primary-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Real-Time Analysis</h3>
          <p className="text-gray-600">
            Track eye contact, posture, and body language as you practice
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
            <Code className="text-primary-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">AI-Powered Feedback</h3>
          <p className="text-gray-600">
            Get detailed feedback on your answers from advanced AI
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="text-primary-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
          <p className="text-gray-600">
            Monitor improvement over time with detailed analytics
          </p>
        </div>
      </div>

      {/* Start Interview Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">Start a New Interview</h2>

        {/* Interview Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Interview Type
          </label>
          <div className="grid md:grid-cols-3 gap-4">
            {interviewTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedType === type.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon
                    size={24}
                    className={
                      selectedType === type.id ? 'text-primary-600' : 'text-gray-400'
                    }
                  />
                  <h3 className="font-semibold mt-2">{type.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Job Role Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Role (Optional)
          </label>
          <input
            type="text"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            placeholder="e.g., Software Engineer, Product Manager"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartInterview}
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Starting...' : 'Start Interview'}
        </button>
      </div>

      {/* Recent Sessions Preview */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Recent Practice Sessions</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View All →
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center text-gray-500">
          No recent sessions. Start your first interview above!
        </div>
      </div>
    </div>
  )
}
