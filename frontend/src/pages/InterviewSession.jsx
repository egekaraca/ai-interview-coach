import { useParams } from 'react-router-dom'
import {useState, useEffect, useRef} from 'react'
import {FaceMesh} from '@mediapipe/face_mesh'
import {Camera} from '@mediapipe/camera_utils'

export default function InterviewSession() {
  const { sessionId } = useParams()

  // State for recording status
  const [isRecording, setIsRecording] = useState(false)
  const[cameraError, setCameraError] = useState(null)
  const[isCameraReady, setIsCameraReady] = useState(false)
  const[faceDetected, setFaceDetected] = useState(false)

  // Ref to access video element (like a pointer to the <video> tag)
  const videoRef = useRef(null)
  // Store the video stream so we can stop it later
  const streamRef = useRef(null)
  const canvasRef = useRef(null)

  const faceMeshRef = useRef(null)
  const cameraRef = useRef(null)

  const initializeFaceMesh = () => {
    console.log('Initializing FaceMesh...')

    // Create facemesh instance
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        // Tell mediapipe where to find its model files
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      }
    })

    // Configure facemesh settings
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    })

    /**
     * onResults is like the processing loop
     * It runs for EVERY video frame (30-60 times per second!)
     */
    faceMesh.onResults((results) => {

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        setFaceDetected(true)
        drawFaceLandmarks(results)
      } else{
        setFaceDetected(false)
        clearCanvas()
      }
    })

    faceMeshRef.current = faceMesh
    console.log('FaceMesh initialized!')
  }

  /**
   * Draw face landmarks on canvas
   * This is like mp_drawing.draw_landmarks() in Python
   */

 const drawFaceLandmarks = (results) => {
  const canvas = canvasRef.current
  const video = videoRef.current

  if (!canvas || !video) return

  const ctx = canvas.getContext('2d')

  // CRITICAL: Match canvas resolution to video resolution
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  console.log('Video size:', video.videoWidth, 'x', video.videoHeight)
  console.log('Canvas size:', canvas.width, 'x', canvas.height)
  console.log('Video display size:', video.clientWidth, 'x', video.clientHeight)

  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const landmarks = results.multiFaceLandmarks[0]

  // Draw SPECIFIC landmarks we can verify
  // Landmark 1 = Nose tip (should be on your nose!)
  // Landmark 33 = Left eye outer corner
  // Landmark 263 = Right eye outer corner
  // Landmark 13 = Top lip center
  // Landmark 14 = Bottom lip center

  const testLandmarks = [
    { index: 1, name: 'Nose tip', color: '#FF0000' },
    { index: 33, name: 'Right eye', color: '#00FF00' },
    { index: 263, name: 'Left eye', color: '#0000FF' },
    { index: 13, name: 'Upper lip', color: '#FFFF00' },
    { index: 14, name: 'Lower lip', color: '#FF00FF' }
  ]

  testLandmarks.forEach(({ index, name, color }) => {
    const landmark = landmarks[index]
    const x = (1- landmark.x) * canvas.width
    const y = (landmark.y) * canvas.height

    console.log(`${name} (${index}):`,
      `normalized (${landmark.x.toFixed(3)}, ${landmark.y.toFixed(3)})`,
      `→ pixels (${x.toFixed(0)}, ${y.toFixed(0)})`)

    // Draw big colored circle
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, 2 * Math.PI)
    ctx.fill()

    // Draw label
    ctx.fillStyle = color
    ctx.font = '12px Arial'
    ctx.fillText(name, x + 10, y)
  })

  // Draw all other landmarks in small green
  landmarks.forEach((landmark, index) => {
    if ([1, 33, 263, 13, 14].includes(index)) return // Skip test landmarks

    const x = (1- landmark.x) * canvas.width
    const y = landmark.y * canvas.height

    ctx.fillStyle = '#00FF0080' // Semi-transparent green
    ctx.beginPath()
    ctx.arc(x, y, 2, 0, 2 * Math.PI)
    ctx.fill()
  })
}

  /**
   * Clear the canvas (when no face detected)
   */

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const startWebCam = async () => {
    try{
      console.log('Requesting webcam access...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false
      })

      console.log('Webcam access granted!')

      if(videoRef.current){
        videoRef.current.srcObject = stream
        // Wait for video to load before setting state to indicate camera is ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          console.log('Video loaded!')
          setIsCameraReady(true)

          startFaceDetection()
        }
      }
      streamRef.current = stream
    }

    catch(error){
      console.error('Failed to access webcam:', error)

      // Show error message to user
      if (error.name === 'NotAllowedError') {
        setCameraError('You need to grant camera access to use this app.')
      } else if (error.name === 'NotFoundError') {
        setCameraError('No camera found. Please make sure you have a webcam connected.')
      } else {
        setCameraError('Failed to access camera: ' + error.message)
      }
    }
  }

  const startFaceDetection = () => {
    if(!videoRef.current || !faceMeshRef.current) return

    console.log('Starting face detection...')

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await faceMeshRef.current.send({ image: videoRef.current })
      },
      width: 1280,
      height: 720
    })

    cameraRef.current = camera
    camera.start()
    console.log('Face detection started!')
  }

  const stopWebCam = () => {
    if (streamRef.current) {
      // Stop all tracks
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
      setIsCameraReady(false)
      setFaceDetected(false)
      console.log('Camera stopped.')
    }
  }

  /**
   * useEffect - runs when component loads
   * This automatically starts the camera when page opens
   */

  useEffect(() => {
    initializeFaceMesh()
    // Start camera when component mounts
    startWebCam()
    // Cleanup function - runs when component unmounts
    // This ensures we stop camera when user leaves page
    return () => {
      stopWebCam()
    }
  }, []) // Empty array = run once on mount

  return (
  <div className="max-w-7xl mx-auto p-4">
    {/* Header */}
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h1 className="text-2xl font-bold mb-2">Interview Session #{sessionId}</h1>
      <div className="flex items-center space-x-4 text-sm">
        <span className={isCameraReady ? 'text-green-600' : 'text-gray-400'}>
          📹 Camera: {isCameraReady ? 'Active' : 'Starting...'}
        </span>
        <span className={faceDetected ? 'text-green-600' : 'text-gray-400'}>
          👤 Face: {faceDetected ? 'Detected' : 'Not detected'}
        </span>
      </div>
    </div>

    {/* Main Content - Side by side */}
<div className="flex flex-col md:flex-row gap-6">

  {/* Left: Video - FIXED 16:9 aspect ratio */}
<div style={{ width: '400px', flexShrink: 0 }}>
  <div style={{
    position: 'relative',
    width: '1280px',
    height: '720px',  // 16:9 ratio (400 ÷ 16 × 9 = 225)
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    overflow: 'hidden'
  }}>
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '1280px',
        height: '720px',
        transform: 'scaleX(-1)',
        objectFit: 'cover'
      }}
    />

    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '1280px',
        height: '720px',
        pointerEvents: 'none'
      }}
    />
  </div>
