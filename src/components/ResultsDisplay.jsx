import { useState, useRef } from 'react';
import styled from 'styled-components';

const ResultsDisplay = ({ imageData, results, onReset }) => {
  const [activeTab, setActiveTab] = useState('results');
  const canvasRef = useRef(null);

  const { faceShape, eyeShape, canvasData } = results;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = 'eyelash-mapping.png';
    link.href = canvasData;
    link.click();
  };

  const getLashRecommendations = () => {
    // This would be expanded with more detailed recommendations based on face/eye shape
    const recommendations = {
      'oval': {
        'almond': 'Classic J curl, varied lengths (8-12mm)',
        'round': 'C curl, longer at outer corners (9-13mm)',
        'hooded': 'L+ curl for lift, graduated lengths (10-12mm)',
        'monolid': 'C or CC curl, varied lengths (9-14mm)',
        'downturned': 'L or L+ curl, longer at outer corners (10-14mm)'
      },
      'round': {
        'almond': 'C curl, longer at outer corners (9-13mm)',
        'round': 'J curl, shorter at inner corners (8-12mm)',
        'hooded': 'L curl, graduated effect (9-13mm)',
        'monolid': 'CC curl, varied lengths (10-14mm)',
        'downturned': 'L+ curl, longer at outer corners (10-14mm)'
      },
      'square': {
        'almond': 'J or B curl, varied lengths (9-13mm)',
        'round': 'C curl, shorter at inner corners (8-12mm)',
        'hooded': 'L curl, graduated effect (10-14mm)',
        'monolid': 'CC curl, varied lengths (10-14mm)',
        'downturned': 'L+ curl, longer at outer corners (10-14mm)'
      },
      'heart': {
        'almond': 'J curl, natural effect (8-12mm)',
        'round': 'C curl, shorter at inner corners (8-12mm)',
        'hooded': 'L curl, graduated effect (9-13mm)',
        'monolid': 'CC curl, varied lengths (9-13mm)',
        'downturned': 'L curl, longer at outer corners (9-13mm)'
      },
      'oblong': {
        'almond': 'C curl, varied lengths (9-13mm)',
        'round': 'J curl, shorter at inner corners (8-12mm)',
        'hooded': 'L curl, graduated effect (10-14mm)',
        'monolid': 'CC curl, varied lengths (10-14mm)',
        'downturned': 'L+ curl, longer at outer corners (10-14mm)'
      }
    };

    return recommendations[faceShape]?.[eyeShape] || 
      'Classic J curl with varied lengths (8-12mm)';
  };

  return (
    <ResultsContainer>
      <h2>Your Eyelash Mapping Results</h2>
      
      <TabsContainer>
        <TabButton 
          active={activeTab === 'results'} 
          onClick={() => setActiveTab('results')}
        >
          Results
        </TabButton>
        <TabButton 
          active={activeTab === 'recommendations'} 
          onClick={() => setActiveTab('recommendations')}
        >
          Recommendations
        </TabButton>
        <TabButton 
          active={activeTab === 'about'} 
          onClick={() => setActiveTab('about')}
        >
          About Analysis
        </TabButton>
      </TabsContainer>
      
      <TabContent>
        {activeTab === 'results' && (
          <ResultsTab>
            <ResultImage>
              <img src={canvasData} alt="Eyelash mapping result" />
            </ResultImage>
            
            <ResultsSummary>
              <ResultItem>
                <h3>Face Shape</h3>
                <p>{faceShape.charAt(0).toUpperCase() + faceShape.slice(1)}</p>
              </ResultItem>
              
              <ResultItem>
                <h3>Eye Shape</h3>
                <p>{eyeShape.charAt(0).toUpperCase() + eyeShape.slice(1)}</p>
              </ResultItem>
              
              <ResultItem>
                <h3>Recommended Lash Style</h3>
                <p>{getLashRecommendations()}</p>
              </ResultItem>
              
              <ButtonGroup>
                <button className="primary-button" onClick={handleDownload}>
                  Download Mapping
                </button>
                <button className="secondary-button" onClick={onReset}>
                  Try Another Photo
                </button>
              </ButtonGroup>
            </ResultsSummary>
          </ResultsTab>
        )}
        
        {activeTab === 'recommendations' && (
          <RecommendationsTab>
            <h3>Personalized Lash Recommendations</h3>
            
            <RecommendationSection>
              <h4>Lash Curl Type</h4>
              <p>Based on your {eyeShape} eye shape and {faceShape} face shape, we recommend:</p>
              <RecommendationList>
                <li><strong>Primary Curl:</strong> {eyeShape === 'hooded' || eyeShape === 'downturned' ? 'L or L+ curl' : 'C or J curl'}</li>
                <li><strong>Effect:</strong> {eyeShape === 'round' ? 'Elongating effect' : eyeShape === 'hooded' ? 'Lifting effect' : 'Natural enhancement'}</li>
              </RecommendationList>
            </RecommendationSection>
            
            <RecommendationSection>
              <h4>Lash Length Mapping</h4>
              <LashLengthMap>
                <div className="eye-diagram">
                  <div className="inner">8-9mm</div>
                  <div className="middle">10-11mm</div>
                  <div className="outer">{eyeShape === 'downturned' || eyeShape === 'almond' ? '12-14mm' : '11-13mm'}</div>
                </div>
                <p>Inner corner: Shorter lashes (8-9mm)</p>
                <p>Middle section: Medium lashes (10-11mm)</p>
                <p>Outer corner: {eyeShape === 'downturned' || eyeShape === 'almond' ? 'Longest lashes (12-14mm)' : 'Longer lashes (11-13mm)'}</p>
              </LashLengthMap>
            </RecommendationSection>
            
            <RecommendationSection>
              <h4>Lash Thickness & Style</h4>
              <RecommendationList>
                <li><strong>Thickness:</strong> {faceShape === 'round' || faceShape === 'square' ? '0.07-0.10mm (natural look)' : '0.10-0.15mm (more dramatic)'}</li>
                <li><strong>Style:</strong> {eyeShape === 'hooded' ? 'Open eye effect' : eyeShape === 'round' ? 'Cat eye effect' : 'Natural effect'}</li>
                <li><strong>Density:</strong> {faceShape === 'oval' || faceShape === 'heart' ? 'Medium to full' : 'Light to medium'}</li>
              </RecommendationList>
            </RecommendationSection>
          </RecommendationsTab>
        )}
        
        {activeTab === 'about' && (
          <AboutTab>
            <h3>About Our Analysis Technology</h3>
            
            <AboutSection>
              <h4>Face Shape Analysis</h4>
              <p>Our AI analyzes over 30 facial landmarks to determine your face shape. We measure proportions between key points including:</p>
              <ul>
                <li>Forehead width to jawline width ratio</li>
                <li>Face length to face width ratio</li>
                <li>Jawline angle and definition</li>
                <li>Cheekbone prominence</li>
              </ul>
            </AboutSection>
            
            <AboutSection>
              <h4>Eye Shape Analysis</h4>
              <p>The eye shape classification examines:</p>
              <ul>
                <li>Eyelid structure and crease visibility</li>
                <li>Eye width to height ratio</li>
                <li>Outer corner angle (upturned vs. downturned)</li>
                <li>Visible lid space</li>
              </ul>
            </AboutSection>
            
            <AboutSection>
              <h4>Template Generation</h4>
              <p>Our lash mapping templates are generated based on:</p>
              <ul>
                <li>Precise eye contour measurements</li>
                <li>Optimal lash length distribution for your eye shape</li>
                <li>Customized curl patterns based on face and eye shape</li>
                <li>Professional lash artist best practices</li>
              </ul>
              <p>All processing happens directly in your browser for privacy.</p>
            </AboutSection>
          </AboutTab>
        )}
      </TabContent>
    </ResultsContainer>
  );
};

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  
  h2 {
    color: var(--primary-color);
    text-align: center;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
    width: 100%;
  }
