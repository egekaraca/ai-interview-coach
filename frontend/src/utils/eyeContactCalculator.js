/**
 * ========================================
 * ADVANCED EYE TRACKING & GAZE DETECTION
 * ========================================
 *
 * This file contains the core algorithms for detecting where a user is looking.
 * It uses MediaPipe Face Mesh, which provides 478 3D landmark points on a face.
 *
 * KEY CONCEPTS:
 *
 * 1. FACE MESH LANDMARKS
 *    - MediaPipe Face Mesh gives us 478 points on the face
 *    - Each point has x, y, z coordinates (normalized 0-1)
 *    - We use specific points for eyes, nose, mouth to calculate gaze
 *
 * 2. IRIS TRACKING
 *    - Points 468 and 473 are the centers of the left and right iris
 *    - By comparing iris position to eye corners, we know where eyes are looking
 *    - Similar to how you can tell where someone is looking by seeing their pupils
 *
 * 3. HEAD POSE ESTIMATION
 *    - Even if eyes look centered, if head is turned away, person isn't looking at camera
 *    - We calculate yaw (left/right rotation), pitch (up/down tilt), roll (sideways tilt)
 *    - This helps us compensate for natural head movements
 *
 * 4. GAZE VECTOR
 *    - Combine iris position + head pose to get true gaze direction
 *    - More accurate than just looking at eyes or head alone
 *
 * LEARNING RESOURCES:
 * - MediaPipe Face Mesh: https://google.github.io/mediapipe/solutions/face_mesh.html
 * - Gaze estimation paper: https://arxiv.org/abs/1711.09017
 */

/**
 * LANDMARK INDICES
 *
 * These numbers correspond to specific points on the face in MediaPipe's Face Mesh model.
 * Think of them as "coordinates" or "addresses" for different parts of the face.
 *
 * WHY THESE SPECIFIC NUMBERS?
 * - MediaPipe assigns each facial feature a number (0-477)
 * - These were determined by Google's research team through machine learning
 * - We use them to access the exact points we need
 *
 * VISUALIZATION:
 * Imagine looking at someone's face:
 * - Point 33 is the outer corner of their left eye
 * - Point 133 is the inner corner of their left eye
 * - Point 468 is the center of their left iris (the colored circle)
 * - And so on...
 */
const LANDMARKS = {
  // Left eye
  LEFT_EYE_INNER: 133,
  LEFT_EYE_OUTER: 33,
  LEFT_EYE_TOP: 159,
  LEFT_EYE_BOTTOM: 145,
  LEFT_IRIS_CENTER: 468,

  // Right eye
  RIGHT_EYE_INNER: 362,
  RIGHT_EYE_OUTER: 263,
  RIGHT_EYE_TOP: 386,
  RIGHT_EYE_BOTTOM: 374,
  RIGHT_IRIS_CENTER: 473,

  // Face reference points for head pose
  NOSE_TIP: 1,
  CHIN: 152,
  LEFT_EYE_CORNER: 33,
  RIGHT_EYE_CORNER: 263,
  LEFT_MOUTH: 61,
  RIGHT_MOUTH: 291,
  FOREHEAD: 10
}

// Gaze direction constants
export const GAZE_DIRECTIONS = {
  CENTER: 'center',
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down',
  UP_LEFT: 'up-left',
  UP_RIGHT: 'up-right',
  DOWN_LEFT: 'down-left',
  DOWN_RIGHT: 'down-right',
  AWAY: 'away'
}

/**
 * Calculate 3D distance between two landmarks
 *
 * WHAT IS THIS?
 * This calculates the straight-line distance between two points in 3D space.
 * Like measuring the length of a string stretched between two points.
 *
 * THE MATH:
 * We use the 3D Pythagorean theorem (distance formula):
 * distance = √[(x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²]
 *
 * EXAMPLE:
 * If point1 is at (0, 0, 0) and point2 is at (3, 4, 0):
 * - dx = 3 - 0 = 3
 * - dy = 4 - 0 = 4
 * - dz = 0 - 0 = 0
 * - distance = √(3² + 4² + 0²) = √(9 + 16) = √25 = 5
 *
 * WHY NEED THIS?
 * We use it to measure eye width, face dimensions, etc.
 * These measurements help us understand the scale and proportions of the face.
 *
 * @param {Object} point1 - First 3D point with x, y, z coordinates
 * @param {Object} point2 - Second 3D point with x, y, z coordinates
 * @returns {number} The distance between the two points
 */
