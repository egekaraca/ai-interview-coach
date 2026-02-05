// hooks/useFaceTracking.js
import { useState, useRef, useEffect } from 'react'
import { FaceMesh } from '@mediapipe/face_mesh'
import { Camera } from '@mediapipe/camera_utils'

export function useFaceTracking(videoRef, canvasRef, isListening) {
  const [faceDetected, setFaceDetected] = useState(false)
  const [eyeContactPercentage, setEyeContactPercentage] = useState(100)
  const [isLookingAtCamera, setIsLookingAtCamera] = useState(true)

  const faceMeshRef = useRef(null)
  const cameraRef = useRef(null)
  const eyeContactFrames = useRef({ looking: 0, total: 0 })
  const eyeContactHistory = useRef([])

  // Eye contact calculation
  const calculateEyeContact = (landmarks) => {
    if (!landmarks || landmarks.length < 478) return false

    const leftInner = landmarks[33]
    const leftOuter = landmarks[133]
    const leftIris = landmarks[468]
    const rightInner = landmarks[362]
    const rightOuter = landmarks[263]
    const rightIris = landmarks[473]

    const getEyeRatio = (inner, outer, iris) => {
      const eyeWidth = Math.abs(outer.x - inner.x)
      if (eyeWidth === 0) return 0.5
      const distToInner = Math.abs(iris.x - inner.x)
      return distToInner / eyeWidth
    }

    const leftRatio = getEyeRatio(leftInner, leftOuter, leftIris)
    const rightRatio = getEyeRatio(rightInner, rightOuter, rightIris)
    const minRatio = 0.35
    const maxRatio = 0.65

    return (leftRatio > minRatio && leftRatio < maxRatio) &&
           (rightRatio > minRatio && rightRatio < maxRatio)
  }

  // Draw landmarks on canvas
  const drawFaceLandmarks = (results) => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video || video.videoWidth === 0) return

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
    let scale = ratioRender > ratioVideo ? renderWidth / videoWidth : renderHeight / videoHeight

    const xOffset = (renderWidth - (videoWidth * scale)) / 2
    const yOffset = (renderHeight - (videoHeight * scale)) / 2

    const landmarks = results.multiFaceLandmarks[0]
    const looking = calculateEyeContact(landmarks)
    setIsLookingAtCamera(looking)

    // Track eye contact only when listening
    if (isListening) {
      eyeContactFrames.current.total += 1
      if (looking) {
        eyeContactFrames.current.looking += 1
      }

      if (eyeContactFrames.current.total > 0) {
        const percentage = Math.round(
          (eyeContactFrames.current.looking / eyeContactFrames.current.total) * 100
        )
        setEyeContactPercentage(percentage)
      }
    }

    // Draw special landmarks
    const specialPoints = [1, 33, 263, 13, 14]
    landmarks.forEach((landmark, index) => {
      const x = (1 - landmark.x) * videoWidth * scale + xOffset
      const y = landmark.y * videoHeight * scale + yOffset

      if (specialPoints.includes(index)) {
        ctx.fillStyle = looking ? '#6366f1' : '#ef4444'
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, 2 * Math.PI)
        ctx.fill()
      }
    })
  }

  // Initialize FaceMesh
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
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d')
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
      }
    })

    faceMeshRef.current = faceMesh
  }

  // Start face detection
  const startFaceDetection = () => {
    if (!videoRef.current || !faceMeshRef.current) return

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (faceMeshRef.current && videoRef.current && videoRef.current.videoWidth > 0) {
          try {
            await faceMeshRef.current.send({ image: videoRef.current })
          } catch (error) {
            console.warn("FaceMesh frame dropped:", error)
          }
        }
      },
      width: 1280,
      height: 720
    })

    cameraRef.current = camera
    camera.start()
  }

  // Reset eye contact tracking
  const resetEyeContact = () => {
    eyeContactFrames.current = { looking: 0, total: 0 }
    setEyeContactPercentage(100)
  }

  // Save current eye contact to history
  const saveEyeContactToHistory = (questionIndex) => {
    eyeContactHistory.current.push({
      questionIndex,
      percentage: eyeContactPercentage
    })
  }

  // Cleanup
  const cleanup = () => {
    if (cameraRef.current) cameraRef.current.stop()
  }

  // Initialize on mount
  useEffect(() => {
    initializeFaceMesh()
    return cleanup
  }, [])

  return {
    faceDetected,
    eyeContactPercentage,
    isLookingAtCamera,
    eyeContactHistory: eyeContactHistory.current,
    startFaceDetection,
    resetEyeContact,
    saveEyeContactToHistory,
    cleanup
  }
}