`;

const TabButton = styled.button`
  background-color: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  border: 1px solid ${props => props.active ? 'var(--primary-color)' : '#ddd'};
  border-radius: var(--border-radius);
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: var(--transition);
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-color)' : '#f0f0f0'};
  }
`;

const TabContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  width: 100%;
  max-width: 900px;
`;

const ResultsTab = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const ResultImage = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  
  img {
    max-width: 100%;
    max-height: 400px;
    border-radius: var(--border-radius);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const ResultsSummary = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ResultItem = styled.div`
  h3 {
    color: var(--primary-color);
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 1.2rem;
    font-weight: 500;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const RecommendationsTab = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  h3 {
    color: var(--primary-color);
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }
`;

const RecommendationSection = styled.div`
  margin-bottom: 1.5rem;
  
  h4 {
    color: var(--secondary-color);
    margin-bottom: 0.75rem;
    font-size: 1.1rem;
  }
`;

const RecommendationList = styled.ul`
  list-style-type: none;
  padding: 0;
  
  li {
    margin-bottom: 0.75rem;
    padding-left: 1.5rem;
    position: relative;
    
    &:before {
      content: '•';
      position: absolute;
      left: 0;
      color: var(--primary-color);
    }
  }
`;

const LashLengthMap = styled.div`
  margin: 1rem 0;
  
  .eye-diagram {
    display: flex;
    justify-content: space-between;
    background-color: #f0f0f0;
    border-radius: 100px;
    padding: 1rem 2rem;
    margin-bottom: 1rem;
    position: relative;
    
    &:before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: #333;
    }
    
    div {
      background-color: var(--primary-color);
      color: white;
      padding: 0.5rem;
      border-radius: 4px;
      font-size: 0.9rem;
    }
  }
  
  p {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
`;

const AboutTab = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  h3 {
    color: var(--primary-color);
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }
`;

const AboutSection = styled.div`
  margin-bottom: 1.5rem;
  
  h4 {
    color: var(--secondary-color);
    margin-bottom: 0.75rem;
    font-size: 1.1rem;
  }
  
  p {
    margin-bottom: 1rem;
  }
  
  ul {
    padding-left: 1.5rem;
    
    li {
      margin-bottom: 0.5rem;
    }
  }
`;

export default ResultsDisplay;
