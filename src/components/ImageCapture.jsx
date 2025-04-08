import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import Webcam from 'react-webcam';

const ImageCapture = ({ onImageCaptured }) => {
  const [captureMethod, setCaptureMethod] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleMethodSelect = (method) => {
    setCaptureMethod(method);
  };

  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  const captureFromWebcam = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    onImageCaptured(imageSrc);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageCaptured(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <CaptureContainer>
      <h2>Step 1: Capture or Upload an Image</h2>
      
      {!captureMethod ? (
        <MethodSelection>
          <p>Choose how you'd like to provide your image:</p>
          <ButtonGroup>
            <button 
              className="primary-button"
              onClick={() => handleMethodSelect('webcam')}
            >
              Use Webcam
            </button>
            <button 
              className="primary-button"
              onClick={() => handleMethodSelect('upload')}
            >
              Upload Photo
            </button>
          </ButtonGroup>
        </MethodSelection>
      ) : captureMethod === 'webcam' ? (
        <WebcamContainer>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 720,
              height: 720,
              facingMode: "user"
            }}
            onUserMedia={handleCameraReady}
            mirrored={true}
          />
          <ButtonGroup>
            <button 
              className="primary-button"
              onClick={captureFromWebcam}
              disabled={!isCameraReady}
            >
              Capture Photo
            </button>
            <button 
              className="secondary-button"
              onClick={() => setCaptureMethod(null)}
            >
              Back
            </button>
          </ButtonGroup>
          <CameraInstructions>
            <p>Position your face in the center of the frame</p>
            <p>Ensure good lighting and a neutral expression</p>
          </CameraInstructions>
        </WebcamContainer>
      ) : (
        <UploadContainer>
          <UploadBox onClick={triggerFileInput}>
            <UploadIcon>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </UploadIcon>
            <p>Click to upload a photo</p>
            <p className="small">or drag and drop</p>
          </UploadBox>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button 
            className="secondary-button"
            onClick={() => setCaptureMethod(null)}
          >
            Back
          </button>
        </UploadContainer>
      )}

      <Guidelines>
        <h3>For best results:</h3>
        <ul>
          <li>Use a well-lit environment</li>
          <li>Face the camera directly</li>
          <li>Remove glasses if possible</li>
          <li>Keep a neutral expression</li>
          <li>Ensure your entire face is visible</li>
        </ul>
      </Guidelines>
    </CaptureContainer>
  );
};

const CaptureContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  
  h2 {
    color: var(--primary-color);
    text-align: center;
    margin-bottom: 1rem;
  }
`;

const MethodSelection = styled.div`
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  width: 100%;
  max-width: 500px;
  
  p {
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  
  button {
    min-width: 150px;
  }
`;

const WebcamContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 720px;
  
  video {
    width: 100%;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
  }
`;

const CameraInstructions = styled.div`
  background-color: rgba(0, 0, 0, 0.05);
  padding: 1rem;
  border-radius: var(--border-radius);
  text-align: center;
  width: 100%;
  
  p {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
`;

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 500px;
`;

const UploadBox = styled.div`
  border: 2px dashed var(--primary-color);
  border-radius: var(--border-radius);
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  width: 100%;
  transition: var(--transition);
  background-color: white;
  
  &:hover {
    background-color: var(--light-bg);
  }
  
  p {
    margin-top: 1rem;
    color: var(--text-color);
  }
  
  .small {
    font-size: 0.9rem;
    opacity: 0.7;
  }
`;

const UploadIcon = styled.div`
  color: var(--primary-color);
  margin-bottom: 1rem;
`;

const Guidelines = styled.div`
  background-color: white;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  max-width: 500px;
  width: 100%;
  
  h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }
  
  ul {
    padding-left: 1.5rem;
    
    li {
      margin-bottom: 0.5rem;
    }
  }
`;

export default ImageCapture;
