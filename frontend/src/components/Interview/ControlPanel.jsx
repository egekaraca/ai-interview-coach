import { Mic, StopCircle, CheckCircle2, ChevronRight, LogOut } from 'lucide-react'

export default function ControlPanel({
  sessionId,
  targetRole,
  interviewType,
  questions,
  currentQuestionIndex,
  currentQuestion,
  answeredQuestions,
  isCameraReady,
  faceDetected,
  isListening,
  isSpeakingUI,
  onReadyToReply,
  onNextQuestion,
  onEndSession
}) {
  return (
    <div className="flex-[40] flex flex-col h-full gap-6">
      <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 flex flex-col relative overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-6">
          <div>
            <div className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest mb-1">Session ID</div>
            <div className="font-mono text-white text-sm">#{sessionId || 'DEMO_X92'}</div>
            <div className="mt-3 flex gap-2">
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase">{targetRole}</span>
              <span className="bg-white/5 text-white/60 border border-white/10 px-2 py-1 rounded text-[10px] font-bold uppercase">{interviewType}</span>
            </div>
          </div>
          <button
            onClick={onEndSession}
            className="p-3 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-white/60 transition-colors border border-white/5 hover:border-red-500/20"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Progress Bar (Segmented) */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Progress</span>
            <span className="font-mono text-xs text-indigo-400">Q{currentQuestionIndex + 1} / {questions.length}</span>
          </div>
          <div className="flex gap-1 h-1 w-full">
            {questions.map((_, idx) => (
              <div key={idx} className={`flex-1 rounded-full ${idx <= currentQuestionIndex ? 'bg-indigo-500' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>

        {/* Question (Massive) */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4 tracking-tight uppercase">
            {currentQuestion}
          </h2>
          <p className="text-white/40 font-medium text-lg border-l-2 border-indigo-500 pl-4">
            Structure your answer using the STAR method. Focus on clarity.
          </p>
        </div>

        {/* Action Buttons (Industrial) */}
        <div className="mt-auto pt-8">
          <button
            onClick={onReadyToReply}
            disabled={!isCameraReady || !faceDetected || isListening || answeredQuestions.has(currentQuestionIndex)}
            className={`w-full py-6 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 ${
              answeredQuestions.has(currentQuestionIndex)
                ? 'bg-white/10 text-white/40 cursor-default'
                : isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.4)]'
                  : 'bg-white text-black hover:bg-indigo-500 hover:text-white hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]'
            }`}
          >
            {answeredQuestions.has(currentQuestionIndex) ? (
              <>Answer Logged <CheckCircle2 size={20} /></>
            ) : isListening ? (
              <>
                <StopCircle size={24} />
                {isSpeakingUI ? 'Recording...' : 'Listening...'}
              </>
            ) : (
              <>
                <Mic size={24} />
                Start Answer
              </>
            )}
          </button>

          {answeredQuestions.has(currentQuestionIndex) && (
            <button
              onClick={onNextQuestion}
              className="mt-4 w-full py-4 rounded-xl border border-white/20 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Module' : 'Complete Session'} <ChevronRight size={16} />
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
