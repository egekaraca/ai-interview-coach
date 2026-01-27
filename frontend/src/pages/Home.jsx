import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { interviewAPI } from '../services/api'
import {
  Video, Brain, Play, ArrowRight,
  CheckCircle2, Code, Briefcase, Users,
  Sparkles, Zap, BarChart3, ChevronRight,
  MessageSquare, ScanFace, ChevronDown, Info,
  HeartHandshake, Terminal, TrendingUp, AlertCircle
} from 'lucide-react'

// --- SPOTLIGHT CARD BİLEŞENİ ---
const SpotlightCard = ({ children, className = "" }) => {
  const divRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e) => {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleFocus = () => {
    setOpacity(1)
  }

  const handleBlur = () => {
    setOpacity(0)
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleFocus}
      onMouseLeave={handleBlur}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300 z-10"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(20, 184, 166, 0.15), transparent 40%)`,
        }}
      />
      {children}
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState('behavioral')
  const [jobRole, setJobRole] = useState('')

  // --- PERSONA DATA ---
  const personas = [
    {
      id: 'hr',
      name: 'Supportive HR',
      role: 'Culture Fit Focus',
      icon: HeartHandshake,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      quote: "Tell me about a time you failed? Don't worry, I'm interested in what you learned from it.",
      tone: "Warm, Encouraging, Patient"
    },
    {
      id: 'tech',
      name: 'Tech Lead',
      role: 'Deep Dive Technical',
      icon: Terminal,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      quote: "Why did you choose a NoSQL database for this schema? Walk me through the trade-offs.",
      tone: "Precise, Skeptical, Detail-Oriented"
    },
    {
      id: 'exec',
      name: 'The Executive',
      role: 'Big Picture Strategy',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      quote: "Cut the details. How does this feature directly impact our Q3 revenue goals?",
      tone: "Direct, ROI-Focused, Impatient"
    },
    {
      id: 'stress',
      name: 'Stress Test',
      role: 'Pressure Interview',
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      quote: "I'm not convinced by that answer at all. Can you explain it again, but clearly this time?",
      tone: "Challenging, Cold, Intense"
    }
  ]

  const [activePersona, setActivePersona] = useState(personas[0])

  // --- TYPEWRITER EFFECT STATES ---
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [typingSpeed, setTypingSpeed] = useState(150)

  const words = ["confidence.", "style.", "no stress.", "ease.", "Candid."]

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % words.length
      const fullText = words[i]

      setText(isDeleting
        ? fullText.substring(0, text.length - 1)
        : fullText.substring(0, text.length + 1)
      )

      setTypingSpeed(isDeleting ? 50 : 150)

      if (!isDeleting && text === fullText) {
        const pauseTime = fullText === "Candid." ? 4000 : 2000
        setTimeout(() => setIsDeleting(true), pauseTime)
      } else if (isDeleting && text === '') {
        setIsDeleting(false)
        setLoopNum(loopNum + 1)
      }
    }

    const timer = setTimeout(handleTyping, typingSpeed)
    return () => clearTimeout(timer)
  }, [text, isDeleting, loopNum])

  const interviewTypes = [
    {
      id: 'behavioral',
      name: 'Behavioral Fit',
      icon: Users,
      description: 'Leadership principles & STAR method.',
    },
    {
      id: 'technical',
      name: 'Technical / System',
      icon: Code,
      description: 'System design & problem solving.',
    },
    {
      id: 'general',
      name: 'General Screening',
      icon: Briefcase,
      description: 'First impressions & elevator pitch.',
    },
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
    <div className="w-full min-h-screen bg-white font-sans text-slate-900">

      <style>{`
        @keyframes blink-sharp {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .cursor-sharp {
          animation: blink-sharp 1s step-end infinite;
        }
      `}</style>

      {/* 1. HERO SECTION */}
      <section className="w-full pt-32 pb-24 lg:pt-40 lg:pb-40 relative isolate overflow-hidden min-h-screen flex flex-col justify-center">

        {/* BACKGROUND VIDEO */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source
              src="https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_25fps.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-slate-900/40 to-white" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center w-full">

          {/* HEADER TEXT */}
          <div className="text-center mb-10 max-w-4xl">

            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] drop-shadow-sm">
                Ace your next interview <br />
                <span className="text-white">with </span>
                <span className="text-teal-400 inline-flex items-center text-left min-w-[20px]">
                {text}
                <span className="ml-1 w-[3px] h-[0.8em] bg-teal-400 cursor-sharp"></span>
                </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                No more generic advice. Practice with an AI that sees, hears, and corrects you in real-time.
            </p>
          </div>

          {/* SIGN UP & PRICING ACTIONS */}
          <div className="flex flex-col items-center gap-4 mb-8 w-full">
             <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-900 rounded-full font-bold text-base hover:bg-teal-50 hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  Sign Up Free
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/pricing"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold text-base hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  View Pricing
                </Link>
             </div>

             <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/40 border border-white/10 backdrop-blur-sm text-slate-300 text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-700">
                <Info size={14} className="text-teal-400" />
                <span>Guest sessions are not saved. Create an account to track progress.</span>
             </div>
          </div>

          {/* --- INTERACTIVE CONFIGURATOR CARD --- */}
          <div id="start-practice" className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col md:flex-row border border-slate-200 animate-in fade-in slide-in-from-bottom-8 duration-1000">

            {/* LEFT: SELECTION PANEL */}
            <div className="flex-1 p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-100">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                    01. Select Style
                </label>
                <div className="grid grid-cols-1 gap-4">
                    {interviewTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`flex items-center gap-5 p-5 rounded-2xl text-left transition-all duration-200 group ${
                        selectedType === type.id
                            ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500 shadow-sm'
                            : 'bg-white border border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                        }`}
                    >
                        <div className={`p-3 rounded-xl transition-colors ${selectedType === type.id ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:text-teal-600'}`}>
                            <type.icon size={24} />
                        </div>
                        <div className="flex-1">
                            <div className={`font-bold text-lg ${selectedType === type.id ? 'text-teal-900' : 'text-slate-900'}`}>
                                {type.name}
                            </div>
                            <div className="text-sm text-slate-500 mt-1">{type.description}</div>
                        </div>
                        {selectedType === type.id && (
                            <CheckCircle2 size={24} className="text-teal-600 fill-current" />
                        )}
                    </button>
                    ))}
                </div>
            </div>

            {/* RIGHT: ACTION PANEL */}
            <div className="flex-1 p-8 md:p-12 bg-slate-50/50 flex flex-col justify-between">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                        02. Target Role (Optional)
                    </label>
                    <div className="relative mb-8">
                        <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                        <input
                            type="text"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            className="w-full pl-14 p-5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-lg font-medium text-slate-900 placeholder:text-slate-400"
                            placeholder="e.g. Product Manager @ Google"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-8 text-slate-500 text-sm bg-white/50 p-4 rounded-xl border border-slate-100">
                        <Zap size={20} className="text-teal-500 fill-teal-100" />
                        <span>Ready to evaluate your <strong>{selectedType}</strong> skills.</span>
                    </div>

                    <button
                        onClick={handleStartInterview}
                        disabled={loading}
                        className="w-full py-5 bg-teal-600 text-white rounded-2xl font-bold text-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-teal-600/20 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1 active:translate-y-0"
                    >
                        {loading ? (
                        <>
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                            Initializing...
                        </>
                        ) : (
                        <>
                            Quick Start (Guest)
                            <ArrowRight size={24} />
                        </>
                        )}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-6 font-medium">
                        Requires camera & microphone access
                    </p>
                </div>
            </div>

          </div>
        </div>

        {/* SCROLL INDICATOR */}
        <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 cursor-pointer group flex flex-col items-center gap-3"
            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
        >
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-lg group-hover:bg-slate-900/80 transition-all duration-300">
                <span className="text-xs font-bold text-white tracking-widest uppercase">
                    Discover Features
                </span>
                <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white animate-bounce">
                    <ChevronDown size={14} strokeWidth={3} />
                </div>
            </div>
        </div>

      </section>

      {/* 2. FEATURES - BENTO GRID WITH SPOTLIGHT */}
      <section id="features" className="w-full py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Intelligence in every interaction.
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Candid uses advanced multi-modal AI to capture nuances that standard mock interviews miss.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* CARD 1: SPEECH */}
            <SpotlightCard className="col-span-1 md:col-span-2 bg-slate-50 rounded-[2.5rem] border border-slate-200 p-8 md:p-12 group hover:border-teal-200 transition-colors duration-300">
               <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
               <div className="relative z-20 flex flex-col md:flex-row gap-12 items-center">
                  <div className="flex-1 space-y-6">
                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-teal-600 mb-6">
                        <MessageSquare size={28} />
                     </div>
                     <h3 className="text-3xl font-bold text-slate-900">Conversational AI</h3>
                     <p className="text-lg text-slate-600 leading-relaxed">
                        It's not just Q&A. Our AI reacts to your tone, asks follow-up questions, and simulates a real recruiter's psychology using advanced speech-to-text models.
                     </p>
                     <div className="flex items-center gap-2 text-teal-700 font-bold cursor-pointer group-hover:gap-3 transition-all">
                        <span>Hear examples</span>
                        <ArrowRight size={18} />
                     </div>
                  </div>
                  <div className="flex-1 w-full max-w-sm">
                     <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4 transform rotate-2 group-hover:rotate-0 transition-transform duration-500">
                        <div className="flex gap-3">
                           <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-xs font-bold">AI</div>
                           <div className="bg-slate-100 text-slate-700 p-3 rounded-2xl rounded-tl-none text-sm">
                              Could you tell me about a time you had a conflict?
                           </div>
                        </div>
                         <div className="flex gap-3 flex-row-reverse">
                           <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">You</div>
                           <div className="bg-slate-900 text-white p-3 rounded-2xl rounded-tr-none text-sm shadow-md">
                              Sure. In my last role, we disagreed on the roadmap...
                           </div>
                        </div>
                        <div className="flex gap-3 pt-2 opacity-80">
                           <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                              <Sparkles size={14} />
                           </div>
                           <div className="text-teal-600 text-xs flex items-center gap-2 p-2 font-medium">
                              <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"/>
                              Analyzing tone & confidence...
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </SpotlightCard>

            {/* CARD 2: VISION */}
            <SpotlightCard className="col-span-1 bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white group">
               <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
               <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-teal-900/40 to-transparent" />
               <div className="relative z-20 h-full flex flex-col justify-between">
                  <div>
                     <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 text-teal-300">
                        <ScanFace size={28} />
                     </div>
                     <h3 className="text-3xl font-bold mb-4">Computer Vision</h3>
                     <p className="text-slate-400 leading-relaxed mb-8">
                        We track 468 facial landmarks to insure you maintain eye contact and confident posture.
                     </p>
                  </div>
                  <div className="relative w-full aspect-video bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 group-hover:border-teal-500/50 transition-colors">
                     <video
                        src="https://videos.pexels.com/video-files/3255275/3255275-uhd_2560_1440_25fps.mp4"
                        autoPlay muted loop playsInline
                        className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
                     />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 border-2 border-teal-500/50 rounded-xl relative">
                           <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-teal-400 -mt-1 -ml-1"></div>
                           <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-teal-400 -mt-1 -mr-1"></div>
                           <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-teal-400 -mb-1 -ml-1"></div>
                           <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-teal-400 -mb-1 -mr-1"></div>
                        </div>
                     </div>
                  </div>
               </div>
            </SpotlightCard>

            {/* CARD 3: ANALYTICS (3 SCORES) */}
            <SpotlightCard className="col-span-1 bg-teal-50 rounded-[2.5rem] border border-teal-100 p-8 md:p-10 group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-teal-200 rounded-full blur-3xl opacity-40" />
                <div className="relative z-20 h-full flex flex-col">
                   <div className="mb-6">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-teal-600 mb-6">
                          <BarChart3 size={28} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">Instant Feedback</h3>
                      <p className="text-slate-600 mb-2">
                          Get a detailed scorecard on your answers immediately after the session.
                      </p>
                   </div>

                   {/* THREE SEPARATE METRIC CARDS */}
                   <div className="flex flex-col gap-3 mt-auto">

                      {/* Metric 1: Posture (Sky - NEW) */}
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-sky-100 hover:border-sky-300 transition-colors">
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Posture</span>
                             <span className="text-sm font-bold text-slate-800">95/100</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-sky-500 w-[95%] rounded-full"></div>
                          </div>
                      </div>

                      {/* Metric 2: Clarity (Teal) */}
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-teal-100 hover:border-teal-300 transition-colors">
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Clarity</span>
                             <span className="text-sm font-bold text-slate-800">92/100</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-teal-500 w-[92%] rounded-full"></div>
                          </div>
                      </div>

                      {/* Metric 3: Confidence (Indigo) */}
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-100 hover:border-indigo-300 transition-colors">
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Confidence</span>
                             <span className="text-sm font-bold text-slate-800">85/100</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-500 w-[85%] rounded-full"></div>
                          </div>
                      </div>

                   </div>
                </div>
            </SpotlightCard>

             {/* CARD 4: ADAPTIVE PERSONAS (INTERACTIVE) */}
             <SpotlightCard className="col-span-1 md:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 group hover:bg-slate-50/50 transition-colors">
                <div className="relative z-20 flex flex-col md:flex-row gap-8 h-full">

                   {/* Left Side: Persona List */}
                   <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center shadow-sm text-slate-900 mb-6 border border-slate-200">
                            <Users size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">Adaptive Personas</h3>
                        <p className="text-slate-600 mb-6">
                            Choose your challenger. Our AI switches personality to match real-world interviewers.
                        </p>
                      </div>

                      <div className="space-y-2">
                          {personas.map((p) => (
                              <button
                                key={p.id}
                                onMouseEnter={() => setActivePersona(p)}
                                onClick={() => setActivePersona(p)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left border relative z-30 ${
                                    activePersona.id === p.id 
                                        ? 'bg-white shadow-md border-slate-200 scale-102' 
                                        : 'bg-transparent border-transparent hover:bg-slate-100 text-slate-500'
                                }`}
                              >
                                  <div className={`p-2 rounded-lg ${p.bg} ${p.color}`}>
                                      <p.icon size={18} />
                                  </div>
                                  <span className={`font-bold text-sm ${activePersona.id === p.id ? 'text-slate-900' : 'text-slate-500'}`}>
                                      {p.name}
                                  </span>
                              </button>
                          ))}
                      </div>
                   </div>

                   {/* Right Side: Interactive Preview Card */}
                   <div className="flex-1 flex items-center justify-center">
                      <div className={`w-full bg-white rounded-3xl p-6 shadow-xl border transition-all duration-500 ${activePersona.border}`}>
                          {/* Header */}
                          <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activePersona.bg} ${activePersona.color}`}>
                                  <activePersona.icon size={24} />
                              </div>
                              <div>
                                  <div className="font-bold text-slate-900">{activePersona.name}</div>
                                  <div className="text-xs text-slate-400">{activePersona.role}</div>
                              </div>
                          </div>

                          {/* Chat Bubble */}
                          <div className="space-y-4">
                              <div className={`p-4 rounded-2xl rounded-tl-none bg-slate-50 text-slate-700 text-sm leading-relaxed border border-slate-100`}>
                                  "{activePersona.quote}"
                              </div>
                              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                  <Zap size={12} className={activePersona.color} />
                                  <span>Tone: <span className={activePersona.color}>{activePersona.tone}</span></span>
                              </div>
                          </div>
                      </div>
                   </div>

                </div>
             </SpotlightCard>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <Sparkles size={16} fill="currentColor" />
            </div>
            <span className="font-bold text-slate-900 text-lg">Candid</span>
          </div>
          <div className="flex gap-10 text-base font-medium text-slate-500">
            <a href="#" className="hover:text-teal-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-teal-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-teal-600 transition-colors">Contact</a>
          </div>
          <div className="text-base text-slate-400">
            © 2025 Ege Karaca.
          </div>
        </div>
      </footer>
    </div>
  )
}