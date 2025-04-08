/**
 * Utility functions for image processing
 */

// Resize an image to a maximum dimension while maintaining aspect ratio
export const resizeImage = (imageData, maxDimension = 800) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      // Resize if needed
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      
      // Create canvas for resizing
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw resized image
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get data URL
      const resizedImageData = canvas.toDataURL('image/jpeg', 0.9);
      resolve(resizedImageData);
    };
    
    img.src = imageData;
  });
};

// Normalize image orientation based on EXIF data
export const normalizeImageOrientation = (imageData) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set proper canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image with correct orientation
      ctx.drawImage(img, 0, 0);
      
      // Get normalized image data
      const normalizedImageData = canvas.toDataURL('image/jpeg', 0.9);
      resolve(normalizedImageData);
    };
    
    img.src = imageData;
  });
};

// Convert base64 image to Blob
export const base64ToBlob = (base64Data) => {
  const parts = base64Data.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
};

// Create a downloadable URL from image data
export const createDownloadableUrl = (imageData) => {
  const blob = base64ToBlob(imageData);
  return URL.createObjectURL(blob);
};

// Apply image filters (brightness, contrast, etc.)
export const applyImageFilters = (imageData, filters = {}) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Apply filters if specified
      if (Object.keys(filters).length > 0) {
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Apply brightness
        if (filters.brightness) {
          const brightness = filters.brightness;
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, data[i] + brightness));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightness));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightness));
          }
        }
        
        // Apply contrast
        if (filters.contrast) {
          const contrast = filters.contrast;
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
            data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
            data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
          }
        }
        
        // Put modified image data back
        ctx.putImageData(imageData, 0, 0);
      }
      
      // Get filtered image data
      const filteredImageData = canvas.toDataURL('image/jpeg', 0.9);
      resolve(filteredImageData);
    };
    
    img.src = imageData;
  });
};
