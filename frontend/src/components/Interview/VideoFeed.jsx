import { Clock, ScanFace, Eye } from 'lucide-react'
import { getDirectionDescription, GAZE_DIRECTIONS } from '../../utils/eyeContactCalculator'

export default function VideoFeed({
  videoRef,
  canvasRef,
  faceDetected,
  isLookingAtCamera,
  eyeContactPercentage,
  elapsedTime,
  gazeDirection,
  gazeConfidence
}) {
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex-[60] flex flex-col relative h-full">
      <div className="w-full h-full rounded-[2rem] overflow-hidden bg-[#0a0a0a] border border-white/10 relative shadow-2xl flex items-center justify-center group">

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1] opacity-90"
        />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-60" />

        {/* OVERLAY: HUD Elements */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
          {/* Top Bar */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-1 rounded-md text-[10px] font-mono font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                LIVE_FEED
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-md text-[10px] font-mono text-white/60">
                CAM_01: ACTIVE
              </div>
            </div>

            {/* Face Status */}
            <div className={`px-4 py-2 rounded-lg text-[11px] font-mono font-bold border shadow-lg flex items-center gap-2 transition-all ${
              faceDetected
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                : 'bg-black border-red-500 text-red-500'
            }`}>
              <ScanFace size={16} />
              {faceDetected ? 'TRACKING LOCKED' : 'SEARCHING FACE...'}
            </div>
          </div>

          {/* Bottom Bar (Metrics) */}
          <div className="flex items-end justify-between">
            <div className="flex gap-2">
              {/* Time Widget */}
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 min-w-[100px]">
                <div className="text-[10px] text-white/40 font-mono mb-1 uppercase tracking-wider">Session Time</div>
                <div className="text-lg font-mono font-bold text-white flex items-center gap-2">
                  <Clock size={16} className="text-indigo-500" />
                  {formatTime(elapsedTime)}
                </div>
              </div>

              {/* Eye Contact Widget */}
              {faceDetected && (
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 min-w-[120px]">
                  <div className="text-[10px] text-white/40 font-mono mb-1 uppercase tracking-wider">Vision Lock</div>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isLookingAtCamera ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`} />
                    <div className={`text-lg font-mono font-bold ${eyeContactPercentage > 70 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {eyeContactPercentage}%
                    </div>
                  </div>
                </div>
              )}

              {/* Gaze Direction Widget */}
              {faceDetected && gazeDirection && (
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 min-w-[140px]">
                  <div className="text-[10px] text-white/40 font-mono mb-1 uppercase tracking-wider">Gaze Track</div>
                  <div className="flex items-center gap-2">
                    <Eye size={16} className={`${
                      gazeDirection === GAZE_DIRECTIONS.CENTER
                        ? 'text-emerald-400'
                        : gazeDirection === GAZE_DIRECTIONS.AWAY
                          ? 'text-red-400'
                          : 'text-amber-400'
                    }`} />
                    <div className={`text-xs font-mono font-bold ${
                      gazeDirection === GAZE_DIRECTIONS.CENTER
                        ? 'text-emerald-400'
                        : gazeDirection === GAZE_DIRECTIONS.AWAY
                          ? 'text-red-400'
                          : 'text-amber-400'
                    }`}>
                      {gazeDirection.toUpperCase().replace('-', ' ')}
                    </div>
                  </div>
                  <div className="mt-1 text-[9px] text-white/30 font-mono">
                    {Math.round(gazeConfidence * 100)}% conf
                  </div>
                </div>
              )}
            </div>

            {/* Audio Vis (Fake) */}
            <div className="flex items-end gap-1 h-8">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-white/20 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none" />
      </div>
    </div>
  )
}
