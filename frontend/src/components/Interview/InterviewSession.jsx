import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { FaceMesh } from '@mediapipe/face_mesh'
import { Camera } from '@mediapipe/camera_utils'
import VideoFeed from './VideoFeed'
import ControlPanel from './ControlPanel'
import TranscriptionBox from './TranscriptionBox'
import EndSessionModal from './EndSessionModal'
import DebugPanel from './DebugPanel'
import { detectGazeDirection, getDirectionDescription, GAZE_DIRECTIONS } from '../../utils/eyeContactCalculator'

/**
 * DEBUG MODE TOGGLES
 *
 * Set SHOW_DEBUG_PANEL to true to show the debug panel with all eye tracking values
 * Set SHOW_ALL_LANDMARKS to true to visualize ALL 478 face mesh points (helps diagnose tracking issues)
 * Set FORCE_SHOW_IRIS to true to ALWAYS show iris landmarks with labels (even if in normal mode)
 * Set to false in production to hide debug features
 */
const SHOW_DEBUG_PANEL = true
const SHOW_ALL_LANDMARKS = false // Set true to see ALL face mesh points (very cluttered but useful for debugging)
const FORCE_SHOW_IRIS = true // ALWAYS show iris landmarks with labels and coordinates

export default function InterviewSession() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

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
  const [showEndModal, setShowEndModal] = useState(false)

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
  const isManualStopRef = useRef(false) // Enter tuşunu takip eder

  const silenceTimerRef = useRef(null)
  const audioContextRef = useRef(null)
  const chunksRef = useRef([])
  const transcriptionRef = useRef('') // Anlık transkripsiyon yedeği
  const speechRecognitionRef = useRef(null)

  // Eye Tracking States
  const [eyeContactPercentage, setEyeContactPercentage] = useState(100)
  const [isLookingAtCamera, setIsLookingAtCamera] = useState(true)
  const [gazeDirection, setGazeDirection] = useState(GAZE_DIRECTIONS.CENTER)
  const [gazeConfidence, setGazeConfidence] = useState(1)
  const eyeContactFrames = useRef({ looking: 0, total: 0})
  const eyeContactHistory = useRef([])
  const gazeDetails = useRef(null)
  const [rawLandmarks, setRawLandmarks] = useState(null) // For debug panel diagnostics

  // Answer time
  const [answerStartTime, setAnswerStartTime] = useState(null)
  const [currentAnswerDuration, setCurrentAnswerDuration] = useState(0)
  const answerDurations = useRef([])

  // Mock data
  const interviewType = "Behavioral"
  const targetRole = "Software Engineer"

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // ========================================================================
  // FACE MESH INITIALIZATION
  // ========================================================================
  /**
   * Initialize MediaPipe Face Mesh
   *
   * WHAT IS MEDIAPIPE FACE MESH?
   * - A machine learning model created by Google
   * - Detects 478 3D points on a human face in real-time
   * - Runs in the browser using TensorFlow.js
   *
   * HOW IT WORKS:
   * 1. Takes video frames as input
   * 2. Runs neural network to find face
   * 3. Returns 478 landmark coordinates (x, y, z)
   * 4. Updates 30-60 times per second
   *
   * CONFIGURATION OPTIONS:
   * - maxNumFaces: How many faces to track (we only need 1)
   * - refineLandmarks: Extra precision for eyes/lips (REQUIRED for iris tracking!)
   * - minDetectionConfidence: How sure it needs to be to detect a face (0.5 = 50%)
   * - minTrackingConfidence: How sure to keep tracking an existing face
   */
  const initializeFaceMesh = () => {
    // Create a new Face Mesh instance
    // Load MediaPipe files from node_modules (more reliable than CDN)
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        console.log(`📦 Loading MediaPipe file: ${file}`)
        // Load from local node_modules instead of CDN
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`
      }
    })

    // Configure Face Mesh settings - MUST set options BEFORE onResults
    const options = {
      maxNumFaces: 1,              // Only track one face (the interviewee)
      refineLandmarks: true,       // CRITICAL: Enables iris tracking (468, 473 landmarks)
      minDetectionConfidence: 0.5, // 50% confidence to initially detect a face
      minTrackingConfidence: 0.5,  // 50% confidence to keep tracking the same face
      selfieMode: true             // Enable selfie mode for proper iris tracking
    }

    console.log('🔧 Initializing Face Mesh with options:', options)
    console.log('⚠️ CRITICAL: refineLandmarks is set to:', options.refineLandmarks)
    faceMesh.setOptions(options)

    // Log when setOptions completes
    console.log('✅ Face Mesh options have been set')

    // Set up callback: this function runs every time Face Mesh processes a frame
    faceMesh.onResults((results) => {
      // Check if any faces were detected
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        // === FIRST-TIME DIAGNOSTIC ===
        // Log landmark count only once when face is first detected
        if (!faceDetected) {
          console.log('✅ Face detected!')
          console.log(`📊 Total landmarks received: ${results.multiFaceLandmarks[0].length}`)
          console.log('🔍 Checking key iris landmarks:')
          console.log('  - Landmark 468 (Left Iris):', results.multiFaceLandmarks[0][468])
          console.log('  - Landmark 473 (Right Iris):', results.multiFaceLandmarks[0][473])
          console.log('🔍 Checking key eye landmarks for comparison:')
          console.log('  - Landmark 33 (Left Eye Outer):', results.multiFaceLandmarks[0][33])
          console.log('  - Landmark 133 (Left Eye Inner):', results.multiFaceLandmarks[0][133])
          console.log('  - Landmark 159 (Left Eye Top):', results.multiFaceLandmarks[0][159])
          console.log('  - Landmark 145 (Left Eye Bottom):', results.multiFaceLandmarks[0][145])
        }

        setFaceDetected(true)           // Update UI: face is present
        drawFaceLandmarks(results)      // Draw landmarks and calculate gaze
      } else {
        setFaceDetected(false)          // Update UI: no face found
        clearCanvas()                    // Clear any existing drawings
      }
    })

    // Store the Face Mesh instance so we can use it later
    faceMeshRef.current = faceMesh
    console.log('✅ Face Mesh initialized')
  }

  /**
   * Draw Face Landmarks and Calculate Gaze
   *
   * This function is called every frame when a face is detected.
   * It does three main things:
   * 1. Transform landmark coordinates to canvas coordinates
   * 2. Calculate gaze direction using our eye tracking algorithm
   * 3. Draw visual indicators on the canvas
   *
   * WHY THE COORDINATE TRANSFORMATION?
   * - MediaPipe gives us normalized coordinates (0.0 to 1.0)
   * - We need to convert these to pixel positions on our canvas
   * - Must account for video scaling, mirroring, and letterboxing
   */
  const drawFaceLandmarks = (results) => {
    // Get references to canvas and video elements
    const canvas = canvasRef.current
    const video = videoRef.current

    // Safety check: make sure everything is ready
    if (!canvas || !video || video.videoWidth === 0) return

    // Get canvas drawing context (like getting a "pen" to draw with)
    const ctx = canvas.getContext('2d')

    // Get display dimensions (what user sees on screen)
    const renderWidth = video.clientWidth    // CSS width of video element
    const renderHeight = video.clientHeight  // CSS height of video element

    // Get actual video dimensions (resolution from camera)
    const videoWidth = video.videoWidth      // Actual video resolution width
    const videoHeight = video.videoHeight    // Actual video resolution height

    // Set canvas to match display size
    canvas.width = renderWidth
    canvas.height = renderHeight

    // Clear previous frame's drawings
    ctx.clearRect(0, 0, renderWidth, renderHeight)

    // Safety check: make sure we have landmark data
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return

    // ========================================================================
    // COORDINATE TRANSFORMATION SETUP
    // ========================================================================
    /**
     * Problem: Video might be letterboxed (black bars) or stretched
     * Solution: Calculate scale and offset to map landmarks correctly
     *
     * ASPECT RATIOS:
     * - Video might be 16:9 (1.78)
     * - Display might be 4:3 (1.33) or any other ratio
     * - We need to fit video into display while maintaining aspect ratio
     */

    // Calculate aspect ratios
    const ratioVideo = videoWidth / videoHeight    // Video's aspect ratio
    const ratioRender = renderWidth / renderHeight // Display's aspect ratio

    // Determine scale factor
    let scale
    if (ratioRender > ratioVideo) {
      // Display is wider than video: fit to height, letterbox sides
      scale = renderHeight / videoHeight
    } else {
      // Display is taller than video: fit to width, letterbox top/bottom
      scale = renderWidth / videoWidth
    }

    // Calculate offsets (for centering when letterboxed)
    const xOffset = (renderWidth - (videoWidth * scale)) / 2  // Horizontal centering
    const yOffset = (renderHeight - (videoHeight * scale)) / 2 // Vertical centering

    // Get the first (and only) detected face's landmarks
    const landmarks = results.multiFaceLandmarks[0]

    // Store raw landmarks for debug panel
    setRawLandmarks(landmarks)

    // ========================================================================
    // IRIS DETECTION DIAGNOSTIC
    // ========================================================================
    /**
     * Check if iris landmarks (468, 473) are actually present
     * These are ONLY available if refineLandmarks: true is working
     */
    const hasLeftIris = landmarks[468] !== undefined
    const hasRightIris = landmarks[473] !== undefined

    // === DIAGNOSTIC LOGGING ===
    // Log iris status to console
    if (!hasLeftIris || !hasRightIris) {
      console.warn('⚠️ IRIS LANDMARKS MISSING!', {
        totalLandmarks: landmarks.length,
        hasLeftIris,
        hasRightIris,
        leftIrisData: landmarks[468],
        rightIrisData: landmarks[473],
        message: 'Iris tracking may not be enabled. Check MediaPipe configuration.'
      })
    } else if (FORCE_SHOW_IRIS) {
      // Log detailed iris position data when in diagnostic mode
      console.log('👁️ IRIS POSITION DATA:', {
        leftIris: {
          raw: `(${landmarks[468].x.toFixed(3)}, ${landmarks[468].y.toFixed(3)}, ${landmarks[468].z?.toFixed(3)})`,
          index: 468
        },
        rightIris: {
          raw: `(${landmarks[473].x.toFixed(3)}, ${landmarks[473].y.toFixed(3)}, ${landmarks[473].z?.toFixed(3)})`,
          index: 473
        },
        leftEyeInner: `(${landmarks[133].x.toFixed(3)}, ${landmarks[133].y.toFixed(3)})`,
        leftEyeOuter: `(${landmarks[33].x.toFixed(3)}, ${landmarks[33].y.toFixed(3)})`,
        rightEyeInner: `(${landmarks[362].x.toFixed(3)}, ${landmarks[362].y.toFixed(3)})`,
        rightEyeOuter: `(${landmarks[263].x.toFixed(3)}, ${landmarks[263].y.toFixed(3)})`,
        note: 'Compare iris Y values to eye corner Y values - they should be similar if correctly positioned'
      })
    }

    // ========================================================================
    // GAZE DETECTION
    // ========================================================================
    /**
     * Call our advanced gaze detection algorithm
     *
     * INPUT: 478 facial landmarks
     * OUTPUT: {
     *   isLookingAtCamera: boolean,
     *   direction: string (CENTER, LEFT, RIGHT, UP, DOWN, etc.),
     *   confidence: number (0-1),
     *   details: object (all the intermediate calculations)
     * }
     */
    const gazeResult = detectGazeDirection(landmarks)

    // Update React state with gaze information
    setIsLookingAtCamera(gazeResult.isLookingAtCamera)
    setGazeDirection(gazeResult.direction)
    setGazeConfidence(gazeResult.confidence)
    gazeDetails.current = gazeResult.details // Store details for debug panel

    // ========================================================================
    // EYE CONTACT PERCENTAGE TRACKING
    // ========================================================================
    /**
     * Track eye contact over time (only during answer recording)
     *
     * HOW IT WORKS:
     * - Every frame, increment total frame counter
     * - If looking at camera, increment "looking" counter
     * - Percentage = (looking / total) * 100
     *
     * EXAMPLE:
     * - Recorded for 100 frames
     * - Looked at camera for 80 frames
     * - Eye contact percentage = 80%
     */
    if (isListeningRef.current) {  // Only track while recording answer
        eyeContactFrames.current.total += 1  // Count this frame

        if (gazeResult.isLookingAtCamera) {
            eyeContactFrames.current.looking += 1  // Count as good eye contact
        }

        // Calculate and update percentage
        if (eyeContactFrames.current.total > 0) {
            const percentage = Math.round(
                (eyeContactFrames.current.looking / eyeContactFrames.current.total) * 100
            )
            setEyeContactPercentage(percentage)
        }
    }

    // ========================================================================
    // DRAW VISUAL LANDMARKS
    // ========================================================================
    /**
     * Draw colored dots on key facial points
     *
     * TWO MODES:
     * 1. Normal mode (SHOW_ALL_LANDMARKS = false): Only shows key points
     * 2. Debug mode (SHOW_ALL_LANDMARKS = true): Shows ALL 478 points
     *
     * COLORS:
     * - Green: Looking at camera (good!)
     * - Amber: Looking at screen but not camera
     * - Red: Looking completely away
     * - Cyan: Iris points (in debug mode)
     * - White: Other face points (in debug mode)
     *
     * KEY POINTS (Normal Mode):
     * - 1: Nose tip
     * - 33: Left eye outer corner
     * - 263: Right eye outer corner
     * - 468: Left iris center
     * - 473: Right iris center
     */
    landmarks.forEach((landmark, index) => {
      // Transform normalized coordinates (0-1) to canvas pixels
      // Note: (1 - landmark.x) to mirror the video horizontally
      const x = (1 - landmark.x) * videoWidth * scale + xOffset
      const y = landmark.y * videoHeight * scale + yOffset

      // === FORCE SHOW IRIS MODE: Always show iris landmarks prominently ===
      if (FORCE_SHOW_IRIS && (index === 468 || index === 473)) {
        // Draw LARGE, OBVIOUS iris markers with detailed info
        ctx.fillStyle = '#00FFFF' // Bright cyan
        ctx.strokeStyle = '#FF00FF' // Magenta border
        ctx.lineWidth = 3

        // Draw large circle
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()

        // Draw crosshair
        ctx.strokeStyle = '#FF0000'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x - 15, y)
        ctx.lineTo(x + 15, y)
        ctx.moveTo(x, y - 15)
        ctx.lineTo(x, y + 15)
        ctx.stroke()

        // Draw detailed label with coordinates
        ctx.fillStyle = 'black'
        ctx.fillRect(x + 20, y - 40, 140, 50)
        ctx.fillStyle = '#00FFFF'
        ctx.font = 'bold 12px monospace'
        ctx.fillText(`IRIS ${index}`, x + 25, y - 25)
        ctx.font = '10px monospace'
        ctx.fillText(`raw: ${landmark.x.toFixed(3)}, ${landmark.y.toFixed(3)}`, x + 25, y - 12)
        ctx.fillText(`canvas: ${Math.round(x)}, ${Math.round(y)}`, x + 25, y + 2)

        return // Skip other drawing logic for iris points
      }

      // === FORCE SHOW IRIS MODE: Also show eye corner landmarks for reference ===
      if (FORCE_SHOW_IRIS && (index === 133 || index === 33 || index === 362 || index === 263)) {
        // Draw eye corner markers
        ctx.fillStyle = '#FFFF00' // Yellow
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 2

        // Draw circle
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()

        // Label
        ctx.fillStyle = 'black'
        ctx.fillRect(x + 10, y - 15, 80, 20)
        ctx.fillStyle = '#FFFF00'
        ctx.font = 'bold 10px monospace'
        const label = index === 133 || index === 362 ? 'EYE INNER' : 'EYE OUTER'
        ctx.fillText(`${label} ${index}`, x + 12, y - 2)

        return // Skip other drawing logic
      }

      // === FORCE SHOW IRIS MODE: Show eye top/bottom bounds ===
      if (FORCE_SHOW_IRIS && (index === 159 || index === 145 || index === 386 || index === 374)) {
        // Draw eye top/bottom markers
        ctx.fillStyle = '#FF00FF' // Magenta
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 2

        // Draw circle
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()

        // Label
        ctx.fillStyle = 'black'
        ctx.fillRect(x + 10, y - 15, 70, 20)
        ctx.fillStyle = '#FF00FF'
        ctx.font = 'bold 10px monospace'
        const label = index === 159 || index === 386 ? 'EYE TOP' : 'EYE BOTTOM'
        ctx.fillText(`${label} ${index}`, x + 12, y - 2)

        return // Skip other drawing logic
      }

      // === NORMAL MODE: Only draw key points ===
      if (!SHOW_ALL_LANDMARKS) {
        const keyPoints = [1, 33, 263, 468, 473]

        if (keyPoints.includes(index)) {
          // Choose color based on gaze direction
          let color = '#6366f1' // default indigo (shouldn't happen)

          if (gazeResult.isLookingAtCamera) {
            color = '#10b981' // green - good eye contact!
          } else if (gazeResult.direction === GAZE_DIRECTIONS.AWAY) {
            color = '#ef4444' // red - not looking at screen at all
          } else {
            color = '#f59e0b' // amber - looking at screen, just not at camera
          }

          // Draw a small colored circle at this landmark
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(x, y, 3, 0, 2 * Math.PI)  // 3px radius circle
          ctx.fill()
        }
      }
      // === DEBUG MODE: Draw ALL landmarks ===
      else {
        let color = 'rgba(255, 255, 255, 0.3)' // default white, transparent
        let radius = 1 // small by default

        // Highlight iris points
        if (index === 468 || index === 473) {
          color = '#00ffff' // cyan - iris centers
          radius = 4
        }
        // Highlight nose tip
        else if (index === 1) {
          color = '#ff00ff' // magenta - nose tip
          radius = 3
        }
        // Highlight eye corners
        else if (index === 33 || index === 263 || index === 133 || index === 362) {
          color = '#ffff00' // yellow - eye corners
          radius = 2
        }

        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.fill()

        // Draw landmark number for key points (helps identify them)
        if (index === 1 || index === 33 || index === 263 || index === 468 || index === 473) {
          ctx.fillStyle = 'white'
          ctx.font = '10px monospace'
          ctx.fillText(index, x + 5, y - 5)
        }
      }
    })
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
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
    } catch (error) { console.error('Camera error:', error) }
  }

  const startFaceDetection = () => {
    if (!videoRef.current || !faceMeshRef.current) return
    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        // Hata Önleyici: Video hazır değilse işlemi atla
        if (faceMeshRef.current && videoRef.current && videoRef.current.videoWidth > 0) {
           try {
             await faceMeshRef.current.send({ image: videoRef.current })
           } catch (error) {
             console.warn("FaceMesh frame dropped:", error)
           }
        }
      },
      width: 1280, height: 720
    })
    cameraRef.current = camera
    camera.start()
  }

  const stopWebCam = () => {
    if (cameraRef.current) cameraRef.current.stop()
    if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null }
    setIsCameraReady(false); setFaceDetected(false)
  }

  const startListening = async () => {
    setShowTranscriptBox(true)
    setIsListening(true)
    isListeningRef.current = true
    isManualStopRef.current = false
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
                if (!event.results[i].isFinal) interim += event.results[i][0].transcript;
            }
            if (interim) setInterimTranscription(interim);
        };
        try { recognition.start(); } catch(e) {}
        speechRecognitionRef.current = recognition;
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

      mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data) }
      mediaRecorder.onstop = () => {
          sendAudioBuffer(mimeType)
          stream.getTracks().forEach(track => track.stop())
          if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close()
      }
      mediaRecorder.start(1000)
      recognitionRef.current = { mediaRecorder, stream }

      let silenceStart = Date.now()
      let isSpeaking = false
      const checkSilence = () => {
        if (!isListeningRef.current) return
        analyser.getByteFrequencyData(dataArray)
        let sum = 0; for (let i = 0; i < bufferLength; i++) sum += dataArray[i]
        const average = sum / bufferLength

        if (average > 10) {
          if (!isSpeaking) { isSpeaking = true; setIsSpeakingUI(true) }
          silenceStart = Date.now()
        } else {
          if (isSpeaking && (Date.now() - silenceStart > 1500)) {
            isSpeaking = false; setIsSpeakingUI(false)
            if (mediaRecorder.state === 'recording') mediaRecorder.stop()
          }
        }
        silenceTimerRef.current = requestAnimationFrame(checkSilence)
      }
      checkSilence()
    } catch (error) { alert('Could not access microphone.') }
  }

const sendAudioBuffer = async (mimeType) => {
    const currentChunks = [...chunksRef.current]; chunksRef.current = []
    if (currentChunks.length === 0) return
    const audioBlob = new Blob(currentChunks, { type: mimeType })
    if (audioBlob.size < 1000) return

    setInterimTranscription(''); setIsProcessing(true)
    if (speechRecognitionRef.current) speechRecognitionRef.current.stop();

    const formData = new FormData()
    formData.append('audio', audioBlob, 'audio.webm')

    // Prompt text'i backend'e bağlamayı kolaylaştırmak için
    let promptText = transcriptionRef.current || ""
    if (promptText.length > 300) promptText = promptText.substring(promptText.length - 300)
    formData.append('prompt', promptText)

    try {
      // ---------------------------------------------------------
      // DÜZELTME BURADA: URL sonuna '/transcribe' eklendi
      // Backend kodunuzda @app.post("/transcribe") yazıyorsa bu çalışır.
      // ---------------------------------------------------------
      const response = await fetch('https://acetimetric-eli-falteringly.ngrok-free.dev/api/transcribe', {
        method: 'POST',
        // Ngrok kullanırken bazen browser uyarısını geçmek gerekir:
        headers: {
             "ngrok-skip-browser-warning": "true"
        },
        body: formData
      })

      setIsProcessing(false)

      if (!response.ok) throw new Error(`Server error: ${response.status}`)

      const data = await response.json()

      // --- ENTER LOGIC & TEXT UPDATE ---
      const hasNewText = data.success && data.text;

      if (hasNewText || isManualStopRef.current) {
        setTranscription(prev => {
          const newSegment = hasNewText ? data.text.trim() : "";

          // Yeni metni oluştur
          let finalTranscription = prev;
          if (newSegment) {
             if (prev && !prev.endsWith(' ')) {
                finalTranscription = prev + " " + newSegment;
             } else {
                finalTranscription = prev ? prev + newSegment : newSegment;
             }
          }

          // Eğer manuel durdurulduysa, sonuç ne olursa olsun Edit Modunu aç
          if (isManualStopRef.current) {
            console.log("📝 Manual stop detected via Enter. Switching to edit mode.")
            setRawTranscription(finalTranscription)
            setEditedTranscription(finalTranscription)
            setEditMode(true)
            isManualStopRef.current = false // Flag'i sıfırla
          }

          return finalTranscription
        })
      }

    } catch (error) {
      console.error('Transcription error:', error);
      setIsProcessing(false);
      // --- HATA DURUMUNDA BİLE EDIT MODUNU AÇ (Kullanıcı kaybetmesin) ---
      if (isManualStopRef.current) {
          console.log("⚠️ API Error + Manual Stop: Entering Edit Mode with current text")
          triggerEditModeFallback()
      }
    }
  }

  // API hatası veya boş yanıt durumunda mevcut metinle editörü aç
  const triggerEditModeFallback = () => {
      const currentText = transcriptionRef.current || ""
      setRawTranscription(currentText)
      setEditedTranscription(currentText)
      setEditMode(true)
      isManualStopRef.current = false
  }

  const stopListening = () => {
      isListeningRef.current = false; setIsListening(false); setIsSpeakingUI(false)
      if (speechRecognitionRef.current) speechRecognitionRef.current.stop()
      if (silenceTimerRef.current) cancelAnimationFrame(silenceTimerRef.current)
      if (recognitionRef.current?.mediaRecorder?.state !== 'inactive') recognitionRef.current.mediaRecorder.stop()
  }

  const handleReadyToReply = () => {
      setAnswerStartTime(Date.now()); setCurrentAnswerDuration(0)
      eyeContactFrames.current = { looking: 0, total: 0 }; setEyeContactPercentage(100)
      startListening()
  }

  const handleSubmitAnswer = () => {
    const finalDuration = answerStartTime ? Math.floor((Date.now() - answerStartTime) / 1000) : 0
    answerDurations.current.push({ questionIndex: currentQuestionIndex, duration: finalDuration, percentage: eyeContactPercentage })
    setAnsweredQuestions(prev => new Set([...prev, currentQuestionIndex]))
    setEditMode(false); setTranscription(''); setRawTranscription(''); setEditedTranscription(''); setShowTranscriptBox(false)
    setAnswerStartTime(null); setCurrentAnswerDuration(0)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setTranscription(''); setRawTranscription(''); setEditedTranscription(''); setEditMode(false)
      eyeContactHistory.current.push({ questionIndex: currentQuestionIndex, percentage: eyeContactPercentage })
      eyeContactFrames.current = { looking: 0, total: 0 }; setEyeContactPercentage(100)
      setAnswerStartTime(null); setCurrentAnswerDuration(0)
    } else {
      eyeContactHistory.current.push({ questionIndex: currentQuestionIndex, percentage: eyeContactPercentage })
      alert('All questions answered!')
    }
  }

  const confirmEndSession = () => { navigate('/results') }

  useEffect(() => { transcriptionRef.current = transcription }, [transcription])
  useEffect(() => { const interval = setInterval(() => { setElapsedTime(prev => prev + 1) }, 1000); return () => clearInterval(interval) }, [])

  // Enter Tuşu Dinleyicisi
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && isListeningRef.current) {
          e.preventDefault();
          isManualStopRef.current = true; // Bayrağı kaldır
          stopListening();
      }
    }
    window.addEventListener('keydown', handleKeyPress); return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  useEffect(() => {
    initializeFaceMesh(); startWebCam()
    return () => {
      stopWebCam(); if (silenceTimerRef.current) cancelAnimationFrame(silenceTimerRef.current)
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close()
      if (speechRecognitionRef.current) speechRecognitionRef.current.stop()
    }
  }, [])

  useEffect(() => {
    let interval = null
    if (isListening && answerStartTime) {
        interval = setInterval(() => { setCurrentAnswerDuration(Math.floor((Date.now() - answerStartTime) / 1000)) }, 1000)
    } else { if (interval) clearInterval(interval) }
    return () => { if (interval) clearInterval(interval) }
  }, [isListening, answerStartTime])


  return (
    <div className="w-screen h-screen overflow-hidden bg-[#030303] text-white flex flex-col font-sans relative selection:bg-indigo-500 selection:text-white">

      {/* GLOBAL NOISE TEXTURE */}
      <div className="fixed inset-0 z-[60] pointer-events-none opacity-[0.05] mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Main Content Grid */}
      <div className="w-full h-full flex p-6 gap-6 relative z-10">

        {/* LEFT: Video Feed */}
        <VideoFeed
          videoRef={videoRef}
          canvasRef={canvasRef}
          faceDetected={faceDetected}
          isLookingAtCamera={isLookingAtCamera}
          eyeContactPercentage={eyeContactPercentage}
          elapsedTime={elapsedTime}
          gazeDirection={gazeDirection}
          gazeConfidence={gazeConfidence}
        />

        {/* RIGHT: Control Panel */}
        <ControlPanel
          sessionId={sessionId}
          targetRole={targetRole}
          interviewType={interviewType}
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          currentQuestion={currentQuestion}
          answeredQuestions={answeredQuestions}
          isCameraReady={isCameraReady}
          faceDetected={faceDetected}
          isListening={isListening}
          isSpeakingUI={isSpeakingUI}
          onReadyToReply={handleReadyToReply}
          onNextQuestion={handleNextQuestion}
          onEndSession={() => setShowEndModal(true)}
        />
      </div>

      {/* FLOATING TRANSCRIPT */}
      <TranscriptionBox
        showTranscriptBox={showTranscriptBox}
        isSpeakingUI={isSpeakingUI}
        isProcessing={isProcessing}
        editMode={editMode}
        transcription={transcription}
        editedTranscription={editedTranscription}
        isListening={isListening}
        onEditedTranscriptionChange={setEditedTranscription}
        onCancelEdit={() => setEditMode(false)}
        onSubmitAnswer={handleSubmitAnswer}
      />

      {/* END SESSION MODAL */}
      <EndSessionModal
        showEndModal={showEndModal}
        onClose={() => setShowEndModal(false)}
        onConfirm={confirmEndSession}
      />

      {/* DEBUG PANEL - Shows real-time eye tracking values for development */}
      {SHOW_DEBUG_PANEL && (
        <DebugPanel
          gazeDetails={gazeDetails.current}
          gazeDirection={gazeDirection}
          gazeConfidence={gazeConfidence}
          isLookingAtCamera={isLookingAtCamera}
          rawLandmarks={rawLandmarks}
        />
      )}

    </div>
  )
}