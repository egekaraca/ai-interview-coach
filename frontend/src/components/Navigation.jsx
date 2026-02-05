import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function Navigation() {
  return (
    // Z-Index 100: Her şeyin üstünde
    <nav className="fixed top-0 left-0 w-full z-[100] bg-black/50 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* 1. LOGO ALANI */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
            <Sparkles size={16} fill="currentColor" />
          </div>
          <span className="font-black text-xl tracking-tighter text-white uppercase group-hover:text-indigo-400 transition-colors">
            Candid.
          </span>
        </Link>

        {/* 2. SAĞ TARAF (Linkler + Butonlar) */}
        <div className="flex items-center gap-8">

          {/* Navigasyon Linkleri (Desktop'ta görünür) */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/methodology"
              className="text-xs font-bold text-white/60 uppercase tracking-widest hover:text-white transition-colors"
            >
              Methodology
            </Link>
            <Link
              to="/pricing"
              className="text-xs font-bold text-white/60 uppercase tracking-widest hover:text-white transition-colors"
            >
              Pricing
            </Link>
          </div>

          {/* Ayırıcı Çizgi (Divider) */}
          <div className="hidden md:block w-px h-4 bg-white/20"></div>

          {/* Login Linki */}
          <Link
            to="/login"
            className="text-xs font-bold text-white/60 uppercase tracking-widest hover:text-white transition-colors"
          >
            Log in
          </Link>

          {/* CTA Butonu */}
          <button
            onClick={() => document.getElementById('configurator')?.scrollIntoView({ behavior: 'smooth' })}
            className="group flex items-center gap-3 px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 active:scale-95"
          >
            Start Simulation
            <ArrowRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </nav>
  )
}