import { useState, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  ScanFace, Activity, Database, Server, Cpu, Layers, Lock, ArrowRight
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

// --- SPOTLIGHT CARD (Mouse Takip Eden Işık) ---
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
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(99, 102, 241, 0.15), transparent 40%)`,
        }}
      />
      <div className="relative z-20 h-full">{children}</div>
    </div>
  )
}

export default function Methodology() {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const videoSectionRef = useRef(null)

  // Metin Referansları (Hikaye Anlatımı İçin)
  const text1Ref = useRef(null)
  const text2Ref = useRef(null)
  const text3Ref = useRef(null)

  useGSAP(() => {
    if (videoRef.current && videoSectionRef.current) {
        const video = videoRef.current

        // TIMELINE: Video ve Metinleri Senkronize Et
        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: videoSectionRef.current,
                start: "top top",
                end: "+=2000", // Mesafe kısaltıldı (Daha hızlı akış)
                pin: true,     // Ekranı kilitle
                scrub: 1,      // Yumuşak geçiş (Video akıcılığı için)
            }
        })

        // 1. VİDEO: Scroll boyunca baştan sona oynasın
        // onLoadedMetadata ile duration almak daha sağlıklı ama şimdilik manuel de olur
        tl.to(video, { currentTime: video.duration || 10, ease: "none" }, 0)

        // 2. TEXT 1: "The Engine" (Başlangıçta var, sonra kaybolsun)
        tl.to(text1Ref.current, { opacity: 0, y: -50, duration: 2 }, 0)

        // 3. TEXT 2: "Data Ingestion" (Gelip gitsin)
        tl.fromTo(text2Ref.current,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 2 }, 1.5 // Biraz gecikmeli girsin
        )
        tl.to(text2Ref.current, { opacity: 0, y: -50, duration: 2 }, 4.5) // Sonra gitsin

        // 4. TEXT 3: "Neural Analysis" (Gelsin ve kalsın)
        tl.fromTo(text3Ref.current,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 2 }, 6 // En son girsin
        )
    }

    // Diğer elementlerin animasyonu (Reveal Up)
    const sections = gsap.utils.toArray('.reveal-up')
    sections.forEach((elem) => {
      gsap.fromTo(elem,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: elem, start: 'top 85%' }
        }
      )
    })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="bg-[#030303] text-slate-200 min-h-screen font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden no-scrollbar">

      {/* CSS: Scrollbar Gizleme (İmmersion için) */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* 1. SCROLLYTELLING HERO SECTION */}
      <section ref={videoSectionRef} className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">

        {/* Background Video */}
        <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover opacity-90"
            // Daha teknik, koyu ve "network" hissi veren bir video
            src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-network-grid-9999-large.mp4"
            muted
            playsInline
            preload="auto"
        />

        {/* Cinematic Vignette & Grain */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 z-10 pointer-events-none" />

        {/* --- SCENE 1: THE ENGINE (Initial) --- */}
        <div ref={text1Ref} className="absolute z-20 text-center px-6">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-black/60 backdrop-blur-md mb-6">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/80">System Architecture</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white uppercase mb-4 drop-shadow-2xl">
                The Engine.
            </h1>
            <p className="text-white/60 font-mono text-sm tracking-widest uppercase">Scroll to Deconstruct</p>
        </div>

        {/* --- SCENE 2: DATA INGESTION (Middle) --- */}
        <div ref={text2Ref} className="absolute z-20 text-center px-6 opacity-0">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
                <ScanFace size={32} className="text-white"/>
            </div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase mb-4">
                Raw Data<br/><span className="text-indigo-500">Ingestion</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-xl mx-auto font-medium">
                Simultaneous capture of 468 facial landmarks and audio waveforms at 30ms latency.
            </p>
        </div>

        {/* --- SCENE 3: NEURAL ANALYSIS (End) --- */}
        <div ref={text3Ref} className="absolute z-20 text-center px-6 opacity-0">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(79,70,229,0.5)]">
                <Cpu size={32} className="text-white"/>
            </div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase mb-4">
                Neural<br/>Processing
            </h2>
            <p className="text-lg text-slate-300 max-w-xl mx-auto font-medium">
                Multi-modal fusion converting unstructured human signals into actionable metrics.
            </p>
        </div>

      </section>

      {/* 2. THE TECH STACK (Spotlight Cards) */}
      <section className="py-32 px-6 bg-[#030303] border-b border-white/10 relative z-30">
        <div className="max-w-7xl mx-auto">

            <div className="reveal-up mb-20">
                <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">
                    Analysis Stack
                </h3>
                <p className="text-slate-400 max-w-2xl text-lg">
                    The system operates on three concurrent threads, ensuring zero bottlenecks between visual tracking and semantic processing.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Layer 1 */}
                <SpotlightCard className="p-8 group h-full flex flex-col">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 text-indigo-400 border border-white/10">
                        <ScanFace size={24} />
                    </div>
                    <h4 className="text-xl font-black uppercase text-white mb-3">Visual Telemetry</h4>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                        Utilizing <span className="text-white">MediaPipe Face Mesh</span>, we map 3D geometry to calculate head pose (pitch/yaw/roll) and gaze vectors. This detects eye contact lapses and nervous micro-movements.
                    </p>
                    <div className="pt-6 border-t border-white/5 flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-black rounded text-[10px] font-mono text-gray-400 border border-white/10">TensorFlow.js</span>
                        <span className="px-2 py-1 bg-black rounded text-[10px] font-mono text-gray-400 border border-white/10">WebGL</span>
                    </div>
                </SpotlightCard>

                {/* Layer 2 */}
                <SpotlightCard className="p-8 group h-full flex flex-col">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 text-indigo-400 border border-white/10">
                        <Database size={24} />
                    </div>
                    <h4 className="text-xl font-black uppercase text-white mb-3">Semantic Engine</h4>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                        Speech-to-text output is fed into a fine-tuned LLM. We use <span className="text-white">Vector Embeddings</span> (RAG) to compare candidate responses against a database of optimal "STAR Method" answers.
                    </p>
                    <div className="pt-6 border-t border-white/5 flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-black rounded text-[10px] font-mono text-gray-400 border border-white/10">OpenAI API</span>
                        <span className="px-2 py-1 bg-black rounded text-[10px] font-mono text-gray-400 border border-white/10">Pinecone</span>
                    </div>
                </SpotlightCard>

                {/* Layer 3 */}
                <SpotlightCard className="p-8 group h-full flex flex-col">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 text-indigo-400 border border-white/10">
                        <Activity size={24} />
                    </div>
                    <h4 className="text-xl font-black uppercase text-white mb-3">Audio Prosody</h4>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                        Raw audio waveform analysis via <span className="text-white">Web Audio API</span>. We extract fundamental frequency (F0) to measure pitch variance, detecting monotone delivery and hesitation markers.
                    </p>
                    <div className="pt-6 border-t border-white/5 flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-black rounded text-[10px] font-mono text-gray-400 border border-white/10">FFT Analysis</span>
                        <span className="px-2 py-1 bg-black rounded text-[10px] font-mono text-gray-400 border border-white/10">Spectral Flux</span>
                    </div>
                </SpotlightCard>

            </div>
        </div>
      </section>

      {/* 3. PIPELINE DIAGRAM */}
      <section className="py-32 px-6 bg-[#050505]">
        <div className="max-w-5xl mx-auto">
            <div className="reveal-up relative bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-12 flex flex-col md:flex-row items-center justify-between gap-8 group">

                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none rounded-[2.5rem]" />

                {/* Step 1 */}
                <div className="flex flex-col items-center gap-4 relative z-10">
                    <div className="w-16 h-16 bg-black border border-white/20 rounded-2xl flex items-center justify-center text-white shadow-xl">
                        <Server size={24} />
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase text-gray-500 tracking-widest">Input Stream</span>
                </div>

                {/* Animated Line */}
                <div className="hidden md:flex flex-1 h-[1px] bg-white/10 items-center relative overflow-hidden">
                    <div className="absolute w-1/2 h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-[shimmer_2s_infinite]" />
                </div>
                <ArrowRight className="md:hidden text-white/20 rotate-90" />

                {/* Step 2 */}
                <div className="flex flex-col items-center gap-4 relative z-10">
                    <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-[0_0_40px_rgba(79,70,229,0.4)] animate-pulse">
                        <Cpu size={32} />
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase text-indigo-400 tracking-widest">Inference</span>
                </div>

                {/* Animated Line */}
                <div className="hidden md:flex flex-1 h-[1px] bg-white/10 items-center relative overflow-hidden">
                    <div className="absolute w-1/2 h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-[shimmer_2s_infinite_0.5s]" />
                </div>
                <ArrowRight className="md:hidden text-white/20 rotate-90" />

                {/* Step 3 */}
                <div className="flex flex-col items-center gap-4 relative z-10">
                    <div className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl">
                        <Layers size={24} />
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase text-gray-500 tracking-widest">Report Gen</span>
                </div>
            </div>
        </div>
      </section>

      {/* 4. PRIVACY (Simple & Strong) */}
      <section className="py-24 px-6 bg-[#030303] border-t border-white/10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="p-5 bg-white/5 rounded-full border border-white/10">
                <Lock size={32} className="text-emerald-400" />
            </div>
            <div>
                <h3 className="text-2xl font-black uppercase text-white mb-2">Local-First Processing</h3>
                <p className="text-slate-400 leading-relaxed">
                    Privacy is architectural, not just a policy. <span className="text-white font-bold">90% of the analysis</span> (Vision & Audio DSP) executes locally in your browser via WebAssembly. Your raw video feed is processed in RAM and never touches our servers.
                </p>
            </div>
        </div>
      </section>

      <footer className="bg-black border-t border-white/10 py-12 text-center text-[10px] font-mono text-slate-600 uppercase tracking-widest">
        © 2026 CANDID AI. Architecture Documentation.
      </footer>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

    </div>
  )
}