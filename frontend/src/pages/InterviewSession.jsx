import { useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { FaceMesh } from '@mediapipe/face_mesh'
import { Camera } from '@mediapipe/camera_utils'
import { Volume2 } from 'lucide-react'

export default function InterviewSession() {
  const { sessionId } = useParams()

  // State
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Transcription & Interaction States
  const [isListening, setIsListening] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [rawTranscription, setRawTranscription] = useState('')
  const [editedTranscription, setEditedTranscription] = useState('')

  // UI State
  const [showTranscriptBox, setShowTranscriptBox] = useState(false)

  // Refs
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)
  const faceMeshRef = useRef(null)
  const cameraRef = useRef(null)
  const recognitionRef = useRef(null)
  const isListeningRef = useRef(false)

  // Mock data
  const interviewType = "Behavioral"
  const targetRole = "Software Engineer"
  const currentQuestion = "Let's get to know you: What is your name and what do you do?"

  /**
   * Format time to HH:MM:SS
   */
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * Initialize MediaPipe Face Mesh
   */
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

  /**
   * Draw face landmarks (CORRECTED for object-fit: cover)
   */
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
        ctx.fillStyle = '#00FF00'
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fill()
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.beginPath()
        ctx.arc(x, y, 1.5, 0, 2 * Math.PI)
        ctx.fill()
      }
    })
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  /**
   * Start webcam
   */
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

  /**
   * Start face detection
   */
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

  /**
   * Stop webcam
   */
  const stopWebCam = () => {
    if (cameraRef.current) cameraRef.current.stop()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraReady(false)
    setFaceDetected(false)
  }

  /**
   * Start listening
   */
  const startListening = () => {
    setShowTranscriptBox(true)
    console.log('🎤 Starting audio recording...')

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support audio recording.')
      return
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setIsListening(true)
        isListeningRef.current = true

        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
        const audioChunks = []

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunks.push(event.data)
        }

        mediaRecorder.onstop = async () => {
          if (audioChunks.length === 0) return
          const mockText = " This is a simulated transcription response."
          setTranscription(prev => prev + mockText)
          audioChunks.length = 0
        }

        mediaRecorder.start()

        const interval = setInterval(() => {
          if (mediaRecorder.state === 'recording') {
             mediaRecorder.stop()
             mediaRecorder.start()
          } else {
             clearInterval(interval)
          }
        }, 3000)

        recognitionRef.current = { mediaRecorder, stream, interval }
      })
      .catch(error => {
        console.error('Microphone error:', error)
      })
  }

  /**
   * Stop listening
   */
  const stopListening = () => {
    if (recognitionRef.current) {
      const { mediaRecorder, stream, interval } = recognitionRef.current
      if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop()
      if (stream) stream.getTracks().forEach(track => track.stop())
      if (interval) clearInterval(interval)

      isListeningRef.current = false
      setIsListening(false)
    }
  }

  const handleReadyToReply = () => {
    startListening()
  }

  const handleSubmitAnswer = () => {
    console.log('📝 Submitting answer:', editMode ? editedTranscription : transcription)
    setEditMode(false)
    setTranscription('')
    setRawTranscription('')
    setEditedTranscription('')
    setShowTranscriptBox(false)
    alert('Answer saved!')
  }

  // ============ USE EFFECTS ============

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)
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
        const { mediaRecorder, stream, interval } = recognitionRef.current
        if (mediaRecorder) mediaRecorder.stop()
        if (stream) stream.getTracks().forEach(track => track.stop())
        if (interval) clearInterval(interval)
      }
    }
  }, [])

