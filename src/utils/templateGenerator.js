/**
 * Utility for generating eyelash mapping templates based on facial landmarks
 */

// Template generation based on face and eye shape
export const generateLashTemplate = (landmarks, faceShape, eyeShape) => {
  try {
    // Extract eye landmarks
    const leftEye = extractLeftEyePoints(landmarks);
    const rightEye = extractRightEyePoints(landmarks);
    
    // Generate lash mapping for each eye
    const leftLashes = generateEyeLashes(leftEye, faceShape, eyeShape, 'left');
    const rightLashes = generateEyeLashes(rightEye, faceShape, eyeShape, 'right');
    
    // Return template object with drawing method
    return {
      leftLashes,
      rightLashes,
      draw: (ctx) => drawLashTemplate(ctx, leftLashes, rightLashes)
    };
  } catch (error) {
    console.error("Error in generateLashTemplate:", error);
    // Return a minimal template that won't crash
    return {
      leftLashes: [],
      rightLashes: [],
      draw: (ctx) => {
        // Draw a simple indicator that something went wrong
        ctx.font = '20px Arial';
        ctx.fillStyle = 'red';
        ctx.fillText('Template generation error - using default', 50, 50);
        
        // Draw some basic lashes as fallback
        const fallbackLeftLashes = generateFallbackLashes('left');
        const fallbackRightLashes = generateFallbackLashes('right');
        drawLashTemplate(ctx, fallbackLeftLashes, fallbackRightLashes);
      }
    };
  }
};

// Generate fallback lashes when normal generation fails
function generateFallbackLashes(side) {
  const lashes = [];
  const numLashes = 10;
  const baseX = side === 'left' ? 150 : 300;
  const baseY = 200;
  
  for (let i = 0; i < numLashes; i++) {
    const angle = side === 'left' 
      ? Math.PI / 2 - (i / numLashes - 0.5) * 0.8
      : Math.PI / 2 + (i / numLashes - 0.5) * 0.8;
    
    const length = 10 + (i % 3) * 5;
    
    const startX = baseX + (i - numLashes/2) * 5;
    const startY = baseY;
    
    const endX = startX + Math.cos(angle) * length;
    const endY = startY - Math.sin(angle) * length;
    
    lashes.push({
      start: [startX, startY],
      end: [endX, endY],
      thickness: 1.5,
      color: 'rgba(0, 0, 0, 0.7)'
    });
  }
  
  return lashes;
}

// Extract eye points from landmarks
function extractLeftEyePoints(landmarks) {
  try {
    // MediaPipe Face Mesh indices for left eye outline
    const indices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
    
    // Check if we have enough landmarks
    if (landmarks.length >= Math.max(...indices) + 1) {
      return indices.map(idx => landmarks[idx]);
    } else {
      // Fallback to a subset of available points
      const len = landmarks.length;
      const startIdx = Math.floor(len * 0.3);
      const endIdx = Math.floor(len * 0.4);
      return landmarks.slice(startIdx, endIdx);
    }
  } catch (error) {
    console.error("Error extracting left eye points:", error);
    // Return some fallback points
    return [
      [100, 200], [110, 195], [120, 190], [130, 190], 
      [140, 190], [150, 195], [160, 200], [150, 205], 
      [140, 210], [130, 210], [120, 210], [110, 205]
    ];
  }
}

function extractRightEyePoints(landmarks) {
  try {
    // MediaPipe Face Mesh indices for right eye outline
    const indices = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466];
    
    // Check if we have enough landmarks
    if (landmarks.length >= Math.max(...indices) + 1) {
      return indices.map(idx => landmarks[idx]);
    } else {
      // Fallback to a subset of available points
      const len = landmarks.length;
      const startIdx = Math.floor(len * 0.6);
      const endIdx = Math.floor(len * 0.7);
      return landmarks.slice(startIdx, endIdx);
    }
  } catch (error) {
    console.error("Error extracting right eye points:", error);
    // Return some fallback points
    return [
      [300, 200], [310, 195], [320, 190], [330, 190], 
      [340, 190], [350, 195], [360, 200], [350, 205], 
      [340, 210], [330, 210], [320, 210], [310, 205]
    ];
  }
}