</div>

  {/* Right: Controls - TAKES REST OF SPACE */}
  <div className="flex-1 bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-bold mb-4">Current Question</h2>
    <p className="text-gray-700 mb-6">
      Tell me about a time when you had to solve a challenging problem at work.
    </p>

    {/* Face Detection Status */}
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="text-sm font-medium text-gray-700 mb-2">
        Face Detection Status:
      </div>
      {faceDetected ? (
        <div className="flex items-center text-green-600">
          <span className="text-2xl mr-2">✅</span>
          <span>Face detected and tracking!</span>
        </div>
      ) : (
        <div className="flex items-center text-orange-600">
          <span className="text-2xl mr-2">⚠️</span>
          <span>No face detected. Position yourself in frame.</span>
        </div>
      )}
    </div>

    {/* Placeholder for metrics */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="text-sm font-medium text-gray-600 mb-1">Eye Contact</div>
        <div className="text-2xl font-bold text-blue-600">0%</div>
      </div>
      <div className="p-4 bg-green-50 rounded-lg">
        <div className="text-sm font-medium text-gray-600 mb-1">Posture</div>
        <div className="text-2xl font-bold text-green-600">0%</div>
      </div>
    </div>

    <button
      onClick={() => setIsRecording(!isRecording)}
      disabled={!isCameraReady || !faceDetected}
      className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
        !isCameraReady || !faceDetected
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : isRecording 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
      }`}
    >
      {!isCameraReady
        ? 'Waiting for camera...'
        : !faceDetected
          ? 'Waiting for face...'
          : isRecording
            ? '⏹ Stop Recording'
            : '⏺ Start Recording'
      }
    </button>
  </div>
</div>
  </div>
)}
