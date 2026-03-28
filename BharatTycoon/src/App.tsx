import React, { useState } from 'react';
import { OnboardingFlow } from './components/OnboardingFlow';
import { GameplayLoop } from './components/GameplayLoop';
import { GuidedGame } from './components/GuidedGame';
import { TutorialScreen } from './components/TutorialScreen';

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

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUser(profile);
    // Skip tutorial for now, go directly to game
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

  return <GameplayLoop user={user} gameState={gameState} setGameState={setGameState} />;
};

export default App;
