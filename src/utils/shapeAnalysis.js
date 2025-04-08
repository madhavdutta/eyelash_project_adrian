/**
 * Utility functions for analyzing face and eye shapes from facial landmarks
 */

// Face shape classification
export const analyzeFaceShape = (landmarks) => {
  try {
    // Extract key points for face shape analysis
    const jawline = extractJawlinePoints(landmarks);
    const forehead = extractForeheadPoints(landmarks);
    const cheekbones = extractCheekbonePoints(landmarks);
    
    // Calculate key measurements
    const faceLength = calculateFaceLength(landmarks);
    const faceWidth = calculateFaceWidth(landmarks);
    const jawWidth = calculateJawWidth(jawline);
    const foreheadWidth = calculateForeheadWidth(forehead);
    const cheekboneWidth = calculateCheekboneWidth(cheekbones);
    
    // Calculate ratios
    const lengthToWidthRatio = faceLength / faceWidth;
    const jawToForeheadRatio = jawWidth / foreheadWidth;
    const cheekboneToJawRatio = cheekboneWidth / jawWidth;
    
    // Determine face shape based on measurements and ratios
    if (lengthToWidthRatio > 1.5) {
      return 'oblong'; // Long face
    } else if (lengthToWidthRatio < 1.2 && cheekboneToJawRatio < 1.1) {
      return 'round'; // Round face
    } else if (jawToForeheadRatio > 0.9 && cheekboneToJawRatio < 1.1) {
      return 'square'; // Square face
    } else if (jawToForeheadRatio < 0.8) {
      return 'heart'; // Heart-shaped face
    } else {
      return 'oval'; // Oval face (default)
    }
  } catch (error) {
    console.error("Error in analyzeFaceShape:", error);
    return 'oval'; // Default fallback
  }
};

// Eye shape classification
export const analyzeEyeShape = (landmarks) => {
  try {
    // Extract eye points
    const leftEye = extractLeftEyePoints(landmarks);
    const rightEye = extractRightEyePoints(landmarks);
    
    // Calculate eye measurements
    const leftEyeWidth = calculateEyeWidth(leftEye);
    const leftEyeHeight = calculateEyeHeight(leftEye);
    const rightEyeWidth = calculateEyeWidth(rightEye);
    const rightEyeHeight = calculateEyeHeight(rightEye);
    
    // Average measurements from both eyes
    const avgWidthToHeightRatio = ((leftEyeWidth / leftEyeHeight) + (rightEyeWidth / rightEyeHeight)) / 2;
    
    // Check for hooded eyes
    const isHooded = checkForHoodedEyes(landmarks);
    
    // Check for monolid
    const isMonolid = checkForMonolid(landmarks);
    
    // Check for downturned eyes
    const isDownturned = checkForDownturnedEyes(landmarks);
    
    // Determine eye shape
    if (isHooded) {
      return 'hooded';
    } else if (isMonolid) {
      return 'monolid';
    } else if (isDownturned) {
      return 'downturned';
    } else if (avgWidthToHeightRatio > 3) {
      return 'round';
    } else {
      return 'almond'; // Default eye shape
    }
  } catch (error) {
    console.error("Error in analyzeEyeShape:", error);
    return 'almond'; // Default fallback
  }
};

// Helper functions for extracting facial landmark points
function extractJawlinePoints(landmarks) {
  try {
    // Jawline points are typically indexed from around 0-17 in MediaPipe Face Mesh
    // Fallback to a subset if full range isn't available
    if (landmarks.length >= 17) {
      return landmarks.slice(0, 17);
    } else {
      // Fallback to whatever points are available
      return landmarks.slice(0, Math.min(17, landmarks.length));
    }
  } catch (error) {
    console.error("Error extracting jawline points:", error);
    return [landmarks[0], landmarks[landmarks.length - 1]]; // Fallback to first and last points
  }
}

