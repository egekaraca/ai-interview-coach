import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import {
  Trophy, TrendingUp, AlertCircle, Share2, Download,
  RefreshCcw, Home, Eye, Mic, MessageSquare, Check, X
} from 'lucide-react'

// --- SPOTLIGHT CARD COMPONENT (Reused) ---
const SpotlightCard = ({ children, className = "" }) => {
  const divRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e) => {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden bg-[#0a0a0a] border border-white/10 rounded-[2rem] ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300 z-10"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(99, 102, 241, 0.1), transparent 40%)`,
        }}
      />
      <div className="relative z-20 h-full">{children}</div>
    </div>
  )
}

export default function Results() {
  const containerRef = useRef(null)

  // MOCK DATA (Normalde API'den gelecek)
  const resultData = {
    score: 87,
    grade: "A-",
    role: "Senior Product Manager",
    duration: "14m 22s",
    metrics: {
      eyeContact: 92,
      clarity: 85,
      pacing: 135, // wpm
      confidence: 78
    },
    feedback: [
      { type: 'good', text: 'Strong adherence to STAR method in Q2.' },
      { type: 'bad', text: 'Eye contact dropped significantly during technical explanation.' },
      { type: 'good', text: 'Excellent modulation of voice tone.' },
      { type: 'info', text: 'Try to reduce filler words ("umm") in the intro.' }
    ]
  }

  useGSAP(() => {
    // 1. Score Animation (0 -> 87)
    gsap.fromTo(".score-value",
      { innerText: 0 },
      {
        innerText: resultData.score,
        duration: 2,
        snap: { innerText: 1 },
        ease: "power2.out"
      }
    )

    // 2. Stroke Animation (Circle)
    gsap.fromTo(".score-circle",
      { strokeDashoffset: 565 }, // Full circle circumference
      { strokeDashoffset: 565 - (565 * resultData.score) / 100, duration: 2, ease: "power2.out" }
    )

    // 3. Reveal Cards
    gsap.from(".reveal-card", {
      y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.2)"
    })

  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="bg-[#030303] text-white min-h-screen font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden pb-20">

      {/* GLOBAL NOISE */}
      <div className="fixed inset-0 z-[60] pointer-events-none opacity-[0.05] mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}>
      </div>

      {/* HEADER */}
      <header className="pt-12 px-6 border-b border-white/10 pb-8 bg-[#050505]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/80">Analysis Complete</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
                    Mission <span className="text-indigo-500">Debrief.</span>
                </h1>
                <p className="text-gray-400 font-mono text-xs mt-2 uppercase tracking-widest">
                    Session ID: #8X2-99A • {resultData.role}
                </p>
            </div>

            <div className="flex gap-3">
                <button className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2 text-xs uppercase tracking-wider">
                    <Share2 size={16} /> Share
                </button>
                <button className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all flex items-center gap-2 text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                    <Download size={16} /> Export PDF
                </button>
            </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* 1. HERO SCORE CARD (Left - Large) */}
            <SpotlightCard className="lg:col-span-4 p-8 flex flex-col items-center justify-center text-center reveal-card min-h-[400px]">
                <div className="relative w-64 h-64 flex items-center justify-center mb-8">
                    {/* SVG Progress Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="50%" cy="50%" r="90" stroke="#1a1a1a" strokeWidth="15" fill="none" />
                        <circle
                            className="score-circle"
                            cx="50%" cy="50%" r="90"
                            stroke="#6366f1"
                            strokeWidth="15"
                            fill="none"
                            strokeDasharray="565"
                            strokeDashoffset="565"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <span className="text-8xl font-black tracking-tighter text-white score-value">0</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 mt-2">Total Score</span>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-full">
                    <span className="text-2xl font-black text-white">{resultData.grade}</span>
                    <span className="text-gray-500 text-xs font-bold uppercase ml-2">Performance Tier</span>
                </div>
            </SpotlightCard>

            {/* 2. ANALYTICS GRID (Right) */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Vision Metrics */}
                <SpotlightCard className="p-8 reveal-card">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><Eye size={24} /></div>
                        <div>
                            <h3 className="text-xl font-black uppercase text-white">Vision Logic</h3>
                            <p className="text-[10px] font-mono text-gray-500 uppercase">Attention Tracking</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-xs font-bold text-gray-300 mb-2 uppercase">
                                Eye Contact
                                <span className="text-white">{resultData.metrics.eyeContact}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[92%]" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold text-gray-300 mb-2 uppercase">
                                Head Stability
                                <span className="text-white">98%</span>
                            </div>
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[98%]" />
                            </div>
                        </div>
                    </div>
                </SpotlightCard>

                {/* Speech Metrics */}
                <SpotlightCard className="p-8 reveal-card">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><Mic size={24} /></div>
                        <div>
                            <h3 className="text-xl font-black uppercase text-white">Audio Prosody</h3>
                            <p className="text-[10px] font-mono text-gray-500 uppercase">Vocal Delivery</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/40 border border-white/10 p-4 rounded-xl text-center">
                            <div className="text-3xl font-black text-white">{resultData.metrics.pacing}</div>
                            <div className="text-[9px] font-bold text-gray-500 uppercase mt-1">Words / Min</div>
                        </div>
                        <div className="bg-black/40 border border-white/10 p-4 rounded-xl text-center">
                            <div className="text-3xl font-black text-white">96<span className="text-sm">%</span></div>
                            <div className="text-[9px] font-bold text-gray-500 uppercase mt-1">Clarity Score</div>
                        </div>
                    </div>
                </SpotlightCard>

                {/* Confidence Graph (Wide Card) */}
                <SpotlightCard className="md:col-span-2 p-8 reveal-card flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400"><TrendingUp size={24} /></div>
                            <div>
                                <h3 className="text-xl font-black uppercase text-white">Confidence Stream</h3>
                                <p className="text-[10px] font-mono text-gray-500 uppercase">Timeline Analysis</p>
                            </div>
                        </div>
                        <div className="text-xs font-bold bg-white/5 px-3 py-1 rounded border border-white/10 text-gray-400">
                            14m 22s Duration
                        </div>
                    </div>

                    {/* FAKE CHART (SVG) */}
                    <div className="w-full h-32 relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between opacity-10">
                            <div className="w-full h-px bg-white"></div>
                            <div className="w-full h-px bg-white"></div>
                            <div className="w-full h-px bg-white"></div>
                        </div>

                        {/* The Line */}
                        <svg className="w-full h-full overflow-visible">
                            <path
                                d="M0,100 C50,100 80,60 150,50 S250,80 350,40 S500,20 600,10"
                                fill="none"
                                stroke="#f97316"
                                strokeWidth="3"
                                strokeLinecap="round"
                                vectorEffect="non-scaling-stroke"
                            />
                            {/* Area under curve */}
                            <path
                                d="M0,100 C50,100 80,60 150,50 S250,80 350,40 S500,20 600,10 V120 H0 Z"
                                fill="url(#orangeGradient)"
                                opacity="0.3"
                            />
                            <defs>
                                <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.5"/>
                                    <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </SpotlightCard>

            </div>
        </div>

        {/* FEEDBACK SECTION */}
        <div className="max-w-7xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Feedback List */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 reveal-card">
                <h3 className="text-xl font-black uppercase text-white mb-6 flex items-center gap-2">
                    <MessageSquare size={20} className="text-indigo-500"/>
                    AI Observations
                </h3>

                <div className="space-y-4">
                    {resultData.feedback.map((item, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-colors">
                            <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                                item.type === 'good' ? 'bg-emerald-500/20 text-emerald-400' :
                                item.type === 'bad' ? 'bg-red-500/20 text-red-400' :
                                'bg-blue-500/20 text-blue-400'
                            }`}>
                                {item.type === 'good' ? <Check size={14} strokeWidth={3}/> :
                                 item.type === 'bad' ? <X size={14} strokeWidth={3}/> :
                                 <AlertCircle size={14} strokeWidth={3}/>}
                            </div>
                            <p className="text-sm font-medium text-slate-300 leading-relaxed">
                                {item.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Next Steps / CTA */}
            <div className="flex flex-col gap-6">
                <div className="bg-indigo-600 rounded-[2rem] p-8 flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden group reveal-card">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

                    <Trophy size={48} className="text-white mb-4" />
                    <h3 className="text-3xl font-black uppercase text-white mb-2">Ready to Level Up?</h3>
                    <p className="text-indigo-100 font-medium mb-8 max-w-sm">
                        Your performance is in the top 15% of candidates. Try a "Tech Lead" scenario to increase difficulty.
                    </p>

                    <div className="flex gap-4 w-full justify-center">
                        <Link to="/" className="px-6 py-4 bg-white text-indigo-600 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-colors shadow-xl">
                            Retry Session
                        </Link>
                        <Link to="/" className="px-6 py-4 bg-indigo-800 text-white border border-indigo-400/30 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-colors">
                            Dashboard
                        </Link>
                    </div>
                </div>
            </div>

        </div>

      </div>

    </div>
  )
}