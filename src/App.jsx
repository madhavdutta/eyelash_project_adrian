import React, { useState } from 'react';
import styled from 'styled-components';
import ImageCapture from './components/ImageCapture';
import ImageProcessing from './components/ImageProcessing';
import ResultsDisplay from './components/ResultsDisplay';

// App stages
const STAGES = {
  CAPTURE: 'capture',
  PROCESSING: 'processing',
  RESULTS: 'results'
};

function App() {
  const [stage, setStage] = useState(STAGES.CAPTURE);
  const [imageData, setImageData] = useState(null);
  const [results, setResults] = useState(null);

  const handleImageCaptured = (image) => {
    setImageData(image);
    setStage(STAGES.PROCESSING);
  };

  const handleProcessingComplete = (processedResults) => {
    setResults(processedResults);
    setStage(STAGES.RESULTS);
  };

  const handleReset = () => {
    setImageData(null);
    setResults(null);
    setStage(STAGES.CAPTURE);
  };

  return (
    <AppContainer>
      <Header>
        <h1>AI Eyelash Mapping</h1>
        <p>Precision lash mapping powered by AI</p>
      </Header>

      <MainContent>
        {stage === STAGES.CAPTURE && (
          <ImageCapture onImageCaptured={handleImageCaptured} />
        )}
        
        {stage === STAGES.PROCESSING && imageData && (
          <ImageProcessing 
            imageData={imageData} 
            onProcessingComplete={handleProcessingComplete}
            onReset={handleReset}
          />
        )}
        
        {stage === STAGES.RESULTS && results && (
          <ResultsDisplay 
            imageData={imageData}
            results={results}
            onReset={handleReset}
          />
        )}
      </MainContent>

      <Footer>
        <p>© 2023 AI Eyelash Mapping | Privacy-focused face analysis</p>
      </Footer>
    </AppContainer>
  );
}

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled.header`
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1rem;
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    
    h1 {
      font-size: 1.5rem;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Footer = styled.footer`
  background-color: var(--dark-bg);
  color: white;
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
`;

export default App;