// Generate lash mapping for an eye
function generateEyeLashes(eyePoints, faceShape, eyeShape, side) {
  try {
    // Get upper eyelid points (we'll place lashes along these)
    const upperLidPoints = eyePoints.slice(0, Math.ceil(eyePoints.length / 2));
    
    // Determine lash parameters based on face and eye shape
    const lashParams = getLashParameters(faceShape, eyeShape);
    
    // Generate lash points
    const lashes = [];
    
    // Number of lashes to generate
    const numLashes = 15;
    
    // Generate evenly spaced lashes along the upper eyelid
    for (let i = 0; i < numLashes; i++) {
      // Calculate position along eyelid (0 to 1)
      const t = i / (numLashes - 1);
      
      // Get point on eyelid
      const lidPoint = getPointAlongCurve(upperLidPoints, t);
      
      // Calculate lash length based on position
      let lengthFactor;
      if (t < 0.3) {
        // Inner corner - shorter
        lengthFactor = mapRange(t, 0, 0.3, lashParams.innerLength, lashParams.middleLength);
      } else if (t > 0.7) {
        // Outer corner - longer for cat eye effect
        lengthFactor = mapRange(t, 0.7, 1, lashParams.middleLength, lashParams.outerLength);
      } else {
        // Middle section
        lengthFactor = lashParams.middleLength;
      }
      
      // Calculate lash direction
      // For natural look, lashes point slightly outward from center
      const angle = side === 'left' 
        ? Math.PI / 2 - (t - 0.5) * lashParams.fanAngle
        : Math.PI / 2 + (t - 0.5) * lashParams.fanAngle;
      
      // Calculate lash endpoint
      const lashLength = 20 * lengthFactor; // Base length multiplied by factor
      const endPoint = [
        lidPoint[0] + Math.cos(angle) * lashLength,
        lidPoint[1] - Math.sin(angle) * lashLength
      ];
      
      // Add lash to array
      lashes.push({
        start: lidPoint,
        end: endPoint,
        thickness: lashParams.thickness,
        color: lashParams.color
      });
    }
    
    return lashes;
  } catch (error) {
    console.error("Error generating eye lashes:", error);
    // Return fallback lashes
    return generateFallbackLashes(side);
  }
}

// Get// Get lash parameters based on face and eye shape
function getLashParameters(faceShape, eyeShape) {
  // Default parameters
  const defaultParams = {
    innerLength: 0.6,  // Relative length at inner corner
    middleLength: 0.8, // Relative length at middle
    outerLength: 1.0,  // Relative length at outer corner
    fanAngle: 0.8,     // How much lashes fan out (in radians)
    thickness: 1.5,    // Lash thickness
    color: 'rgba(0, 0, 0, 0.7)' // Lash color
  };
  
  // Adjust parameters based on face shape
  let params = { ...defaultParams };
  
  // Face shape adjustments
  if (faceShape === 'round') {
    // For round faces, create more elongated effect
    params.outerLength = 1.2;
    params.fanAngle = 1.0;
  } else if (faceShape === 'square') {
    // For square faces, soften with more natural lashes
    params.fanAngle = 0.6;
  } else if (faceShape === 'heart') {
    // For heart faces, balanced lashes
    params.innerLength = 0.7;
    params.outerLength = 0.9;
  }
  
  // Eye shape adjustments
  if (eyeShape === 'round') {
    // For round eyes, elongate with longer outer lashes
    params.outerLength = 1.2;
    params.fanAngle = 1.0;
  } else if (eyeShape === 'hooded') {
    // For hooded eyes, lift with longer lashes
    params.middleLength = 0.9;
    params.outerLength = 1.1;
  } else if (eyeShape === 'monolid') {
    // For monolid, create definition with varied lengths
    params.innerLength = 0.7;
    params.middleLength = 0.9;
    params.outerLength = 1.1;
  } else if (eyeShape === 'downturned') {
    // For downturned eyes, lift outer corners
    params.outerLength = 1.3;
    params.fanAngle = 1.2;
  }
  
  return params;
}

// Draw the lash template on a canvas
function drawLashTemplate(ctx, leftLashes, rightLashes) {
  try {
    // Set line cap for natural lash tips
    ctx.lineCap = 'round';
    
    // Draw left eye lashes
    drawLashes(ctx, leftLashes);
    
    // Draw right eye lashes
    drawLashes(ctx, rightLashes);
    
    // Add template labels and guides
    addTemplateGuides(ctx, leftLashes, rightLashes);
  } catch (error) {
    console.error("Error drawing lash template:", error);
    // Draw error message
    ctx.font = '16px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText('Error drawing lash template', 100, 100);
  }
}

// Draw a set of lashes
function drawLashes(ctx, lashes) {
  try {
    lashes.forEach(lash => {
      ctx.beginPath();
      ctx.moveTo(lash.start[0], lash.start[1]);
      ctx.lineTo(lash.end[0], lash.end[1]);
      ctx.strokeStyle = lash.color;
      ctx.lineWidth = lash.thickness;
      ctx.stroke();
    });
  } catch (error) {
    console.error("Error drawing lashes:", error);
  }
}