function extractForeheadPoints(landmarks) {
  try {
    // Forehead points in MediaPipe Face Mesh
    // These indices might need adjustment based on the actual model output
    if (landmarks.length >= 70) {
      return [landmarks[67], landmarks[69]];
    } else {
      // Fallback to approximate positions
      const len = landmarks.length;
      return [landmarks[Math.floor(len * 0.3)], landmarks[Math.floor(len * 0.7)]];
    }
  } catch (error) {
    console.error("Error extracting forehead points:", error);
    return [landmarks[0], landmarks[landmarks.length - 1]]; // Fallback
  }
}

function extractCheekbonePoints(landmarks) {
  try {
    // Cheekbone points in MediaPipe Face Mesh
    if (landmarks.length >= 353) {
      return [landmarks[123], landmarks[352]];
    } else {
      // Fallback to approximate positions
      const len = landmarks.length;
      return [landmarks[Math.floor(len * 0.25)], landmarks[Math.floor(len * 0.75)]];
    }
  } catch (error) {
    console.error("Error extracting cheekbone points:", error);
    return [landmarks[0], landmarks[landmarks.length - 1]]; // Fallback
  }
}

function extractLeftEyePoints(landmarks) {
  try {
    // Left eye points in MediaPipe Face Mesh
    if (landmarks.length >= 160) {
      return landmarks.slice(145, 160);
    } else {
      // Fallback to approximate positions
      const len = landmarks.length;
      const startIdx = Math.floor(len * 0.3);
      const endIdx = Math.floor(len * 0.4);
      return landmarks.slice(startIdx, endIdx);
    }
  } catch (error) {
    console.error("Error extracting left eye points:", error);
    return landmarks.slice(0, 5); // Fallback
  }
}

function extractRightEyePoints(landmarks) {
  try {
    // Right eye points in MediaPipe Face Mesh
    if (landmarks.length >= 386) {
      return landmarks.slice(374, 386);
    } else {
      // Fallback to approximate positions
      const len = landmarks.length;
      const startIdx = Math.floor(len * 0.6);
      const endIdx = Math.floor(len * 0.7);
      return landmarks.slice(startIdx, endIdx);
    }
  } catch (error) {
    console.error("Error extracting right eye points:", error);
    return landmarks.slice(landmarks.length - 5, landmarks.length); // Fallback
  }
}

// Measurement calculation functions
function calculateFaceLength(landmarks) {
  try {
    // Distance from chin to forehead
    if (landmarks.length >= 153) {
      const chin = landmarks[152];
      const forehead = landmarks[10];
      return distance(chin, forehead);
    } else {
      // Fallback to approximate positions
      const len = landmarks.length;
      return distance(landmarks[Math.floor(len * 0.1)], landmarks[Math.floor(len * 0.9)]);
    }
  } catch (error) {
    console.error("Error calculating face length:", error);
    return 100; // Fallback value
  }
}

function calculateFaceWidth(landmarks) {
  try {
    // Maximum width of face
    if (landmarks.length >= 353) {
      const leftCheek = landmarks[123];
      const rightCheek = landmarks[352];
      return distance(leftCheek, rightCheek);
    } else {
      // Fallback to approximate positions
      const len = landmarks.length;
      return distance(landmarks[Math.floor(len * 0.25)], landmarks[Math.floor(len * 0.75)]);
    }
  } catch (error) {
    console.error("Error calculating face width:", error);
    return 80; // Fallback value
  }
}

function calculateJawWidth(jawline) {
  try {
    // Width of jawline
    return distance(jawline[0], jawline[jawline.length - 1]);
  } catch (error) {
    console.error("Error calculating jaw width:", error);
    return 70; // Fallback value
  }
}

function calculateForeheadWidth(forehead) {
  try {
    // Width of forehead
    return distance(forehead[0], forehead[1]);
  } catch (error) {
    console.error("Error calculating forehead width:", error);
    return 60; // Fallback value
  }
}