function distance3D(point1, point2) {
  // Calculate differences in each dimension
  const dx = point2.x - point1.x  // Horizontal difference
  const dy = point2.y - point1.y  // Vertical difference
  const dz = (point2.z || 0) - (point1.z || 0)  // Depth difference (z might not always be present)

  // Apply 3D Pythagorean theorem
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Calculate the ratio of iris position within the eye
 *
 * THIS IS THE CORE OF EYE TRACKING!
 *
 * WHAT IT DOES:
 * Determines where the iris (colored part of eye) is positioned within the eye socket.
 * Returns values from 0.0 to 1.0 indicating the position as a percentage.
 *
 * HOW IT WORKS:
 * 1. Measure the total width and height of the eye opening
 * 2. Measure how far the iris is from the inner corner (horizontal) and top (vertical)
 * 3. Divide the iris offset by total eye size to get a ratio (percentage)
 *
 * VISUAL EXAMPLE (Horizontal):
 *
 *   Inner Corner [====*====] Outer Corner
 *                     ↑ iris here
 *
 *   If iris is exactly in the middle:
 *   - irisOffsetX = 50% of eyeWidth
 *   - horizontalRatio = 0.5
 *
 *   If looking left (iris near inner corner):
 *   - irisOffsetX = 20% of eyeWidth
 *   - horizontalRatio = 0.2
 *
 *   If looking right (iris near outer corner):
 *   - irisOffsetX = 80% of eyeWidth
 *   - horizontalRatio = 0.8
 *
 * THE MATH:
 * horizontalRatio = (iris_x - eye_inner_x) / (eye_outer_x - eye_inner_x)
 * verticalRatio = (iris_y - eye_top_y) / (eye_bottom_y - eye_top_y)
 *
 * RETURN VALUES:
 * - horizontal: 0.0 = looking far left, 0.5 = center, 1.0 = far right
 * - vertical: 0.0 = looking up, 0.5 = straight, 1.0 = down
 *
 * @param {Object} eyeInner - Inner corner of eye landmark
 * @param {Object} eyeOuter - Outer corner of eye landmark
 * @param {Object} eyeTop - Top of eye landmark
 * @param {Object} eyeBottom - Bottom of eye landmark
 * @param {Object} irisCenter - Center of iris landmark
 * @returns {Object} {horizontal: number, vertical: number} - Ratios from 0.0 to 1.0
 */
function calculateIrisRatio(eyeInner, eyeOuter, eyeTop, eyeBottom, irisCenter) {
  // === HORIZONTAL CALCULATION (Left/Right) ===
  // Step 1: Calculate the total width of the eye opening
  const eyeWidth = Math.abs(eyeOuter.x - eyeInner.x)

  // Step 2: Calculate how far the iris is from the inner corner
  const irisOffsetX = Math.abs(irisCenter.x - eyeInner.x)

  // Step 3: Calculate the ratio (what percentage across the eye is the iris?)
  // Example: If eyeWidth = 100 and irisOffsetX = 50, ratio = 0.5 (centered)
  const horizontalRatio = eyeWidth > 0 ? irisOffsetX / eyeWidth : 0.5

  // === VERTICAL CALCULATION (Up/Down) ===
  // Step 1: Calculate the total height of the eye opening
  const eyeHeight = Math.abs(eyeBottom.y - eyeTop.y)

  // Step 2: Calculate how far the iris is from the top
  const irisOffsetY = Math.abs(irisCenter.y - eyeTop.y)

  // Step 3: Calculate the ratio (what percentage down the eye is the iris?)
  const verticalRatio = eyeHeight > 0 ? irisOffsetY / eyeHeight : 0.5

  // Return both ratios as an object
  return { horizontal: horizontalRatio, vertical: verticalRatio }
}

/**
 * Estimate head pose using facial landmarks
 *
 * HEAD POSE = The 3D orientation of the head in space
 *
 * Think of your head like an airplane:
 * - YAW: Turning left/right (like saying "no")
 * - PITCH: Tilting up/down (like nodding "yes")
 * - ROLL: Tilting sideways (like touching ear to shoulder)
 *
 * WHY WE NEED THIS:
 * If someone's head is turned 30° to the right, even if their eyes look centered
 * in their eye sockets, they're NOT looking at the camera. We need to know head
 * orientation to determine true gaze direction.
 *
 * HOW IT WORKS:
 * We use the geometry of facial features to estimate rotation:
 * - If nose is closer to right eye than left eye → head turned right (positive yaw)
 * - If nose is below eye level → head tilted down (positive pitch)
 * - If line between eyes is tilted → head rolled sideways
 *
 * RETURN VALUES (in degrees):
 * - yaw: -30 to +30 (negative = left, positive = right)
 * - pitch: -20 to +20 (negative = up, positive = down)
 * - roll: -45 to +45 (negative = left shoulder, positive = right shoulder)
 *
 * @param {Array} landmarks - Array of 478 facial landmarks from MediaPipe
 * @returns {Object} {pitch: number, yaw: number, roll: number} - Angles in degrees
 */
export function estimateHeadPose(landmarks) {
  // Safety check: make sure we have all the landmarks we need
  if (!landmarks || landmarks.length < 478) return { pitch: 0, yaw: 0, roll: 0 }

  // Get the key facial landmarks we'll use for calculations
  const noseTip = landmarks[LANDMARKS.NOSE_TIP]       // Center of nose tip
  const chin = landmarks[LANDMARKS.CHIN]              // Bottom of chin
  const leftEye = landmarks[LANDMARKS.LEFT_EYE_CORNER]   // Outer corner of left eye
  const rightEye = landmarks[LANDMARKS.RIGHT_EYE_CORNER] // Outer corner of right eye
  const leftMouth = landmarks[LANDMARKS.LEFT_MOUTH]   // Left corner of mouth
  const rightMouth = landmarks[LANDMARKS.RIGHT_MOUTH] // Right corner of mouth

  // ===================================================================
  // CALCULATE YAW (Horizontal Rotation: Left/Right)
  // ===================================================================
  //
  // CONCEPT:
  // When you turn your head left/right, your nose moves closer to one eye.
  // If nose is centered between eyes → facing forward (yaw = 0)
  // If nose is closer to left eye → turned left (yaw = negative)
  // If nose is closer to right eye → turned right (yaw = positive)
  //
  // VISUAL:
  //   Facing forward:    leftEye [== NOSE ==] rightEye  (yaw ≈ 0)
  //   Turned right:      leftEye [=====NOSE=] rightEye  (yaw > 0)
  //   Turned left:       leftEye [=NOSE=====] rightEye  (yaw < 0)
  //

  // Step 1: Measure the distance between the eyes (face width reference)
  const faceWidth = Math.abs(rightEye.x - leftEye.x)

  // Step 2: Measure distance from nose to each eye
  const leftEyeToNose = Math.abs(noseTip.x - leftEye.x)   // How far is nose from left eye
  const rightEyeToNose = Math.abs(noseTip.x - rightEye.x) // How far is nose from right eye

  // Step 3: Calculate yaw
  // - If leftEyeToNose > rightEyeToNose: nose closer to right eye → turned right
  // - Divide by faceWidth to normalize (account for different face sizes)
  // - Multiply by 60 to convert to degrees (empirically tuned for typical range)
  const yaw = faceWidth > 0
    ? ((leftEyeToNose - rightEyeToNose) / faceWidth) * 60
    : 0

  // ===================================================================
  // CALCULATE PITCH (Vertical Tilt: Up/Down)
  // ===================================================================
  //
  // CONCEPT:
  // When you tilt your head up/down, your nose moves relative to your eyes.
  // If nose is at same level as eyes → level head (pitch = 0)
  // If nose is above eyes → head tilted up (pitch = negative)
  // If nose is below eyes → head tilted down (pitch = positive)
  //
  // VISUAL (side view):
  //   Level:       eyes— nose —chin      (pitch ≈ 0)
  //   Tilted down: eyes
  //                  ↓ nose
  //                    ↓ chin            (pitch > 0)
  //   Tilted up:       ↑ chin
  //                  ↑ nose
  //                eyes                  (pitch < 0)
  //

  // Step 1: Calculate face height (for normalization)
  const faceHeight = Math.abs(chin.y - noseTip.y)

  // Step 2: Find the center point between the two eyes (eye level)
  const eyeCenterY = (leftEye.y + rightEye.y) / 2

  // Step 3: Calculate how far nose is from eye level
  const noseTilt = noseTip.y - eyeCenterY
  // If positive: nose is below eyes (head tilted down)
  // If negative: nose is above eyes (head tilted up)

  // Step 4: Normalize by face height and convert to degrees
  // Multiply by 40 for typical pitch range
  const pitch = faceHeight > 0
    ? (noseTilt / faceHeight) * 40
    : 0

  // ===================================================================
  // CALCULATE ROLL (Sideways Tilt: Shoulder to Shoulder)
  // ===================================================================
  //
  // CONCEPT:
  // When you tilt your head sideways, the line between your eyes rotates.
  // If eyes are level → no roll (roll = 0)
  // If left eye is higher → tilted left (roll = negative)
  // If right eye is higher → tilted right (roll = positive)
  //
  // VISUAL (front view):
  //   Level:          ●eye    eye●        (roll ≈ 0)
  //   Tilted right:   ●eye
  //                         eye●          (roll > 0)
  //   Tilted left:          eye●
  //                   ●eye                (roll < 0)
  //

  // Step 1: Calculate the angle of the line between the eyes
  // atan2 gives us the angle in radians
  // atan2(y_difference, x_difference) returns angle from -π to +π
  const eyeAngle = Math.atan2(
    rightEye.y - leftEye.y,  // Vertical difference between eyes
    rightEye.x - leftEye.x   // Horizontal difference between eyes
  )

  // Step 2: Convert radians to degrees
  // Radians * (180/π) = Degrees
  const roll = eyeAngle * (180 / Math.PI)

  // Return all three rotation angles
  return { pitch, yaw, roll }
}

/**
 * Check if iris landmarks are reliably positioned
 *
 * PROBLEM: Sometimes MediaPipe detects iris landmarks but places them incorrectly
 * (e.g., on eyelids instead of actual iris). This happens with poor camera quality,
 * low resolution, or certain lighting conditions.
 *
 * SOLUTION: Validate that iris positions make sense relative to eye geometry
 *
 * @param {Array} landmarks - Face mesh landmarks
 * @returns {boolean} - true if iris positions seem reliable
 */
function validateIrisPositions(landmarks) {
  // Get key eye landmarks
  const leftIris = landmarks[LANDMARKS.LEFT_IRIS_CENTER]
  const rightIris = landmarks[LANDMARKS.RIGHT_IRIS_CENTER]
  const leftEyeInner = landmarks[LANDMARKS.LEFT_EYE_INNER]
  const leftEyeOuter = landmarks[LANDMARKS.LEFT_EYE_OUTER]
  const rightEyeInner = landmarks[LANDMARKS.RIGHT_EYE_INNER]
  const rightEyeOuter = landmarks[LANDMARKS.RIGHT_EYE_OUTER]
  const leftEyeTop = landmarks[LANDMARKS.LEFT_EYE_TOP]
  const leftEyeBottom = landmarks[LANDMARKS.LEFT_EYE_BOTTOM]

  // Check 1: Iris landmarks must exist
  if (!leftIris || !rightIris) return false

  // Check 2: Iris should be between eye corners horizontally
  // (within the eye boundaries)
  const leftEyeWidth = Math.abs(leftEyeOuter.x - leftEyeInner.x)
  const leftIrisInBoundsX =
    leftIris.x > Math.min(leftEyeInner.x, leftEyeOuter.x) - leftEyeWidth * 0.2 &&
    leftIris.x < Math.max(leftEyeInner.x, leftEyeOuter.x) + leftEyeWidth * 0.2

  // Check 3: Iris Y should be between eye top and bottom (with small margin)
  const leftEyeHeight = Math.abs(leftEyeBottom.y - leftEyeTop.y)
  const leftIrisInBoundsY =
    leftIris.y > leftEyeTop.y - leftEyeHeight * 0.3 &&
    leftIris.y < leftEyeBottom.y + leftEyeHeight * 0.3

  // Check 4: Z-depth should be reasonable (iris shouldn't be way in front/behind face)
  const hasValidZ = !leftIris.z || Math.abs(leftIris.z) < 0.2

  // Iris positions are reliable if all checks pass
  const isReliable = leftIrisInBoundsX && leftIrisInBoundsY && hasValidZ

  if (!isReliable) {
    console.warn('⚠️ IRIS POSITIONS UNRELIABLE - Using head-pose-only tracking', {
      leftIrisInBoundsX,
      leftIrisInBoundsY,
      hasValidZ,
      leftIris: `(${leftIris.x.toFixed(3)}, ${leftIris.y.toFixed(3)}, ${leftIris.z?.toFixed(3)})`,
      leftEyeOuter: `(${leftEyeOuter.x.toFixed(3)}, ${leftEyeOuter.y.toFixed(3)})`,
      leftEyeTop: `(${leftEyeTop.y.toFixed(3)})`,
      leftEyeBottom: `(${leftEyeBottom.y.toFixed(3)})`
    })
  }

  return isReliable
}

/**
 * Fallback gaze detection using ONLY head pose (no iris tracking)
 *
 * WHEN TO USE: When iris landmarks are unreliable or unavailable
 *
 * HOW IT WORKS:
 * - Uses head orientation (yaw, pitch) as proxy for gaze
 * - If head is facing camera, assume eyes are too
 * - Less accurate than iris tracking, but more reliable with poor cameras
 *
 * @param {Array} landmarks - Face mesh landmarks
 * @param {Object} options - Configuration options
 * @returns {Object} Gaze detection result
 */
function detectGazeDirectionHeadPoseOnly(landmarks, options = {}) {
  const config = {
    headYawThreshold: 12, // Stricter than iris-based (was 15)
    headPitchThreshold: 10, // Stricter (was 12)
    awayThreshold: 20, // More lenient (was 25)
    ...options
  }

  const headPose = estimateHeadPose(landmarks)

  // Determine direction based purely on head orientation
  const yaw = headPose.yaw
  const pitch = headPose.pitch

  let direction = GAZE_DIRECTIONS.CENTER
  let isLookingAtCamera = false

  // Check if head is turned away significantly
  if (Math.abs(yaw) > config.awayThreshold || Math.abs(pitch) > config.awayThreshold) {
    direction = GAZE_DIRECTIONS.AWAY
    isLookingAtCamera = false
  }
  // Determine direction based on head pose
  else {
    const lookingLeft = yaw < -config.headYawThreshold
    const lookingRight = yaw > config.headYawThreshold
    const lookingUp = pitch < -config.headPitchThreshold
    const lookingDown = pitch > config.headPitchThreshold

    if (!lookingLeft && !lookingRight && !lookingUp && !lookingDown) {
      direction = GAZE_DIRECTIONS.CENTER
      isLookingAtCamera = true
    } else if (lookingUp && lookingLeft) {
      direction = GAZE_DIRECTIONS.UP_LEFT
    } else if (lookingUp && lookingRight) {
      direction = GAZE_DIRECTIONS.UP_RIGHT
    } else if (lookingDown && lookingLeft) {
      direction = GAZE_DIRECTIONS.DOWN_LEFT
    } else if (lookingDown && lookingRight) {
      direction = GAZE_DIRECTIONS.DOWN_RIGHT
    } else if (lookingUp) {
      direction = GAZE_DIRECTIONS.UP
    } else if (lookingDown) {
      direction = GAZE_DIRECTIONS.DOWN
    } else if (lookingLeft) {
      direction = GAZE_DIRECTIONS.LEFT
    } else if (lookingRight) {
      direction = GAZE_DIRECTIONS.RIGHT
    }
  }

  return {
    isLookingAtCamera,
    direction,
    confidence: isLookingAtCamera ? 0.7 : 0.8, // Lower confidence for head-pose-only
    details: {
      horizontal: 0.5, // Default to centered (no iris data)
      vertical: 0.5,
      adjustedHorizontal: 0.5,
      adjustedVertical: 0.5,
      headPose,
      leftEye: { horizontal: 0.5, vertical: 0.5 },
      rightEye: { horizontal: 0.5, vertical: 0.5 },
      usingFallback: true, // Flag to indicate we're using fallback method
      fallbackReason: 'Iris landmarks unreliable or unavailable'
    }
  }
}

/**
 * Advanced eye contact detection with gaze direction
 * Returns detailed gaze information
 *
 * NOW WITH: Automatic fallback to head-pose-only tracking
 */
export function detectGazeDirection(landmarks, options = {}) {
  if (!landmarks || landmarks.length < 478) {
    return {
      isLookingAtCamera: false,
      direction: GAZE_DIRECTIONS.AWAY,
      confidence: 0,
      details: null
    }
  }

  // === NEW: Validate iris positions ===
  const irisReliable = validateIrisPositions(landmarks)

  // If iris positions are unreliable, use head-pose-only fallback
  if (!irisReliable) {
    return detectGazeDirectionHeadPoseOnly(landmarks, options)
  }

  // Configuration thresholds
  const config = {
    centerHorizontalMin: 0.35,
    centerHorizontalMax: 0.65,
    centerVerticalMin: 0.35,
    centerVerticalMax: 0.65,
    headYawThreshold: 15, // degrees
    headPitchThreshold: 12, // degrees
    awayThreshold: 25, // degrees - if head is turned more than this, user is looking away
    ...options
  }

  // Get eye landmarks
  const leftEyeInner = landmarks[LANDMARKS.LEFT_EYE_INNER]
  const leftEyeOuter = landmarks[LANDMARKS.LEFT_EYE_OUTER]
  const leftEyeTop = landmarks[LANDMARKS.LEFT_EYE_TOP]
  const leftEyeBottom = landmarks[LANDMARKS.LEFT_EYE_BOTTOM]
  const leftIris = landmarks[LANDMARKS.LEFT_IRIS_CENTER]

  const rightEyeInner = landmarks[LANDMARKS.RIGHT_EYE_INNER]
  const rightEyeOuter = landmarks[LANDMARKS.RIGHT_EYE_OUTER]
  const rightEyeTop = landmarks[LANDMARKS.RIGHT_EYE_TOP]
  const rightEyeBottom = landmarks[LANDMARKS.RIGHT_EYE_BOTTOM]
  const rightIris = landmarks[LANDMARKS.RIGHT_IRIS_CENTER]

  // Calculate iris ratios for both eyes
  const leftRatio = calculateIrisRatio(leftEyeInner, leftEyeOuter, leftEyeTop, leftEyeBottom, leftIris)
  const rightRatio = calculateIrisRatio(rightEyeInner, rightEyeOuter, rightEyeTop, rightEyeBottom, rightIris)

  // Average the ratios (both eyes should look in same direction)
  const avgHorizontal = (leftRatio.horizontal + rightRatio.horizontal) / 2
  const avgVertical = (leftRatio.vertical + rightRatio.vertical) / 2

  // Get head pose
  const headPose = estimateHeadPose(landmarks)

  // Check if head is turned away significantly
  if (Math.abs(headPose.yaw) > config.awayThreshold ||
      Math.abs(headPose.pitch) > config.awayThreshold) {
    return {
      isLookingAtCamera: false,
      direction: GAZE_DIRECTIONS.AWAY,
      confidence: 0.9,
      details: {
        horizontal: avgHorizontal,
        vertical: avgVertical,
        headPose,
        leftEye: leftRatio,
        rightEye: rightRatio
      }
    }
  }

  // Determine gaze direction based on iris position and head pose
  let direction = GAZE_DIRECTIONS.CENTER
  let isLookingAtCamera = false
  let confidence = 0

  // Adjust thresholds based on head pose
  const horizontalAdjustment = headPose.yaw / 60 // normalize to -0.5 to +0.5
  const verticalAdjustment = headPose.pitch / 40

  const adjustedHorizontal = avgHorizontal - horizontalAdjustment
  const adjustedVertical = avgVertical - verticalAdjustment

  // Determine horizontal direction
  const isLookingLeft = adjustedHorizontal < config.centerHorizontalMin
  const isLookingRight = adjustedHorizontal > config.centerHorizontalMax
  const isLookingCenter = !isLookingLeft && !isLookingRight

  // Determine vertical direction
  const isLookingUp = adjustedVertical < config.centerVerticalMin
  const isLookingDown = adjustedVertical > config.centerVerticalMax
  const isLookingMiddle = !isLookingUp && !isLookingDown

  // Combine to get direction
  if (isLookingCenter && isLookingMiddle) {
    direction = GAZE_DIRECTIONS.CENTER
    isLookingAtCamera = true
    confidence = 0.9
  } else if (isLookingUp && isLookingLeft) {
    direction = GAZE_DIRECTIONS.UP_LEFT
    confidence = 0.8
  } else if (isLookingUp && isLookingRight) {
    direction = GAZE_DIRECTIONS.UP_RIGHT
    confidence = 0.8
  } else if (isLookingDown && isLookingLeft) {
    direction = GAZE_DIRECTIONS.DOWN_LEFT
    confidence = 0.8
  } else if (isLookingDown && isLookingRight) {
    direction = GAZE_DIRECTIONS.DOWN_RIGHT
    confidence = 0.8
  } else if (isLookingUp) {
    direction = GAZE_DIRECTIONS.UP
    confidence = 0.85
  } else if (isLookingDown) {
    direction = GAZE_DIRECTIONS.DOWN
    confidence = 0.85
  } else if (isLookingLeft) {
    direction = GAZE_DIRECTIONS.LEFT
    confidence = 0.85
  } else if (isLookingRight) {
    direction = GAZE_DIRECTIONS.RIGHT
    confidence = 0.85
  }

  // Calculate confidence based on how far from center
  const horizontalDistance = Math.abs(adjustedHorizontal - 0.5) * 2
  const verticalDistance = Math.abs(adjustedVertical - 0.5) * 2
  const totalDistance = Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance)

  if (!isLookingAtCamera) {
    confidence = Math.min(0.95, 0.5 + totalDistance / 2)
  }

  return {
    isLookingAtCamera,
    direction,
    confidence,
    details: {
      horizontal: avgHorizontal,
      vertical: avgVertical,
      adjustedHorizontal,
      adjustedVertical,
      headPose,
      leftEye: leftRatio,
      rightEye: rightRatio
    }
  }
}

