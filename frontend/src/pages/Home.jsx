import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { interviewAPI } from '../services/api'
import { Video, Brain, TrendingUp, CheckCircle, ArrowRight, Play } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState('behavioral')
  const [jobRole, setJobRole] = useState('')

  const interviewTypes = [
    {
      id: 'behavioral',
      name: 'Behavioral',
      icon: '👥',
      description: 'Master STAR method responses',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'technical',
      name: 'Technical',
      icon: '💻',
      description: 'Ace coding & system design',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'general',
      name: 'General',
      icon: '💼',
      description: 'Perfect your overall presence',
      color: 'from-green-500 to-green-600'
    },
  ]

  const features = [
    {
      icon: Video,
      title: 'Real-Time Face Tracking',
      description: 'Advanced computer vision tracks eye contact, facial expressions, and posture throughout your interview.',
      stat: '468 facial landmarks'
    },
    {
      icon: Brain,
      title: 'AI-Powered Feedback',
      description: 'Claude AI analyzes your answers for structure, clarity, and relevance. Get specific improvement suggestions.',
      stat: 'Powered by Claude Sonnet'
    },
    {
      icon: TrendingUp,
      title: 'Progress Analytics',
      description: 'Track your improvement over time with detailed metrics and performance trends across multiple sessions.',
      stat: 'Unlimited practice'
    }
  ]

  const benefits = [
    'Instant feedback on body language and communication',
    'Practice with real interview questions',
    'Track filler words and speaking pace',
    'STAR format detection and guidance',
    'Detailed performance reports',
    'No scheduling - practice anytime'
  ]

  const handleStartInterview = async () => {
    setLoading(true)
    try {
      const session = await interviewAPI.startSession({
        interview_type: selectedType,
        job_role: jobRole || null,
      })
      navigate(`/interview/${session.id}`)
    } catch (error) {
      console.error('Failed to start interview:', error)
      alert('Failed to start interview. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(203 213 225 / 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              AI-Powered Interview Training
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Master Your Next
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Interview
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Practice with AI-powered feedback on your body language, speech, and answer quality.
              Build confidence before the real thing.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <a
                href="#start-practice"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
              >
                Start Free Practice
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </a>
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-all flex items-center"
              >
                <Play size={20} className="mr-2" />
                See How It Works
              </a>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="text-green-500 mr-2" size={20} />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-green-500 mr-2" size={20} />
                <span>Free unlimited practice</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-green-500 mr-2" size={20} />
                <span>Instant feedback</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Ace Your Interview
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cutting-edge AI technology gives you instant, actionable feedback
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div key={idx} className="group relative bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                  {/* Icon */}
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="text-white" size={28} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>

                  {/* Stat */}
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {feature.stat}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">Simple, effective, immediate results</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Choose Interview Type', desc: 'Select behavioral, technical, or general interview' },
              { step: '02', title: 'Practice Answering', desc: 'Answer questions while AI tracks your performance' },
              { step: '03', title: 'Get Instant Feedback', desc: 'See real-time metrics on eye contact, posture, speech' },
              { step: '04', title: 'Track Progress', desc: 'Review detailed reports and improve over time' }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="text-6xl font-bold text-blue-100 mb-4">{item.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-blue-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose AI Interview Coach?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Traditional interview prep can't give you real-time feedback on your body language and delivery.
                Our AI does.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start">
                    <CheckCircle className="text-green-500 mr-3 flex-shrink-0 mt-1" size={20} />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Play className="text-blue-600" size={32} />
                  </div>
                  <p className="text-gray-600">Demo video coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Start Practice Section */}
      <section id="start-practice" className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              Start Your Free Practice Session
            </h2>
            <p className="text-lg text-gray-600 mb-8 text-center">
              Choose your interview type and target role to begin
            </p>

            {/* Interview Type Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Interview Type
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {interviewTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`relative p-6 rounded-xl border-2 text-left transition-all ${
                      selectedType === type.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-4xl mb-3">{type.icon}</div>
                    <h3 className="font-bold text-gray-900 mb-1">{type.name}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Job Role Input */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Target Role <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
              />
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartInterview}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                'Starting...'
              ) : (
                <>
                  Start Interview Practice
                  <ArrowRight className="ml-2" size={20} />
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Your practice session will be saved automatically
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">AI Interview Coach</h3>
            <p className="text-gray-400 mb-6">Master your interview skills with AI-powered feedback</p>
            <div className="flex justify-center space-x-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              © 2025 AI Interview Coach. Built by Ege Karaca.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}