// Add template guides and labels
function addTemplateGuides(ctx, leftLashes, rightLashes) {
  try {
    // Add semi-transparent overlay to highlight lash area
    const leftBounds = getBoundingBox(leftLashes.map(l => l.start));
    const rightBounds = getBoundingBox(rightLashes.map(l => l.start));
    
    // Expand bounds slightly
    const expandBy = 10;
    leftBounds.minX -= expandBy;
    leftBounds.minY -= expandBy;
    leftBounds.maxX += expandBy;
    leftBounds.maxY += expandBy;
    rightBounds.minX -= expandBy;
    rightBounds.minY -= expandBy;
    rightBounds.maxX += expandBy;
    rightBounds.maxY += expandBy;
    
    // Draw highlight areas
    ctx.fillStyle = 'rgba(173, 216, 230, 0.2)';
    
    // Left eye area
    ctx.beginPath();
    ctx.rect(
      leftBounds.minX, 
      leftBounds.minY, 
      leftBounds.maxX - leftBounds.minX, 
      leftBounds.maxY - leftBounds.minY
    );
    ctx.fill();
    
    // Right eye area
    ctx.beginPath();
    ctx.rect(
      rightBounds.minX, 
      rightBounds.minY, 
      rightBounds.maxX - rightBounds.minX, 
      rightBounds.maxY - rightBounds.minY
    );
    ctx.fill();
    
    // Add length indicators
    addLengthIndicators(ctx, leftLashes, 'left');
    addLengthIndicators(ctx, rightLashes, 'right');
  } catch (error) {
    console.error("Error adding template guides:", error);
  }
}

// Add length indicators to the template
function addLengthIndicators(ctx, lashes, side) {
  try {
    // Group lashes into sections (inner, middle, outer)
    const numLashes = lashes.length;
    const innerLashes = lashes.slice(0, Math.floor(numLashes * 0.3));
    const middleLashes = lashes.slice(Math.floor(numLashes * 0.3), Math.floor(numLashes * 0.7));
    const outerLashes = lashes.slice(Math.floor(numLashes * 0.7));
    
    // Calculate average positions for labels
    const innerPos = getAveragePosition(innerLashes.map(l => l.end));
    const middlePos = getAveragePosition(middleLashes.map(l => l.end));
    const outerPos = getAveragePosition(outerLashes.map(l => l.end));
    
    // Add labels
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(0, 0, 150, 0.7)';
    
    // Position offset based on side
    const xOffset = side === 'left' ? -40 : 10;
    
    ctx.fillText('8-9mm', innerPos[0] + xOffset, innerPos[1]);
    ctx.fillText('10-11mm', middlePos[0] + xOffset, middlePos[1]);
    ctx.fillText('12-14mm', outerPos[0] + xOffset, outerPos[1]);
  } catch (error) {
    console.error("Error adding length indicators:", error);
  }
}

// Utility function to get a point along a curve using linear interpolation
function getPointAlongCurve(points, t) {
  try {
    if (points.length === 0) return [0, 0];
    if (t <= 0 || points.length === 1) return points[0];
    if (t >= 1) return points[points.length - 1];
    
    const index = t * (points.length - 1);
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);
    const weight = index - lowerIndex;
    
    if (lowerIndex === upperIndex) return points[lowerIndex];
    
    return [
      points[lowerIndex][0] * (1 - weight) + points[upperIndex][0] * weight,
      points[lowerIndex][1] * (1 - weight) + points[upperIndex][1] * weight
    ];
  } catch (error) {
    console.error("Error getting point along curve:", error);
    return [0, 0]; // Fallback
  }
}

// Utility function to map a value from one range to another
function mapRange(value, fromLow, fromHigh, toLow, toHigh) {
  try {
    return toLow + (toHigh - toLow) * ((value - fromLow) / (fromHigh - fromLow));
  } catch (error) {
    console.error("Error mapping range:", error);
    return toLow; // Fallback
  }
}

// Get bounding box of a set of points
function getBoundingBox(points) {
  try {
    if (points.length === 0) {
      return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    }
    
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    points.forEach(point => {
      minX = Math.min(minX, point[0]);
      minY = Math.min(minY, point[1]);
      maxX = Math.max(maxX, point[0]);
      maxY = Math.max(maxY, point[1]);
    });
    
    return { minX, minY, maxX, maxY };
  } catch (error) {
    console.error("Error getting bounding box:", error);
    return { minX: 0, minY: 0, maxX: 100, maxY: 100 }; // Fallback
  }
}

// Get average position of a set of points
function getAveragePosition(points) {
  try {
    if (points.length === 0) {
      return [0, 0];
    }
    
    const sum = points.reduce((acc, point) => {
      return [acc[0] + point[0], acc[1] + point[1]];
    }, [0, 0]);
    
    return [sum[0] / points.length, sum[1] / points.length];
  } catch (error) {
    console.error("Error getting average position:", error);
    return [0, 0]; // Fallback
  }
}

export default generateLashTemplate;
