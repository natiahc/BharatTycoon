import React, { useState } from 'react';
import { OnboardingFlow } from './components/OnboardingFlow';
import { GameplayLoop } from './components/GameplayLoop';
import { GuidedGame } from './components/GuidedGame';
import { TutorialScreen } from './components/TutorialScreen';
import { FinancialDashboard } from './components/FinancialDashboard';
import { MLFeaturesPanel } from './components/MLFeaturesPanel';
import { BusinessSimulation } from './components/BusinessSimulation';
import { api } from './utils/api';

export interface UserProfile {
  id: string;
  name: string;
  city: string;
  capital: number;
  riskAppetite: 'low' | 'medium' | 'high';
  experience: 'beginner' | 'intermediate' | 'expert';
  timeCommitment: 'casual' | 'moderate' | 'dedicated';
  interests: string[];
  onboardingComplete: boolean;
  uiLevel: 'game' | 'advanced' | 'expert';
}

export interface GameState {
  month: number;
  cash: number;
  revenue: number;
  costs: number;
  profit: number;
  businessType: string;
  businessName: string;
  phase: 'founder' | 'seed' | 'growth' | 'scale';
}

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);

  const handleOnboardingComplete = async (profile: UserProfile) => {
    setUser(profile);
    const initialCosts = profile.capital * 0.15;
    const initialState: GameState = {
      month: 1,
      cash: profile.capital - initialCosts,
      revenue: Math.round(profile.capital * 0.25),
      costs: initialCosts,
      profit: Math.round(profile.capital * 0.25) - initialCosts,
      businessType: profile.interests[0] || 'service',
      businessName: profile.interests[0] || 'service',
      phase: 'founder'
    };
    setGameState(initialState);
    setShowTutorial(false);

    try {
      const userFactors = {
        capital: profile.capital,
        risk_appetite: profile.riskAppetite,
        experience: profile.experience,
        time_commitment: profile.timeCommitment,
        interests: profile.interests
      };
      const cityFactors = {
        city: profile.city,
        business_type: profile.interests[0] || 'service',
        purchasing_power: 0.7,
        competition_level: 0.5,
        seasonality: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      };
      const recommendations = await api.unified.recommend(userFactors, cityFactors);
      setAiRecommendations(recommendations);
    } catch (err) {
      console.error('Failed to get AI recommendations:', err);
    }
  };

  const handleTutorialComplete = () => {
    if (!user) return;
    setShowTutorial(false);
    const initialCosts = user.capital * 0.15;
    const initialState: GameState = {
      month: 1,
      cash: user.capital - initialCosts,
      revenue: Math.round(user.capital * 0.25),
      costs: initialCosts,
      profit: Math.round(user.capital * 0.25) - initialCosts,
      businessType: user.interests[0] || 'service',
      businessName: user.interests[0] || 'service',
      phase: 'founder'
    };
    setGameState(initialState);
  };

  if (!user) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (!gameState) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (user.uiLevel === 'game') {
    return <GuidedGame user={user} gameState={gameState} setGameState={setGameState} />;
  }

  if (user.uiLevel === 'expert') {
    return (
      <div className="expert-view">
        <header className="expert-header">
          <h1>BharatTycoon AI Studio</h1>
          <div className="user-info">
            <span>{user.name}</span>
            <span>₹{user.capital.toLocaleString()}</span>
          </div>
        </header>
        
        {aiRecommendations && (
          <div className="ai-recommendations-banner">
            <h3>AI Recommendations</h3>
            <p>{aiRecommendations.recommendations?.[0]?.description || 'Loading...'}</p>
          </div>
        )}
        
        <div className="expert-content expert-grid">
          <div className="left-panel">
            <GameplayLoop user={user} gameState={gameState} setGameState={setGameState} />
            <BusinessSimulation 
              businessType={gameState?.businessType || 'restaurant'}
              cityTier={1}
              capital={user.capital}
            />
          </div>
          <div className="right-panel">
            <FinancialDashboard 
              businessType={gameState?.businessType || 'restaurant'}
              cityTier={1}
              capital={user.capital}
            />
            <MLFeaturesPanel />
          </div>
        </div>
      </div>
    );
  }

  return <GameplayLoop user={user} gameState={gameState} setGameState={setGameState} />;
};

export default App;
