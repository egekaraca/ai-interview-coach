import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { FaceMesh } from '@mediapipe/face_mesh'
import { Camera } from '@mediapipe/camera_utils'
import {
  Volume2, Mic, StopCircle, CheckCircle2, Save, X,
  Video as VideoIcon, Clock, ChevronRight, LogOut, AlertTriangle
} from 'lucide-react'

export default function InterviewSession() {
  const { sessionId } = useParams()
  const navigate = useNavigate() // Yönlendirme için

  const [questions] = useState([
    "Let's get to know you: What is your name and what do you do?",
    "Tell me about a challenging project you worked on recently.",
    "Describe a time when you had to work with a difficult team member. How did you handle it?",
    "What are your greatest strengths and weaknesses?",
    "Why do you want this role, and what makes you a good fit?",
    "Tell me about a time you failed. What did you learn from it?",
    "Where do you see yourself in 5 years?",
    "Do you have any questions for me?"
  ])

  // Question States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set())
  const currentQuestion = questions[currentQuestionIndex]

  // State
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showEndModal, setShowEndModal] = useState(false) // MODAL STATE

  // Transcription & Interaction States
  const [isListening, setIsListening] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [interimTranscription, setInterimTranscription] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [rawTranscription, setRawTranscription] = useState('')
  const [editedTranscription, setEditedTranscription] = useState('')

  // UI State
  const [isSpeakingUI, setIsSpeakingUI] = useState(false)
  const [showTranscriptBox, setShowTranscriptBox] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Refs
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)
  const faceMeshRef = useRef(null)
  const cameraRef = useRef(null)
  const recognitionRef = useRef(null)
  const isListeningRef = useRef(false)

  const silenceTimerRef = useRef(null)
  const audioContextRef = useRef(null)
  const chunksRef = useRef([])
  const transcriptionRef = useRef('')
  const speechRecognitionRef = useRef(null)

  // Mock data
  const interviewType = "Behavioral"
  const targetRole = "Software Engineer"

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // --- LOGIC (UNCHANGED) ---
  const initializeFaceMesh = () => {
    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    })
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })
    faceMesh.onResults((results) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        setFaceDetected(true)
        drawFaceLandmarks(results)
      } else {
        setFaceDetected(false)
        clearCanvas()
      }
    })
    faceMeshRef.current = faceMesh
  }

  const drawFaceLandmarks = (results) => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')
    const renderWidth = video.clientWidth
    const renderHeight = video.clientHeight
    const videoWidth = video.videoWidth
    const videoHeight = video.videoHeight

    canvas.width = renderWidth
    canvas.height = renderHeight
    ctx.clearRect(0, 0, renderWidth, renderHeight)

    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return

    const ratioVideo = videoWidth / videoHeight
    const ratioRender = renderWidth / renderHeight
    let scale;

    if (ratioRender > ratioVideo) {
      scale = renderWidth / videoWidth
    } else {
      scale = renderHeight / videoHeight
    }

    const xOffset = (renderWidth - (videoWidth * scale)) / 2
    const yOffset = (renderHeight - (videoHeight * scale)) / 2

    const landmarks = results.multiFaceLandmarks[0]

    landmarks.forEach((landmark, index) => {
      const x = (1 - landmark.x) * videoWidth * scale + xOffset
      const y = landmark.y * videoHeight * scale + yOffset
      const specialPoints = [1, 33, 263, 13, 14]

      if (specialPoints.includes(index)) {
        ctx.fillStyle = '#2DD4BF' // Teal-400
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fill()
        ctx.shadowBlur = 10
        ctx.shadowColor = '#0D9488'
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
        ctx.beginPath()
        ctx.arc(x, y, 1.5, 0, 2 * Math.PI)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    })
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const startWebCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setIsCameraReady(true)
          startFaceDetection()
        }
      }
      streamRef.current = stream
    } catch (error) {
      console.error('Camera error:', error)
    }
  }

  const startFaceDetection = () => {
    if (!videoRef.current || !faceMeshRef.current) return
    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (faceMeshRef.current) {
           await faceMeshRef.current.send({ image: videoRef.current })
        }
      },
      width: 1280,
      height: 720
    })
    cameraRef.current = camera
    camera.start()
  }

  const stopWebCam = () => {
    if (cameraRef.current) cameraRef.current.stop()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraReady(false)
    setFaceDetected(false)
  }

  const startListening = async () => {
    setShowTranscriptBox(true)
    setIsListening(true)
    isListeningRef.current = true
    chunksRef.current = []
    setInterimTranscription('')

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (!event.results[i].isFinal) {
                    interim += event.results[i][0].transcript;
                }
            }
            if (interim) {
                setInterimTranscription(interim);
            }
        };

        try { recognition.start(); } catch(e) {}
        speechRecognitionRef.current = recognition;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support audio recording.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      await audioContext.resume()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      analyser.fftSize = 512
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      audioContextRef.current = audioContext

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      const mediaRecorder = new MediaRecorder(stream, { mimeType })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      mediaRecorder.start(1000)
      let silenceStart = Date.now()
      let isSpeaking = false

      const checkSilence = () => {
        if (!isListeningRef.current) return
        analyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i]
        const average = sum / bufferLength
        const threshold = 10

        if (average > threshold) {
          if (!isSpeaking) {
            isSpeaking = true
            setIsSpeakingUI(true)
          }
          silenceStart = Date.now()
        } else {
          if (isSpeaking && (Date.now() - silenceStart > 1200)) {
            isSpeaking = false
            setIsSpeakingUI(false)
            if (mediaRecorder.state === 'recording') {
                mediaRecorder.requestData()
                setTimeout(() => sendAudioBuffer(mimeType), 50)
            }
          }
        }
        silenceTimerRef.current = requestAnimationFrame(checkSilence)
      }
      checkSilence()
      recognitionRef.current = { mediaRecorder, stream }
    } catch (error) {
      console.error('Microphone error:', error)
      alert('Could not access microphone.')
    }
  }

  const sendAudioBuffer = async (mimeType) => {
    if (chunksRef.current.length === 0) return
    const audioBlob = new Blob(chunksRef.current, { type: mimeType })
    if (audioBlob.size < 1000) { chunksRef.current = []; return }

    setInterimTranscription('')
    if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        setTimeout(() => {
            if (isListeningRef.current && speechRecognitionRef.current) {
                 try { speechRecognitionRef.current.start(); } catch(e) {}
            }
        }, 100);
    }

    chunksRef.current = []
    setIsProcessing(true)
    const formData = new FormData()
    formData.append('audio', audioBlob, 'audio.webm')
    let promptText = transcriptionRef.current || ""
    if (promptText.length > 300) promptText = promptText.substring(promptText.length - 300)
    formData.append('prompt', promptText)

    try {
      const response = await fetch('http://127.0.0.1:8000/api/transcribe', { method: 'POST', body: formData })
      setIsProcessing(false)
      if (!response.ok) throw new Error(`Server error: ${response.status}`)
      const data = await response.json()
      if (data.success && data.text) {
        setTranscription(prev => {
            const newText = data.text.trim()
            if (!newText) return prev
            if (prev && !prev.endsWith(' ')) return prev + " " + newText
            return prev ? prev + newText : newText
        })
      }
    } catch (error) {
      console.error('Transcription error:', error)
      setIsProcessing(false)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      const { mediaRecorder, stream } = recognitionRef.current
      if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop()
      if (stream) stream.getTracks().forEach(track => track.stop())
      if (audioContextRef.current) audioContextRef.current.close()
      if (silenceTimerRef.current) cancelAnimationFrame(silenceTimerRef.current)
      if (speechRecognitionRef.current) speechRecognitionRef.current.stop()
      isListeningRef.current = false
      setIsListening(false)
      setIsSpeakingUI(false)
      setInterimTranscription('')
    }
  }

  const handleReadyToReply = () => { startListening() }

  const handleSubmitAnswer = () => {
    setAnsweredQuestions(prev => new Set([...prev, currentQuestionIndex]))
    setEditMode(false)
    setTranscription('')
    setRawTranscription('')
    setEditedTranscription('')
    setShowTranscriptBox(false)
    alert('Answer saved!')
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setTranscription('')
      setRawTranscription('')
      setEditedTranscription('')
      setEditMode(false)
    } else {
      alert('All questions answered!')
    }
  }

  // --- NEW: SESSION END LOGIC ---
  const confirmEndSession = () => {
    console.log('Ending Session...')
    stopListening()
    stopWebCam()
    navigate('/') // Ana sayfaya yönlendir
  }

  useEffect(() => { transcriptionRef.current = transcription }, [transcription])

  useEffect(() => {
    const interval = setInterval(() => { setElapsedTime(prev => prev + 1) }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && isListening) {
        stopListening()
        setRawTranscription(transcription)
        setEditedTranscription(transcription)
        setEditMode(true)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isListening, transcription])

  useEffect(() => {
    initializeFaceMesh()
    startWebCam()
    return () => {
      stopWebCam()
      if (recognitionRef.current) {
        const { mediaRecorder, stream } = recognitionRef.current
        if (mediaRecorder) mediaRecorder.stop()
        if (stream) stream.getTracks().forEach(track => track.stop())
        if (silenceTimerRef.current) cancelAnimationFrame(silenceTimerRef.current)
        if (audioContextRef.current) audioContextRef.current.close()
        if (speechRecognitionRef.current) speechRecognitionRef.current.stop()
      }
    }
  }, [])

// ============ RENDER ============
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif'
    }}>

      {/* Main Content */}
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        gap: '32px',
        padding: '32px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1
      }}>

        {/* LEFT: Video Section */}
        <div style={{
          flex: '60',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '32px',
            overflow: 'hidden',
            backgroundColor: '#0F172A',
            position: 'relative',
            boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)'
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
              }}
            />

            {/* LIVE INDICATOR (Top Left) */}
            <div style={{
                position: 'absolute',
                top: '24px',
                left: '24px',
                padding: '6px 12px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'white',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '0.5px'
            }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }}></div>
                RECORDING
            </div>

            {/* STATUS INDICATORS (Bottom Left inside Video) */}
            <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                display: 'flex',
                gap: '12px',
                zIndex: 10
            }}>
                {/* Time */}
                <div style={{
                    padding: '8px 16px',
                    borderRadius: '99px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '600',
                    fontVariantNumeric: 'tabular-nums'
                }}>
                    <Clock size={14} className="text-white/80" />
                    {formatTime(elapsedTime)}
                </div>

                {/* Cam Status */}
                <div style={{
                    padding: '8px 12px',
                    borderRadius: '99px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    color: isCameraReady ? '#34D399' : '#F87171',
                    fontSize: '12px', fontWeight: '700'
                }}>
                    <VideoIcon size={14}/>
                    {isCameraReady ? 'CAM ON' : 'CAM OFF'}
                </div>

                {/* Face Status */}
                <div style={{
                    padding: '8px 12px',
                    borderRadius: '99px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    color: faceDetected ? '#34D399' : '#F87171',
                    fontSize: '12px', fontWeight: '700'
                }}>
                    <CheckCircle2 size={14}/>
                    {faceDetected ? 'FACE OK' : 'NO FACE'}
                </div>
            </div>

          </div>
        </div>

        {/* RIGHT: Control Panel */}
        <div style={{
          flex: '40',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '32px',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            border: '1px solid #E2E8F0',
            position: 'relative'
          }}>

            {/* Header: Session Info & END BUTTON (Top Right) */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '32px',
              paddingBottom: '20px',
              borderBottom: '1px solid #F1F5F9',
              position: 'relative'
            }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  Session ID
                </div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', fontFamily: 'monospace', marginBottom: '12px' }}>
                  #{sessionId || 'DEMO-01'}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ padding: '6px 12px', backgroundColor: '#F0FDFA', color: '#0D9488', borderRadius: '8px', fontSize: '12px', fontWeight: '600', border: '1px solid #CCFBF1' }}>
                    {targetRole}
                    </div>
                    <div style={{ padding: '6px 12px', backgroundColor: '#F1F5F9', color: '#64748B', borderRadius: '8px', fontSize: '12px', fontWeight: '600' }}>
                    {interviewType}
                    </div>
                </div>
              </div>

              {/* End Button - Top Right of Panel */}
              <button
                onClick={() => setShowEndModal(true)} // Open Modal
                style={{
                    backgroundColor: 'white',
                    color: '#64748B',
                    border: '1px solid #E2E8F0',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#FECACA';
                    e.currentTarget.style.color = '#EF4444';
                    e.currentTarget.style.backgroundColor = '#FEF2F2';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.color = '#64748B';
                    e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                  <LogOut size={16} />
                  End Session
              </button>
            </div>

            {/* Question Progress */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{
                    width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#0F172A',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold'
                }}>
                    Q{currentQuestionIndex + 1}
                </div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Question Analysis
                </span>
              </div>
              <div style={{ width: '100%', height: '4px', backgroundColor: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                      width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                      height: '100%',
                      backgroundColor: '#0D9488',
                      transition: 'width 0.5s ease'
                  }} />
              </div>
            </div>

            {/* Question Text */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start'
            }}>
                <h2 style={{
                fontSize: '28px',
                lineHeight: '1.3',
                fontWeight: '700',
                color: '#0F172A',
                marginBottom: '16px',
                letterSpacing: '-0.02em'
                }}>
                {currentQuestion}
                </h2>
                <p style={{ color: '#64748B', fontSize: '16px', lineHeight: '1.5' }}>
                    Take your time to structure your answer. Focus on the STAR method.
                </p>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: 'auto' }}>
                <button
                onClick={handleReadyToReply}
                disabled={!isCameraReady || !faceDetected || isListening || answeredQuestions.has(currentQuestionIndex)}
                style={{
                    width: '100%',
                    padding: '24px',
                    borderRadius: '20px',
                    backgroundColor: answeredQuestions.has(currentQuestionIndex) ? '#F1F5F9' : isListening ? '#FEE2E2' : '#0D9488',
                    color: answeredQuestions.has(currentQuestionIndex) ? '#94A3B8' : isListening ? '#EF4444' : 'white',
                    border: 'none',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: (isCameraReady && faceDetected && !isListening && !answeredQuestions.has(currentQuestionIndex)) ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    boxShadow: (isListening || answeredQuestions.has(currentQuestionIndex)) ? 'none' : '0 10px 25px -5px rgba(13, 148, 136, 0.4)'
                }}
                >
                {answeredQuestions.has(currentQuestionIndex) ? (
                    <>
                        <CheckCircle2 size={24} />
                        Answer Recorded
                    </>
                ) : isListening ? (
                    <>
                        <StopCircle size={24} className={isSpeakingUI ? "animate-pulse" : ""} />
                        {isSpeakingUI ? 'Listening...' : 'Silence...'}
                    </>
                ) : (
                    <>
                        <Mic size={24} />
                        Start Answering
                    </>
                )}
                </button>

                {answeredQuestions.has(currentQuestionIndex) && (
                <button
                    onClick={handleNextQuestion}
                    style={{
                    marginTop: '16px',
                    width: '100%',
                    padding: '20px',
                    borderRadius: '20px',
                    backgroundColor: '#0F172A',
                    color: 'white',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(15, 23, 42, 0.2)'
                    }}
                >
                    {currentQuestionIndex < questions.length - 1 ? (
                        <>Next Question <ChevronRight size={20}/></>
                    ) : 'Finish Interview'}
                </button>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* TRANSCRIPT BOX (Floating Center - WIDER) */}
      <div style={{
          position: 'absolute',
          left: '50%',
          bottom: '32px',
          transform: showTranscriptBox ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(120%)',
          width: editMode || isListening ? '700px' : '500px',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 40,
          opacity: showTranscriptBox ? 1 : 0
      }}>
          <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 20px 60px -10px rgba(0,0,0,0.1)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column'
          }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          backgroundColor: isSpeakingUI ? '#10B981' : '#94A3B8',
                          boxShadow: isSpeakingUI ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none',
                          transition: 'all 0.2s'
                      }} />
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                          {isListening ? 'Recording Answer...' : 'Transcript'}
                      </span>
                  </div>
                  {isProcessing && <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>}
              </div>

              <div style={{
                  minHeight: '60px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#334155',
                  fontWeight: '500',
                  marginBottom: editMode ? '16px' : '0'
              }}>
                  {editMode ? (
                      <textarea
                          value={editedTranscription}
                          onChange={(e) => setEditedTranscription(e.target.value)}
                          style={{
                              width: '100%', height: '200px', border: 'none', outline: 'none',
                              resize: 'none', fontFamily: 'inherit', color: '#0F172A',
                              backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '12px'
                          }}
                          autoFocus
                      />
                  ) : (
                      <>
                          {transcription || interimTranscription ? (
                              <>
                                  <span>{transcription}</span>
                                  <span style={{ color: '#94A3B8' }}> {interimTranscription}</span>
                              </>
                          ) : (
                              <span style={{ color: '#CBD5E1', fontStyle: 'italic' }}>Listening... Speak clearly.</span>
                          )}
                      </>
                  )}
              </div>

              {editMode && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => setEditMode(false)} style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: 'white', border: '1px solid #E2E8F0', color: '#64748B', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                      <button onClick={handleSubmitAnswer} style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: '#0D9488', border: 'none', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Save size={14} /> Save Answer
                      </button>
                  </div>
              )}

              {isListening && !editMode && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #F1F5F9', textAlign: 'center', fontSize: '11px', color: '#94A3B8' }}>
                      Press <kbd style={{ fontFamily: 'sans-serif', border: '1px solid #E2E8F0', padding: '2px 6px', borderRadius: '4px', margin: '0 4px' }}>Enter</kbd> to finish
                  </div>
              )}
          </div>
      </div>

      {/* --- END SESSION MODAL (NEW) --- */}
      {showEndModal && (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 60,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.6)', // Slate-900 / 60%
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '32px',
                width: '400px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
            }}>
                <div style={{
                    width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FEF2F2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
                    color: '#EF4444'
                }}>
                    <AlertTriangle size={28} />
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                    End Interview Session?
                </h3>

                <p style={{ fontSize: '15px', color: '#64748B', marginBottom: '32px', lineHeight: '1.5' }}>
                    Your current progress will be saved, but you won't be able to resume this exact session later.
                </p>

                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                    <button
                        onClick={() => setShowEndModal(false)}
                        style={{
                            flex: 1, padding: '14px', borderRadius: '14px',
                            backgroundColor: 'white', border: '1px solid #E2E8F0',
                            color: '#475569', fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmEndSession}
                        style={{
                            flex: 1, padding: '14px', borderRadius: '14px',
                            backgroundColor: '#EF4444', border: 'none',
                            color: 'white', fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        End Session
                    </button>
                </div>
            </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

    </div>
  )
}