/**
 * Simplified function for backward compatibility
 * Returns true if user is looking at camera
 */
export function isLookingAtCamera(landmarks, options = {}) {
  const result = detectGazeDirection(landmarks, options)
  return result.isLookingAtCamera
}

/**
 * Calculate eye contact percentage over time
 */
export function calculateEyeContactPercentage(lookingFrames, totalFrames) {
  if (totalFrames === 0) return 100
  return Math.round((lookingFrames / totalFrames) * 100)
}

/**
 * Get human-readable direction description
 */
export function getDirectionDescription(direction) {
  const descriptions = {
    [GAZE_DIRECTIONS.CENTER]: 'Looking at camera',
    [GAZE_DIRECTIONS.LEFT]: 'Looking left',
    [GAZE_DIRECTIONS.RIGHT]: 'Looking right',
    [GAZE_DIRECTIONS.UP]: 'Looking up',
    [GAZE_DIRECTIONS.DOWN]: 'Looking down',
    [GAZE_DIRECTIONS.UP_LEFT]: 'Looking up-left',
    [GAZE_DIRECTIONS.UP_RIGHT]: 'Looking up-right',
    [GAZE_DIRECTIONS.DOWN_LEFT]: 'Looking down-left',
    [GAZE_DIRECTIONS.DOWN_RIGHT]: 'Looking down-right',
    [GAZE_DIRECTIONS.AWAY]: 'Looking away from screen'
  }

  return descriptions[direction] || 'Unknown direction'
}

export default {
  detectGazeDirection,
  isLookingAtCamera,
  estimateHeadPose,
  calculateEyeContactPercentage,
  getDirectionDescription,
  GAZE_DIRECTIONS
}
