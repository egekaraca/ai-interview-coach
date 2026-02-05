// hooks/useCamera.js
import { useState, useRef } from 'react'

export function useCamera() {
  const [isCameraReady, setIsCameraReady] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const startWebCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setIsCameraReady(true)
        }
      }

      streamRef.current = stream
      return true
    } catch (error) {
      console.error('Camera error:', error)
      return false
    }
  }

  const stopWebCam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraReady(false)
  }

  return {
    videoRef,
    isCameraReady,
    startWebCam,
    stopWebCam
  }
}