import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../App';

const UI_LEVELS = [
  { id: 'game', name: 'Simple Play', description: 'Card-based decisions, guided gameplay', icon: '🎮' },
  { id: 'advanced', name: 'Detailed View', description: 'More options with financial tracking', icon: '📊' },
  { id: 'expert', name: 'Full Simulation', description: 'All metrics and advanced decisions', icon: '🚀' }
];

interface State {
  id: string;
  name: string;
  city_count?: number;
}

interface City {
  id: string;
  name: string;
}

interface DynamicRecommendation {
  business_id: string;
  business_name: string;
  capital_required: number;
  monthly_profit: number;
  projected_annual_profit: number;
  risk_level: string;
  score: number;
  reasons: string[];
  trend_alignment: number;
  seasonal_boost: number;
  city_growth: number;
}

interface CityData {
  city: string;
  city_demand: number;
  city_growth: number;
  purchasing_power: number;
  competition_level: number;
  current_trends: string[];
  seasonal_factor: number;
  economic_indicators: {
    inflation: number;
    gdp_growth: number;
    consumer_confidence: number;
  };
  recommendations: DynamicRecommendation[];
}

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingFlow: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [selectedUI, setSelectedUI] = useState<'game' | 'advanced' | 'expert'>('game');
  const [capital, setCapital] = useState(100000);
  const [name, setName] = useState('');
  const [riskAppetite, setRiskAppetite] = useState<'low' | 'medium' | 'high'>('medium');
  const [aiData, setAiData] = useState<CityData | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [fetchedCity, setFetchedCity] = useState('');
  const capitalRef = useRef(capital);
  const riskAppetiteRef = useRef(riskAppetite);
  const selectedCityRef = useRef(selectedCity);
  const selectedStateRef = useRef(selectedState);

  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Load states on mount
  useEffect(() => {
    fetch('http://localhost:8000/india/states')
      .then(res => res.json())
      .then(data => setStates(data.states || []))
      .catch(err => console.error('Failed to load states:', err));
  }, []);

  // Load cities when state changes
  useEffect(() => {
    if (selectedState) {
      setLoadingLocations(true);
      fetch(`http://localhost:8000/india/states/${selectedState}`)
        .then(res => res.json())
        .then(data => {
          setCities(data.cities || []);
          setLoadingLocations(false);
        })
        .catch(err => {
          console.error('Failed to load cities:', err);
          setLoadingLocations(false);
        });
    } else {
      setCities([]);
    }
  }, [selectedState]);

  const currentStateCities = cities;

  useEffect(() => { capitalRef.current = capital; }, [capital]);
  useEffect(() => { riskAppetiteRef.current = riskAppetite; }, [riskAppetite]);
  useEffect(() => { selectedCityRef.current = selectedCity; }, [selectedCity]);
  useEffect(() => { selectedStateRef.current = selectedState; }, [selectedState]);

  useEffect(() => {
    if (step === 3 && selectedCity && selectedCity !== fetchedCity) {
      setAiData(null);
      fetchAIRecommendations();
    }
  }, [step, selectedCity, fetchedCity]);

  useEffect(() => {
    if (step !== 3) {
      setFetchedCity('');
    }
  }, [step]);

  const fetchAIRecommendations = async () => {
    setIsLoadingAI(true);
    const currentCapital = capitalRef.current;
    const currentRisk = riskAppetiteRef.current;
    const currentCity = selectedCityRef.current;
    
    try {
      const response = await fetch('http://localhost:8000/unified/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            capital: currentCapital,
            risk_appetite: currentRisk,
            experience: 'beginner',
            time_commitment: 'moderate',
            interests: []
          },
          city: {
            city: currentCity,
            business_type: '',
            purchasing_power: 0.8,
            competition_level: 0.5,
            seasonality: [1,1.1,1.2,1.1,1,0.9,0.8,0.9,1,1.1,1.2,1.3]
          }
        })
      });
      
      const data = await response.json();
      setAiData(data);
      setFetchedCity(currentCity);
      
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
    
    setIsLoadingAI(false);
  };

  const getCapitalTier = () => {
    if (capital <= 50000) return { tier: 'Starter', emoji: '🌱', color: '#22c55e' };
    if (capital <= 100000) return { tier: 'Small Business', emoji: '🏪', color: '#3b82f6' };
    if (capital <= 200000) return { tier: 'Growth', emoji: '📈', color: '#8b5cf6' };
    return { tier: 'Premium', emoji: '💎', color: '#f59e0b' };
  };

  const handleComplete = () => {
    const profile: UserProfile = {
      id: Date.now().toString(),
      name: name || 'Player',
      city: selectedCity,
      capital,
      riskAppetite,
      experience: 'beginner',
      timeCommitment: 'moderate',
      interests: [selectedBusiness],
      onboardingComplete: true,
      uiLevel: selectedUI
    };
    onComplete(profile);
  };

  const renderStep1_Capital = () => (
    <div style={styles.step}>
      <h2 style={styles.title}>💰 How Much Capital Do You Have?</h2>
      <p style={styles.subtitle}>This determines which businesses you can start</p>
      
      <div style={{...styles.capitalDisplay, borderColor: getCapitalTier().color}}>
        <span style={styles.capitalEmoji}>{getCapitalTier().emoji}</span>
        <span style={{...styles.capitalAmount, color: getCapitalTier().color}}>₹{capital.toLocaleString()}</span>
        <span style={{...styles.capitalTier, color: getCapitalTier().color}}>{getCapitalTier().tier} Level</span>
      </div>

      <div style={styles.inputGroup}>
        <input
          type="range"
          min="30000"
          max="500000"
          step="10000"
          value={capital}
          onChange={(e) => setCapital(Number(e.target.value))}
          style={styles.slider}
        />
        <div style={styles.sliderLabels}>
          <span>₹30K</span>
          <span>₹50K</span>
          <span>₹1L</span>
          <span>₹2L</span>
          <span>₹5L</span>
        </div>
      </div>

      <div style={styles.quickAmounts}>
        {[50000, 75000, 100000, 150000, 200000].map(amt => (
          <button
            key={amt}
            onClick={() => setCapital(amt)}
            style={{
              ...styles.quickBtn,
              background: capital === amt ? '#3b82f6' : '#1e293b'
            }}
          >
            ₹{(amt/1000).toFixed(0)}K
          </button>
        ))}
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Your Name (optional)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          style={styles.input}
        />
      </div>

      <button style={styles.primaryButton} onClick={() => setStep(2)}>
        Continue →
      </button>
    </div>
  );

  const renderStep2_State = () => (
    <div style={styles.step}>
      <div style={styles.selectedCapital}>
        <span>💰 Capital: <strong>₹{capital.toLocaleString()}</strong></span>
      </div>

      <h2 style={styles.title}>🗺️ Choose Your State</h2>
      <p style={styles.subtitle}>Select the state where you want to start your business</p>
      
      <div style={styles.grid}>
        {states.map(state => (
          <div
            key={state.id}
            onClick={() => { setSelectedState(state.id); setSelectedCity(''); }}
            style={{
              ...styles.card,
              ...(selectedState === state.id ? styles.cardSelected : {})
            }}
          >
            <span style={styles.cardIcon}>🏛️</span>
            <h3 style={styles.cardTitle}>{state.name}</h3>
            <p style={styles.cardDesc}>{state.city_count || 0} cities</p>
          </div>
        ))}
      </div>

      <button 
        style={{ ...styles.primaryButton, opacity: selectedState ? 1 : 0.5 }}
        disabled={!selectedState}
        onClick={() => setStep(3)}
      >
        Continue →
      </button>
    </div>
  );

  const renderStep3_City = () => {
    const stateName = states.find(s => s.id === selectedState)?.name || '';
    
    return (
    <div style={styles.step}>
      <div style={styles.selectedCapital}>
        <span>💰 Capital: <strong>₹{capital.toLocaleString()}</strong></span>
        <span style={{marginLeft: 12}}>📍 {stateName}</span>
      </div>

      <h2 style={styles.title}>🌆 Choose Your City</h2>
      <p style={styles.subtitle}>Select a city in {stateName}</p>
      
      {loadingLocations ? (
        <div style={{textAlign: 'center', padding: 40}}>
          <span style={{fontSize: 24}}>⏳ Loading cities...</span>
        </div>
      ) : (
      <div style={styles.grid}>
        {currentStateCities.map(city => (
          <div
            key={city.id}
            onClick={() => setSelectedCity(city.id)}
            style={{
              ...styles.card,
              ...(selectedCity === city.id ? styles.cardSelected : {})
            }}
          >
            <span style={styles.cardIcon}>🏙️</span>
            <h3 style={styles.cardTitle}>{city.name}</h3>
          </div>
        ))}
      </div>
      )}

      <button
        style={{ ...styles.primaryButton, opacity: selectedCity ? 1 : 0.5 }}
        disabled={!selectedCity || loadingLocations}
        onClick={() => setStep(4)}
      >
        Get AI Recommendations →
      </button>
    </div>
  );};

  const renderStep4_Recommendations = () => {
    const getRiskColor = (risk: string) => {
      if (risk === 'low') return '#22c55e';
      if (risk === 'medium') return '#f59e0b';
      return '#ef4444';
    };

    const getScoreColor = (score: number) => {
      if (score >= 80) return '#22c55e';
      if (score >= 60) return '#3b82f6';
      if (score >= 40) return '#f59e0b';
      return '#ef4444';
    };
    
    return (
      <div style={styles.step}>
        <div style={styles.headerRow}>
          <span style={styles.selectedLabel}>📍 {aiData?.city}</span>
          <span style={styles.selectedLabel}>💰 ₹{capital.toLocaleString()}</span>
        </div>

        <h2 style={styles.title}>🤖 AI-Powered Recommendations</h2>
        
        {isLoadingAI ? (
          <div style={styles.aiLoadingBox}>
            <div style={styles.aiBrain}>
              <span style={styles.aiEmoji}>🧠</span>
              <div style={styles.aiPulse}></div>
            </div>
            <h3 style={styles.aiTitle}>🤖 AI is Analyzing...</h3>
            <div style={styles.aiSteps}>
              <div style={styles.aiStep}>
                <span style={styles.aiStepIcon}>📊</span>
                <span>Fetching live market data</span>
              </div>
              <div style={styles.aiStep}>
                <span style={styles.aiStepIcon}>📰</span>
                <span>Analyzing recent news & trends</span>
              </div>
              <div style={styles.aiStep}>
                <span style={styles.aiStepIcon}>📈</span>
                <span>Processing economic indicators</span>
              </div>
              <div style={styles.aiStep}>
                <span style={styles.aiStepIcon}>🎯</span>
                <span>Calculating best matches</span>
              </div>
            </div>
            <div style={styles.aiProgress}>
              <div style={styles.aiProgressBar}></div>
            </div>
          </div>
        ) : aiData ? (
          <>
            <div style={styles.marketInfo}>
              <div style={styles.infoCard}>
                <span style={styles.infoLabel}>📈 City Growth</span>
                <span style={styles.infoValue}>{(aiData.city_growth * 100).toFixed(0)}%</span>
              </div>
              <div style={styles.infoCard}>
                <span style={styles.infoLabel}>💳 Purchasing Power</span>
                <span style={styles.infoValue}>{(aiData.purchasing_power * 100).toFixed(0)}%</span>
              </div>
              <div style={styles.infoCard}>
                <span style={styles.infoLabel}>🏢 Competition</span>
                <span style={styles.infoValue}>{aiData.competition_level.toFixed(0)}%</span>
              </div>
              <div style={styles.infoCard}>
                <span style={styles.infoLabel}>📅 Seasonal Factor</span>
                <span style={styles.infoValue}>{(aiData.seasonal_factor * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div style={styles.trendsRow}>
              <span style={styles.trendLabel}>🔥 2026 Trends:</span>
              {aiData.current_trends.slice(0, 3).map((trend: any, i: number) => (
                <span key={i} style={styles.trendTag}>{trend.name}</span>
              ))}
            </div>

            <div style={styles.econRow}>
              <span>📊 GDP: +{aiData.economic_indicators.gdp_growth}%</span>
              <span>📉 Inflation: {aiData.economic_indicators.inflation}%</span>
              <span>😊 Confidence: {aiData.economic_indicators.consumer_confidence}%</span>
            </div>

            <div style={styles.recommendList}>
              {aiData.recommendations.map((rec) => (
                <div
                  key={rec.business_id}
                  onClick={() => setSelectedBusiness(rec.business_id)}
                  style={{
                    ...styles.recCard,
                    ...(selectedBusiness === rec.business_id ? styles.recCardSelected : {}),
                  }}
                >
                  <div style={styles.recHeader}>
                    <div style={styles.recTitle}>
                      <h3>{rec.business_name}</h3>
                      <span style={{
                        ...styles.score,
                        background: getScoreColor(rec.score)
                      }}>
                        {rec.score}% Match
                      </span>
                    </div>
                    <span style={{
                      ...styles.riskBadge,
                      background: getRiskColor(rec.risk_level)
                    }}>
                      {rec.risk_level} risk
                    </span>
                  </div>
                  
                  <div style={styles.recNumbers}>
                    <div style={styles.numItem}>
                      <span style={styles.numLabel}>Capital</span>
                      <span style={styles.numValue}>₹{rec.capital_required.toLocaleString()}</span>
                    </div>
                    <div style={styles.numItem}>
                      <span style={styles.numLabel}>Monthly Profit</span>
                      <span style={styles.numValue}>₹{rec.monthly_profit.toLocaleString()}</span>
                    </div>
                    <div style={styles.numItem}>
                      <span style={styles.numLabel}>Annual Projected</span>
                      <span style={{...styles.numValue, color: '#22c55e'}}>₹{rec.projected_annual_profit.toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={styles.reasons}>
                    {rec.reasons.map((reason, i) => (
                      <span key={i} style={styles.reasonTag}>✓ {reason}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}

        <button
          style={{ ...styles.primaryButton, opacity: selectedBusiness ? 1 : 0.5 }}
          disabled={!selectedBusiness}
          onClick={() => setStep(5)}
        >
          Continue →
        </button>
      </div>
    );
  };

  const renderStep5_PlayStyle = () => (
    <div style={styles.step}>
      <h2 style={styles.title}>🎮 Choose Your Play Style</h2>
      <p style={styles.subtitle}>How much detail do you want?</p>
      
      <div style={styles.verticalGrid}>
        {UI_LEVELS.map(level => (
          <div
            key={level.id}
            onClick={() => setSelectedUI(level.id as any)}
            style={{
              ...styles.largeCard,
              ...(selectedUI === level.id ? styles.cardSelected : {})
            }}
          >
            <span style={styles.cardIcon}>{level.icon}</span>
            <div>
              <h3 style={styles.cardTitle}>{level.name}</h3>
              <p style={styles.cardDesc}>{level.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button style={styles.primaryButton} onClick={handleComplete}>
        Start Game! 🚀
      </button>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.progress}>
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} style={{...styles.progressDot, ...(step >= s ? styles.progressDotActive : {})}} />
        ))}
      </div>
      {step === 1 && renderStep1_Capital()}
      {step === 2 && renderStep2_State()}
      {step === 3 && renderStep3_City()}
      {step === 4 && renderStep4_Recommendations()}
      {step === 5 && renderStep5_PlayStyle()}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 800, margin: '0 auto', padding: 30, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  step: { animation: 'fadeIn 0.3s ease' },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 20, textAlign: 'center' },
  progress: { display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 },
  progressDot: { width: 10, height: 10, borderRadius: '50%', background: '#334155' },
  progressDotActive: { background: '#3b82f6' },
  
  capitalDisplay: { textAlign: 'center', padding: 30, borderRadius: 20, border: '3px solid', background: '#1e293b', marginBottom: 24 },
  capitalEmoji: { fontSize: 48, display: 'block', marginBottom: 8 },
  capitalAmount: { fontSize: 42, fontWeight: 800, display: 'block' },
  capitalTier: { fontSize: 16, fontWeight: 600, display: 'block', marginTop: 4 },
  
  slider: { width: '100%', marginBottom: 8, accentColor: '#3b82f6' },
  sliderLabels: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 20 },
  
  quickAmounts: { display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center', flexWrap: 'wrap' },
  quickBtn: { padding: '10px 16px', borderRadius: 8, border: '1px solid #334155', color: '#fff', cursor: 'pointer', fontSize: 14 },
  
  inputGroup: { marginBottom: 20 },
  label: { display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#e2e8f0' },
  input: { width: '100%', padding: 14, fontSize: 16, borderRadius: 12, border: '1px solid #334155', background: '#1e293b', color: '#fff' },
  
  selectedCapital: { textAlign: 'center', padding: 12, background: '#1e3a5f', borderRadius: 10, marginBottom: 20 },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 },
  card: { padding: 20, borderRadius: 12, border: '2px solid #334155', background: '#1e293b', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' },
  cardSelected: { borderColor: '#3b82f6', background: '#1e3a5f' },
  cardIcon: { fontSize: 32, display: 'block', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: 600, color: '#fff' },
  cardDesc: { fontSize: 12, color: '#94a3b8' },
  
  headerRow: { display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16 },
  selectedLabel: { background: '#1e293b', padding: '6px 12px', borderRadius: 8, fontSize: 13 },
  
  loadingBox: { textAlign: 'center', padding: 40, background: '#1e293b', borderRadius: 16, marginBottom: 20 },
  spinner: { fontSize: 32, animation: 'spin 1s linear infinite' },
  
  marketInfo: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 },
  infoCard: { background: '#1e293b', padding: 12, borderRadius: 10, textAlign: 'center' },
  infoLabel: { display: 'block', fontSize: 10, color: '#64748b', marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: 700, color: '#3b82f6' },
  
  trendsRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12, justifyContent: 'center' },
  trendLabel: { fontSize: 12, color: '#94a3b8' },
  trendTag: { background: '#22c55e22', color: '#22c55e', padding: '4px 10px', borderRadius: 20, fontSize: 11 },
  
  econRow: { display: 'flex', justifyContent: 'center', gap: 16, fontSize: 11, color: '#64748b', marginBottom: 16 },
  
  recommendList: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, maxHeight: 320, overflowY: 'auto' },
  recCard: { padding: 16, borderRadius: 12, border: '2px solid #334155', background: '#1e293b', cursor: 'pointer', transition: 'all 0.2s' },
  recCardSelected: { borderColor: '#22c55e', background: '#1e3a5f' },
  recHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  recTitle: { display: 'flex', alignItems: 'center', gap: 10 },
  score: { padding: '4px 10px', borderRadius: 20, fontSize: 11, color: '#fff', fontWeight: 600 },
  riskBadge: { padding: '4px 10px', borderRadius: 20, fontSize: 10, color: '#fff', textTransform: 'uppercase' },
  
  recNumbers: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12, padding: 10, background: '#0f172a', borderRadius: 8 },
  numItem: { textAlign: 'center' },
  numLabel: { display: 'block', fontSize: 9, color: '#64748b' },
  numValue: { fontSize: 14, fontWeight: 700, color: '#fff' },
  
  reasons: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  reasonTag: { fontSize: 11, color: '#22c55e', background: '#22c55e22', padding: '3px 8px', borderRadius: 4 },
  
  verticalGrid: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 },
  largeCard: { padding: 20, borderRadius: 14, border: '2px solid #334155', background: '#1e293b', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 16 },
  
  primaryButton: { width: '100%', padding: 16, fontSize: 16, fontWeight: 700, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', cursor: 'pointer' },
  
  aiLoadingBox: { textAlign: 'center', padding: 40, background: '#1e293b', borderRadius: 16, marginBottom: 20 },
  aiBrain: { position: 'relative', width: 80, height: 80, margin: '0 auto 20px' },
  aiEmoji: { fontSize: 60, display: 'block', animation: 'pulse 1.5s ease-in-out infinite' },
  aiPulse: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)', animation: 'pulse-ring 1.5s ease-out infinite' },
  aiTitle: { fontSize: 20, marginBottom: 20, color: '#3b82f6' },
  aiSteps: { textAlign: 'left', marginBottom: 20, padding: '0 20px' },
  aiStep: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', fontSize: 13, color: '#94a3b8' },
  aiStepIcon: { fontSize: 16 },
  aiProgress: { width: '100%', height: 4, background: '#334155', borderRadius: 2, overflow: 'hidden' },
  aiProgressBar: { height: '100%', background: 'linear-gradient(90deg, #3b82f6, #22c55e)', borderRadius: 2, animation: 'progress 2s ease-in-out infinite' }
};
