import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo Alanı - Candid & Teal */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-teal-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/20 transition-transform group-hover:scale-105">
            <Sparkles size={18} fill="currentColor" className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            Candid
          </span>
        </Link>

        {/* Sağ Taraf - Aksiyon Butonları */}
        <div className="flex items-center gap-8">

          {/* Login Butonu */}
          <Link
            to="/login"
            className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors"
          >
            Log in
          </Link>

          {/* Start Practice Butonu - Teal Tema */}
          <button
            onClick={() => document.getElementById('start-practice')?.scrollIntoView({ behavior: 'smooth' })}
            className="group flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 active:scale-95"
          >
            Start Practice
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </nav>
  )
}