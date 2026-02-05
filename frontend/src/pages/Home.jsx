import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { interviewAPI } from '../services/api'
import Marquee from 'react-fast-marquee'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  ArrowRight, CheckCircle2, Briefcase, Users,
  BarChart3, Play, Info, ChevronDown,
  Terminal, MessageSquare, ScanFace, ShieldCheck, Activity, Mic, Zap
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

// --- SPOTLIGHT CARD (Tasarım Bütünlüğü İçin Eklendi) ---
const SpotlightCard = ({ children, className = "", lightColor = "rgba(255, 255, 255, 0.1)" }) => {
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
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition duration-300 z-10"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${lightColor}, transparent 40%)`,
        }}
      />
      <div className="relative z-20 h-full">{children}</div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const containerRef = useRef(null)

  const [selectedType, setSelectedType] = useState('behavioral')
  const [jobRole, setJobRole] = useState('')
  const [loading, setLoading] = useState(false)

  // --- TYPEWRITER STATE ---
  const [text, setText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [typingSpeed, setTypingSpeed] = useState(150)

  const words = ["CONFIDENCE.", "PRECISION.", "STYLE.", "CANDID."]

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
        const pauseTime = fullText === "CANDID." ? 4000 : 2000
        setTimeout(() => setIsDeleting(true), pauseTime)
      } else if (isDeleting && text === '') {
        setIsDeleting(false)
        setLoopNum(loopNum + 1)
      }
    }

    const timer = setTimeout(handleTyping, typingSpeed)
    return () => clearTimeout(timer)
  }, [text, isDeleting, loopNum])

  // --- PERSONA STATE ---
  const [activePersona, setActivePersona] = useState(0);
  const personas = [
    {
      title: "THE RECRUITER",
      role: "HR & Culture Fit",
      quote: "Tell me about a time you failed. What did you learn from it?",
      color: "bg-indigo-600 text-white border-indigo-500",
      subColor: "text-indigo-200"
    },
    {
      title: "THE LEAD",
      role: "Technical Deep-Dive",
      quote: "Why did you choose SQL over NoSQL for this specific schema?",
      color: "bg-white text-black border-gray-200",
      subColor: "text-gray-500"
    },
    {
      title: "THE EXEC",
      role: "Strategy & ROI",
      quote: "Cut the details. How does this feature directly impact our revenue?",
      color: "bg-[#111] text-white border-white/20",
      subColor: "text-gray-400"
    }
  ];

  useGSAP(() => {
    const sections = gsap.utils.toArray('.reveal-up')
    sections.forEach((elem) => {
      gsap.fromTo(elem,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'expo.out',
          scrollTrigger: {
            trigger: elem,
            start: 'top 85%',
          }
        }
      )
    })
  }, { scope: containerRef })

  const handleStartInterview = async () => {
    setLoading(true)
    try {
      const session = await interviewAPI.startSession({
        interview_type: selectedType,
        job_role: jobRole || null,
      })
      navigate(`/interview/${session.id}`)
    } catch (error) {
      alert('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={containerRef} className="bg-[#030303] text-white min-h-screen font-sans selection:bg-white selection:text-black overflow-x-hidden">

      {/* GLOBAL NOISE TEXTURE */}
      <div className="fixed inset-0 z-[60] pointer-events-none opacity-[0.05] mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}>
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-screen flex flex-col justify-center items-center px-6 pt-16 bg-black border-b border-white/10">

        {/* Background Grid Animation */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

        {/* Spotlights */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-[100px]" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-[100px]" />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="reveal-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/80">System Online v2.4</span>
            </div>

            {/* Massive Title */}
            <h1 className="reveal-up text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white uppercase mb-6 drop-shadow-2xl min-h-[1.8em]">
                SIMULATE REALITY <br/>
                <span className="text-white/40">WITH </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-white">
                  {text}
                </span>
                <span className="animate-blink ml-1 text-indigo-500">|</span>
            </h1>

            {/* Subtext */}
            <div className="reveal-up flex flex-col items-center gap-8 max-w-2xl mx-auto">
                <p className="text-base md:text-lg text-gray-400 font-medium leading-relaxed text-center">
                    The first interview coach that <span className="text-white">looks</span> at your confidence and <span className="text-white">listens</span> to your logic.
                </p>

                {/* BUTTONS */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                    <button
                        onClick={() => document.getElementById('configurator').scrollIntoView({ behavior: 'smooth' })}
                        className="group relative h-14 px-8 bg-white text-black rounded-full font-bold text-sm uppercase tracking-wider hover:bg-[#e0e0e0] transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.1)] w-full sm:w-auto"
                    >
                        Start Simulation
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} strokeWidth={3} />
                    </button>

                    <button
                        onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                        className="group h-14 px-8 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white font-bold text-sm uppercase tracking-wider hover:bg-white/10 hover:border-white/40 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        How it Works
                        <ChevronDown className="group-hover:translate-y-1 transition-transform" size={18} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>

        {/* Marquee Strip */}
        <div className="absolute bottom-0 w-full border-t border-white/10 bg-[#0a0a0a] py-3 z-20">
            <Marquee autoFill gradient={false} speed={40} pauseOnHover={true}>
                <div className="flex items-center gap-16 mx-8 opacity-60 cursor-default">
                    <span className="text-sm font-mono font-bold uppercase tracking-widest flex items-center gap-2 text-white"><Activity size={14} className="text-indigo-500"/> Performance Metrics</span>
                    <span className="text-sm font-mono font-bold uppercase tracking-widest flex items-center gap-2 text-white"><ScanFace size={14} className="text-indigo-500"/> Vision Tracking</span>
                    <span className="text-sm font-mono font-bold uppercase tracking-widest flex items-center gap-2 text-white"><Mic size={14} className="text-indigo-500"/> Audio Analysis</span>
                    <span className="text-sm font-mono font-bold uppercase tracking-widest flex items-center gap-2 text-white"><ShieldCheck size={14} className="text-indigo-500"/> Private</span>
                </div>
            </Marquee>
        </div>
      </section>

      {/* 2. CONFIGURATOR (Endüstriyel & Keskin Hatlar) */}
      <section id="configurator" className="py-24 px-6 bg-[#f0f0f0] text-black relative border-b border-white/10">
        <div className="max-w-6xl mx-auto">

            <div className="reveal-up mb-12 flex flex-col md:flex-row justify-between items-end border-b-4 border-black pb-6">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] text-black">
                    Setup <br/> <span className="text-indigo-600">Session</span>
                </h2>
                <div className="flex items-center gap-2 font-mono font-bold text-xs text-black/60 mt-4 md:mt-0">
                    <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
                    SYSTEM READY
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left: Mode Selection */}
                <div className="reveal-up lg:col-span-5 space-y-3">
                    <label className="text-[10px] font-black tracking-widest uppercase mb-2 block text-black/40">01 / Select Mode</label>

                    {['behavioral', 'technical'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`w-full p-6 rounded-3xl text-left transition-all duration-300 group border-[3px] relative overflow-hidden ${
                                selectedType === type 
                                ? 'bg-black border-black text-white shadow-xl scale-[1.01]' 
                                : 'bg-white border-black/10 text-black hover:border-black'
                            }`}
                        >
                            <div className="relative z-10 flex justify-between items-start mb-2">
                                {type === 'behavioral' ?
                                    <Users size={28} className={selectedType === type ? "text-indigo-400" : "text-black"}/> :
                                    <Terminal size={28} className={selectedType === type ? "text-indigo-400" : "text-black"}/>
                                }
                                {selectedType === type && <div className="bg-white p-1 rounded-full"><CheckCircle2 size={16} className="text-black"/></div>}
                            </div>
                            <h3 className="relative z-10 text-2xl font-black uppercase mb-1">{type}</h3>
                            <p className={`relative z-10 font-medium text-xs ${selectedType === type ? 'opacity-80' : 'opacity-60'}`}>
                                {type === 'behavioral' ? 'Soft skills & Culture Fit' : 'System Design & Logic'}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Right: Input & Launch */}
                <div className="reveal-up lg:col-span-7 flex flex-col h-full">
                    <label className="text-[10px] font-black tracking-widest uppercase mb-2 block text-black/40">02 / Target Role</label>

                    <div className="flex-1 bg-white border-[3px] border-black p-8 rounded-3xl relative flex flex-col justify-between group focus-within:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all duration-300">

                        <div>
                            <div className="mb-6 flex items-center gap-2 text-black/50">
                                <Briefcase size={20} className="text-black"/>
                                <span className="font-bold text-xs uppercase tracking-wider text-black">Target Position</span>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={jobRole}
                                    onChange={(e) => setJobRole(e.target.value)}
                                    placeholder="SENIOR PM..."
                                    className="w-full bg-transparent text-3xl md:text-5xl font-black text-black placeholder:text-black/10 focus:outline-none uppercase tracking-tighter"
                                />
                                <div className="absolute bottom-[-10px] left-0 w-full h-1 bg-black/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-black w-full transform -translate-x-full group-focus-within:translate-x-0 transition-transform duration-500 ease-out"></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="inline-flex items-center gap-2 bg-gray-100 border border-black/5 px-3 py-1.5 rounded-full mb-6 text-[10px] font-mono text-black/60">
                                <Info size={12} className="text-indigo-600"/>
                                AI Persona: {selectedType === 'behavioral' ? 'HR Manager' : 'Tech Lead'}
                            </div>

                            <button
                                onClick={handleStartInterview}
                                disabled={loading}
                                className="w-full py-4 bg-black text-white rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-indigo-600 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                        INITIALIZING...
                                    </>
                                ) : (
                                    <>
                                        Launch Simulation
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* 3. BENTO GRID (SPOTLIGHT CARDS EKLENDİ) */}
      <section id="features" className="py-24 px-6 bg-[#050505] border-t border-white/10 overflow-hidden">
        <div className="max-w-6xl mx-auto">

            <div className="flex flex-col md:flex-row justify-between items-end mb-16">
                <h2 className="reveal-up text-4xl md:text-7xl font-black tracking-tighter text-white uppercase leading-[0.85]">
                    Telemetry <br/> <span className="text-indigo-500">Analysis.</span>
                </h2>
                <div className="reveal-up flex items-center gap-2 mt-4 md:mt-0">
                    <div className="h-px w-8 bg-white/30" />
                    <span className="font-mono text-[10px] text-white/50 tracking-widest">LIVE DATA STREAM</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-[340px]">

                {/* 1. HERO VISION CARD */}
                <SpotlightCard className="reveal-up lg:col-span-7 bg-[#111] border-white/5 rounded-[2rem] group" lightColor="rgba(99, 102, 241, 0.15)">
                    <img
                        src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg"
                        className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                        alt="Interview Candidate"
                    />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                    <div className="absolute inset-0 p-8 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="bg-indigo-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                REC_00:12:45
                            </div>
                            <ScanFace className="text-white/50" size={24} />
                        </div>

                        {/* Face Tracking Box */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-56 border border-indigo-500/30 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-indigo-400" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-indigo-400" />
                            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-indigo-400" />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-indigo-400" />
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-indigo-400 bg-black/50 px-2 rounded">CONFIDENCE: 92%</div>
                        </div>

                        <div>
                            <h3 className="text-3xl font-black uppercase text-white mb-1 leading-none">Vision Logic</h3>
                            <p className="text-white/60 font-medium text-sm max-w-sm">468-point facial mapping analyzes eye contact and micro-expressions.</p>
                        </div>
                    </div>
                </SpotlightCard>

                {/* 2. METRICS CARD */}
                <div className="reveal-up lg:col-span-5 bg-white text-black rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group">
                    <div className="flex justify-between items-start z-10">
                        <div>
                            <h3 className="text-2xl font-black uppercase leading-none">Metrics<br/>Engine</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Analysis</span>
                            </div>
                        </div>
                        <div className="bg-black/5 p-2 rounded-full">
                            <BarChart3 size={20} className="text-black" />
                        </div>
                    </div>

                    <div className="relative z-10 mt-4 flex flex-col items-center">
                        {/* Circular Progress */}
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                <circle cx="50%" cy="50%" r="70" stroke="rgba(0,0,0,0.1)" strokeWidth="10" fill="none" />
                                <circle cx="50%" cy="50%" r="70" stroke="#000" strokeWidth="10" fill="none" strokeDasharray="440" strokeDashoffset="44" strokeLinecap="round" />
                            </svg>
                            <div className="text-center">
                                <div className="text-5xl font-black tracking-tighter leading-none">98</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">Score</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-auto z-10">
                        {['Clarity', 'Tone', 'Pacing'].map((item) => (
                            <div key={item} className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
                                <div className="text-base font-black">A+</div>
                                <div className="text-[9px] font-bold uppercase text-gray-400">{item}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. AUDIO INTELLIGENCE */}
                <SpotlightCard className="reveal-up lg:col-span-5 bg-[#1a1a1a] border-white/10 rounded-[2rem] group" lightColor="rgba(99, 102, 241, 0.15)">
                    <div className="p-8 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <div className="bg-indigo-500/10 p-3 rounded-full text-indigo-400">
                                <Mic size={20} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></span>
                                <span className="font-mono text-[10px] text-white/40 tracking-widest">REC_04:12</span>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-end">
                            {/* STATIC WAVEFORM */}
                            <div className="flex items-center justify-center gap-1.5 h-24 mb-6 opacity-80">
                                {[20, 35, 50, 75, 45, 90, 60, 80, 50, 30, 45, 20, 35, 60].map((h, i) => (
                                    <div
                                        key={i}
                                        className="w-2.5 bg-indigo-500 rounded-full"
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>

                            <h3 className="text-2xl font-black uppercase text-white">Speech Logic</h3>
                            <p className="text-white/50 font-medium text-xs mt-2">Detects filler words and monotone delivery.</p>
                        </div>
                    </div>
                </SpotlightCard>

                {/* 4. INTERACTIVE PERSONAS (SPOTLIGHT EKLENDI) */}
                <SpotlightCard className="reveal-up lg:col-span-7 bg-indigo-600 rounded-[2rem] group cursor-pointer" lightColor="rgba(255, 255, 255, 0.15)">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:20px_20px]" />

                    <div className="relative z-10 h-full flex flex-col justify-between p-8" onClick={() => setActivePersona((prev) => (prev + 1) % personas.length)}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-3xl font-black uppercase text-white leading-none">Adaptive<br/>Personas</h3>
                                <p className="text-indigo-200 font-bold mt-2 text-xs max-w-xs flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                    Tap to switch interviewer personality.
                                </p>
                            </div>
                            <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-md hover:bg-white/30 transition-colors">
                                <Users className="text-white" size={20} />
                            </div>
                        </div>

                        {/* Persona Display Stack */}
                        <div className="mt-4 relative h-36 w-full">
                            {personas.map((p, i) => (
                                <div
                                    key={i}
                                    className={`absolute inset-0 rounded-2xl p-6 flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-2xl border ${p.color}`}
                                    style={{
                                        transform: i === activePersona
                                            ? 'translateY(0) scale(1) rotate(0deg)'
                                            : 'translateY(15px) scale(0.9) rotate(-2deg)',
                                        opacity: i === activePersona ? 1 : 0,
                                        zIndex: i === activePersona ? 10 : 0,
                                        pointerEvents: i === activePersona ? 'auto' : 'none'
                                    }}
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-start border-b border-current/10 pb-3 mb-1">
                                        <div>
                                            <div className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${p.subColor}`}>Current Mode</div>
                                            <div className="text-xl font-black uppercase tracking-tight leading-none">{p.title}</div>
                                        </div>
                                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded border border-current/20 uppercase tracking-wider ${p.subColor}`}>
                                            {p.role}
                                        </div>
                                    </div>

                                    {/* Quote Area */}
                                    <div className="relative">
                                        <span className={`absolute -top-3 -left-1 text-4xl font-serif opacity-20 ${p.subColor}`}>"</span>
                                        <p className="text-base font-medium leading-tight pl-4 italic opacity-90 pr-2">
                                            {p.quote}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SpotlightCard>

            </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-black text-white pt-16 pb-8 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
            <h2 className="text-[12vw] md:text-[8vw] font-black leading-[0.8] tracking-tighter text-[#1a1a1a] cursor-default select-none">
                CANDID.
            </h2>
            <div className="text-right space-y-4">
                <div className="flex flex-col gap-1 text-xs font-bold uppercase tracking-widest text-gray-500">
                    <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                    <Link to="/methodology" className="hover:text-white transition-colors">Methodology</Link>
                    <Link to="/" className="hover:text-white transition-colors">Login</Link>
                </div>
                <p className="text-[10px] text-gray-700 font-mono">
                    © 2026 CANDID AI. SYSTEM OPTIMIZED.
                </p>
            </div>
        </div>
      </footer>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>

    </div>
  )
}