// ============ RENDER ============
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#F3F4F6',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif'
    }}>

      {/* Main Content */}
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        gap: '24px',
        padding: '24px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1
      }}>

        {/* Video Section - 65% */}
        <div style={{
          flex: '65',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '24px',
            overflow: 'hidden',
            backgroundColor: '#000',
            position: 'relative',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)',
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
          </div>
        </div>

        {/* Question & Controls Panel - 35% */}
        <div style={{
          flex: '35',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.05)',
            position: 'relative'
          }}>

            {/* Header Info (GÜNCELLENDİ) */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '24px',
                borderBottom: '1px solid #F3F4F6',
                paddingBottom: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6' }}></div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Session #{sessionId}
                    </span>
                </div>

                {/* Role and Type Labels */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500', display: 'flex', gap: '6px' }}>
                         <span style={{ color: '#9CA3AF', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '1px' }}>
                           Target Role:
                         </span>
                         {targetRole}
                    </div>
                    <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500', display: 'flex', gap: '6px' }}>
                        <span style={{ color: '#9CA3AF', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '1px' }}>
                          Type:
                        </span>
                        {interviewType}
                    </div>
                </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
              gap: '12px'
            }}>
              <div style={{
                padding: '8px',
                borderRadius: '10px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Volume2 size={20} color="#3B82F6" strokeWidth={2.5} />
              </div>
              <span style={{
                fontWeight: '700',
                fontSize: '14px',
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Question
              </span>
            </div>

            <div style={{
              fontSize: '22px',
              lineHeight: '1.5',
              fontWeight: '600',
              color: '#111827',
              marginBottom: 'auto',
              letterSpacing: '-0.3px'
            }}>
              {currentQuestion}
            </div>

            <button
              onClick={handleReadyToReply}
              disabled={!isCameraReady || !faceDetected || isListening}
              style={{
                marginTop: '32px',
                marginBottom: '80px',
                backgroundColor: isListening ? '#F3F4F6' : '#111827',
                color: isListening ? '#9CA3AF' : 'white',
                padding: '24px',
                borderRadius: '18px',
                fontWeight: '600',
                fontSize: '18px',
                border: 'none',
                cursor: (isCameraReady && faceDetected && !isListening) ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                boxShadow: isListening ? 'none' : '0 10px 20px -5px rgba(17, 24, 39, 0.2)'
              }}
            >
              {isListening ? 'Listening active...' : 'Start Answering'}
            </button>
          </div>
        </div>
      </div>

      {/* FLOATING UI LAYER */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        padding: '32px 40px',
        boxSizing: 'border-box',
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        zIndex: 50
      }}>

        {/* LEFT: Status */}
        <div style={{
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'flex-start'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1F2937',
            letterSpacing: '-1px',
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 2px 10px rgba(255,255,255,0.5)'
          }}>
            {formatTime(elapsedTime)}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
             <div style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(8px)',
                padding: '8px 14px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#4B5563'
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isCameraReady ? '#10B981' : '#F59E0B' }}></div>
                Camera
              </div>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(8px)',
                padding: '8px 14px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#4B5563'
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: faceDetected ? '#10B981' : '#EF4444' }}></div>
                Face
              </div>
          </div>
        </div>

        {/* CENTER: Transcript */}
        <div style={{
          position: 'absolute',
          left: '50%',
          bottom: '32px',
          transform: showTranscriptBox
            ? 'translateX(-50%) translateY(0)'
            : 'translateX(-50%) translateY(150%)',
          width: '40%',
          pointerEvents: showTranscriptBox ? 'auto' : 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
          opacity: showTranscriptBox ? 1 : 0
        }}>
          <div style={{
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '24px',
            boxShadow: '0 40px 80px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.03)',
            padding: '24px',
            border: editMode ? '2px solid #3B82F6' : 'none',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '80px',
            maxHeight: '220px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
              paddingBottom: '8px',
              borderBottom: '1px solid #F3F4F6'
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#9CA3AF',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {isListening ? 'Microphone Active' : editMode ? 'Editing' : 'Transcript'}
              </span>
              {isListening && (
                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444', animation: 'pulse 1.5s infinite' }}></div>
              )}
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              fontSize: '15px',
              lineHeight: '1.6',
              color: '#1F2937',
              fontWeight: '500'
            }}>
               {editMode ? (
                <textarea
                  value={editedTranscription}
                  onChange={(e) => setEditedTranscription(e.target.value)}
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '60px',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    backgroundColor: 'transparent'
                  }}
                  autoFocus
                />
              ) : (
                transcription || <span style={{ color: '#D1D5DB', fontStyle: 'italic' }}>Listening for your answer...</span>
              )}
            </div>

            {/* ENTER KEY HINT (Added Here) */}
            {isListening && (
                <div style={{
                    marginTop: '12px',
                    fontSize: '11px',
                    color: '#9CA3AF',
                    textAlign: 'center',
                    borderTop: '1px solid #F3F4F6',
                    paddingTop: '8px'
                }}>
                    Press <kbd style={{ fontFamily: 'inherit', border: '1px solid #E5E7EB', borderRadius: '4px', padding: '1px 4px', fontSize: '10px' }}>Enter</kbd> to stop recording
                </div>
            )}

            {editMode && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setEditMode(false)}
                  style={{
                    padding: '6px 12px', fontSize: '12px', fontWeight: '600',
                    borderRadius: '8px', border: 'none',
                    backgroundColor: '#F3F4F6', color: '#4B5563', cursor: 'pointer'
                  }}>
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAnswer}
                  style={{
                    padding: '6px 12px', fontSize: '12px', fontWeight: '600',
                    borderRadius: '8px', border: 'none',
                    backgroundColor: '#3B82F6', color: 'white', cursor: 'pointer'
                  }}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: End Button */}
        <div style={{ pointerEvents: 'auto' }}>
          <button
            onClick={() => {
              if (confirm('End interview?')) console.log('Ending...')
            }}
            style={{
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #FECACA',
              padding: '16px 28px',
              borderRadius: '20px',
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(220, 38, 38, 0.1)',
              transition: 'transform 0.1s',
              fontFamily: 'inherit'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            End Interview
          </button>
        </div>

      </div>
    </div>
  )
}