function calculateCheekboneWidth(cheekbones) {
  try {
    // Width between cheekbones
    return distance(cheekbones[0], cheekbones[1]);
  } catch (error) {
    console.error("Error calculating cheekbone width:", error);
    return 75; // Fallback value
  }
}

function calculateEyeWidth(eyePoints) {
  try {
    // Width of eye
    return distance(eyePoints[0], eyePoints[eyePoints.length - 1]);
  } catch (error) {
    console.error("Error calculating eye width:", error);
    return 30; // Fallback value
  }
}

function calculateEyeHeight(eyePoints) {
  try {
    // Height of eye
    if (eyePoints.length >= 13) {
      const topPoint = eyePoints[12];
      const bottomPoint = eyePoints[4];
      return distance(topPoint, bottomPoint);
    } else {
      // Fallback to approximate positions
      const len = eyePoints.length;
      return distance(eyePoints[Math.floor(len * 0.25)], eyePoints[Math.floor(len * 0.75)]);
    }
  } catch (error) {
    console.error("Error calculating eye height:", error);
    return 10; // Fallback value
  }
}

// Eye shape detection helpers
function checkForHoodedEyes(landmarks) {
  try {
    // Check for hooded eyes by analyzing eyelid crease visibility
    if (landmarks.length >= 386) {
      const leftUpperLid = landmarks[159];
      const leftLowerLid = landmarks[145];
      const rightUpperLid = landmarks[386];
      const rightLowerLid = landmarks[374];
      
      const leftEyeOpenness = distance(leftUpperLid, leftLowerLid);
      const rightEyeOpenness = distance(rightUpperLid, rightLowerLid);
      
      // If eye openness is below threshold, likely hooded
      return (leftEyeOpenness + rightEyeOpenness) / 2 < 10;
    } else {
      // Fallback to a default value
      return false;
    }
  } catch (error) {
    console.error("Error checking for hooded eyes:", error);
    return false; // Fallback value
  }
}

function checkForMonolid(landmarks) {
  try {
    // Check for monolid by analyzing eyelid crease
    if (landmarks.length >= 467) {
      const leftCreasePoint = landmarks[246];
      const leftUpperLid = landmarks[159];
      const rightCreasePoint = landmarks[466];
      const rightUpperLid = landmarks[386];
      
      const leftCreaseVisibility = distance(leftCreasePoint, leftUpperLid);
      const rightCreaseVisibility = distance(rightCreasePoint, rightUpperLid);
      
      // If crease is very close to lid, likely monolid
      return (leftCreaseVisibility + rightCreaseVisibility) / 2 < 3;
    } else {
      // Fallback to a default value
      return false;
    }
  } catch (error) {
    console.error("Error checking for monolid:", error);
    return false; // Fallback value
  }
}

function checkForDownturnedEyes(landmarks) {
  try {
    // Check if outer corners of eyes are lower than inner corners
    if (landmarks.length >= 363) {
      const leftInnerCorner = landmarks[133];
      const leftOuterCorner = landmarks[130];
      const rightInnerCorner = landmarks[362];
      const rightOuterCorner = landmarks[359];
      
      const leftDownturn = leftOuterCorner[1] > leftInnerCorner[1];
      const rightDownturn = rightOuterCorner[1] > rightInnerCorner[1];
      
      return leftDownturn && rightDownturn;
    } else {
      // Fallback to a default value
      return false;
    }
  } catch (error) {
    console.error("Error checking for downturned eyes:", error);
    return false; // Fallback value
  }
}

// Utility function to calculate distance between two points
function distance(point1, point2) {
  try {
    return Math.sqrt(
      Math.pow(point2[0] - point1[0], 2) + 
      Math.pow(point2[1] - point1[1], 2)
    );
  } catch (error) {
    console.error("Error calculating distance:", error);
    return 10; // Fallback value
  }
}
