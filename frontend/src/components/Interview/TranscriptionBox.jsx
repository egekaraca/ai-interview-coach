export default function TranscriptionBox({
  showTranscriptBox,
  isSpeakingUI,
  isProcessing,
  editMode,
  transcription,
  editedTranscription,
  isListening,
  onEditedTranscriptionChange,
  onCancelEdit,
  onSubmitAnswer
}) {
  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl transition-all duration-500 z-50 ${showTranscriptBox ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isSpeakingUI ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
            <span className="text-[10px] font-mono uppercase font-bold text-white/60">Live Transcript</span>
          </div>
          {isProcessing && <div className="text-[10px] font-mono text-indigo-400 animate-pulse">PROCESSING_DATA...</div>}
        </div>

        <div className="min-h-[80px] max-h-[200px] overflow-y-auto text-lg font-medium text-white/90 leading-relaxed font-sans scrollbar-hide">
          {editMode ? (
            <textarea
              value={editedTranscription}
              onChange={(e) => onEditedTranscriptionChange(e.target.value)}
              className="w-full h-32 bg-white/5 rounded-xl p-4 text-white resize-none outline-none border border-white/10 focus:border-indigo-500/50"
              autoFocus
            />
          ) : (
            transcription || <span className="text-white/20 italic">Listening for speech...</span>
          )}
        </div>

        {editMode ? (
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={onCancelEdit} className="px-4 py-2 rounded-lg text-xs font-bold uppercase text-white/60 hover:text-white">Cancel</button>
            <button onClick={onSubmitAnswer} className="px-6 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold uppercase hover:bg-indigo-500">Save Entry</button>
          </div>
        ) : (
          isListening && <div className="mt-4 pt-4 border-t border-white/5 text-center text-[10px] text-white/30 uppercase tracking-widest">Press <span className="text-white">ENTER</span> to stop & edit</div>
        )}
      </div>
    </div>
  )
}
