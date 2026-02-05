import { AlertTriangle } from 'lucide-react'

export default function EndSessionModal({ showEndModal, onClose, onConfirm }) {
  if (!showEndModal) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-2xl font-black text-white uppercase mb-2">Abort Session?</h3>
        <p className="text-white/50 mb-8">All progress will be saved, but you cannot resume this instance.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors">Resume</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition-colors">End Now</button>
        </div>
      </div>
    </div>
  )
}
