import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@mediapipe/face_mesh';
import { analyzeFaceShape, analyzeEyeShape } from '../utils/shapeAnalysis';
import { generateLashTemplate } from '../utils/templateGenerator';

const ImageProcessing = ({ imageData, onProcessingComplete, onReset }) => {
  const [loadingStatus, setLoadingStatus] = useState('Loading TensorFlow.js...');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const processImage = async () => {
      try {
        // Load TensorFlow.js and set backend
        setLoadingStatus('Initializing TensorFlow.js...');
        setProgress(10);
        await tf.setBackend('webgl');
        await tf.ready();
        
        // Load face landmarks detection model
        setLoadingStatus('Loading face detection model...');
        setProgress(30);
        
        // Use a different approach to load the model
        const model = await faceLandmarksDetection.load(
          faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
          {
            maxFaces: 1,
            refineLandmarks: true,
            detectionConfidence: 0.9,
          }
        );
        
        // Wait for image to load
        setLoadingStatus('Preparing image...');
        setProgress(50);
        await new Promise(resolve => {
          if (imageRef.current.complete) resolve();
          else imageRef.current.onload = resolve;
        });
        
        // Detect face landmarks
        setLoadingStatus('Detecting facial landmarks...');
        setProgress(60);
        const predictions = await model.estimateFaces({
          input: imageRef.current
        });
        
        if (predictions.length === 0) {
          throw new Error('No face detected. Please try again with a clearer photo.');
        }
        
        // Analyze face and eye shapes
        setLoadingStatus('Analyzing face and eye shapes...');
        setProgress(75);
        const faceLandmarks = predictions[0].scaledMesh;
        
        // Draw landmarks on canvas for debugging
        const canvas = canvasRef.current;
        canvas.width = imageRef.current.width;
        canvas.height = imageRef.current.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageRef.current, 0, 0);
        
        // Draw landmarks for debugging
        ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        faceLandmarks.forEach(point => {
          ctx.beginPath();
          ctx.arc(point[0], point[1], 1, 0, 2 * Math.PI);
          ctx.fill();
        });
        
        // Analyze face and eye shapes
        const faceShape = analyzeFaceShape(faceLandmarks);
        const eyeShape = analyzeEyeShape(faceLandmarks);
        
        // Generate lash template
        setLoadingStatus('Generating lash template...');
        setProgress(90);
        const template = generateLashTemplate(faceLandmarks, faceShape, eyeShape);
        
        // Draw template on canvas
        template.draw(ctx);
        
        // Complete processing
        setProgress(100);
        setLoadingStatus('Processing complete!');
        
        // Prepare results
        const results = {
          faceShape,
          eyeShape,
          template,
          canvasData: canvas.toDataURL('image/png')
        };
        
        // Short delay to show completion
        setTimeout(() => {
          onProcessingComplete(results);
        }, 500);
        
      } catch (err) {
        console.error('Processing error:', err);
        setError(err.message || 'An error occurred during image processing.');
      }
    };
    
    processImage();
  }, [imageData, onProcessingComplete]);

  return (
    <ProcessingContainer>
      <h2>Processing Your Image</h2>
      
      <ProcessingContent>
        <ImagePreview>
          <img 
            ref={imageRef} 
            src={imageData} 
            alt="Uploaded face" 
            style={{ display: 'none' }}
          />
          <canvas 
            ref={canvasRef} 
            style={{ maxWidth: '100%', maxHeight: '400px', display: 'block', margin: '0 auto' }}
          />
        </ImagePreview>
        
        <ProcessingStatus>
          <StatusText>{loadingStatus}</StatusText>
          <ProgressBar>
            <ProgressFill style={{ width: `${progress}%` }} />
          </ProgressBar>
          <ProcessingSteps>
            <Step completed={progress >= 10}>Initialize AI</Step>
            <Step completed={progress >= 30}>Load face detection</Step>
            <Step completed={progress >= 60}>Detect facial landmarks</Step>
            <Step completed={progress >= 75}>Analyze shapes</Step>
            <Step completed={progress >= 90}>Generate template</Step>
            <Step completed={progress >= 100}>Complete</Step>
          </ProcessingSteps>
        </ProcessingStatus>
      </ProcessingContent>
      
      {error && (
        <ErrorMessage>
          <p>{error}</p>
          <button className="primary-button" onClick={onReset}>
            Try Again
          </button>
        </ErrorMessage>
      )}
    </ProcessingContainer>
  );
};

const ProcessingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  
  h2 {
    color: var(--primary-color);
    text-align: center;
  }
`;

const ProcessingContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 800px;
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const ImagePreview = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--border-radius);
  overflow: hidden;
  background-color: #f0f0f0;
  min-height: 300px;
`;

const ProcessingStatus = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const StatusText = styled.p`
  font-weight: 500;
  text-align: center;
  color: var(--primary-color);
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  transition: width 0.3s ease;
`;

const ProcessingSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${props => props.completed ? 'var(--success-color)' : 'var(--text-color)'};
  opacity: ${props => props.completed ? 1 : 0.6};
  
  &:before {
    content: '';
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${props => props.completed ? 'var(--success-color)' : '#e0e0e0'};
  }
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: var(--danger-color);
  padding: 1rem;
  border-radius: var(--border-radius);
  text-align: center;
  max-width: 500px;
  width: 100%;
  
  p {
    margin-bottom: 1rem;
  }
`;

export default ImageProcessing;
