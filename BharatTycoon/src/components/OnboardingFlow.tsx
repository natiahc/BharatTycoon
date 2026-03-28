import React, { useState, useEffect } from 'react';
import { UserProfile } from '../App';

const CITIES = [
  { id: 'mumbai', name: 'Mumbai', description: 'Financial Capital - High opportunity, High competition', icon: '🏙️', bestFor: ['restaurant', 'retail', 'premium_grocery'], market: 'fastest-growing', demand: 85 },
  { id: 'delhi', name: 'Delhi', description: 'Large market - Retail & service focused', icon: '🛍️', bestFor: ['retail', 'grocery', 'service'], market: 'large', demand: 78 },
  { id: 'bangalore', name: 'Bangalore', description: 'Tech Hub - Startup ecosystem - Highest growth', icon: '💻', bestFor: ['tech', 'service', 'premium_grocery', 'fitness'], market: 'tech-hub', demand: 90 },
  { id: 'chennai', name: 'Chennai', description: 'Manufacturing & Auto - Steady growth', icon: '🏭', bestFor: ['manufacturing', 'service', 'restaurant'], market: 'industrial', demand: 65 },
  { id: 'hyderabad', name: 'Hyderabad', description: 'IT Corridor - Growing tech scene', icon: '🌐', bestFor: ['tech', 'restaurant', 'fitness'], market: 'emerging', demand: 72 },
  { id: 'kolkata', name: 'Kolkata', description: 'Traditional markets - Cost-effective', icon: '🎭', bestFor: ['grocery', 'retail', 'restaurant'], market: 'traditional', demand: 55 }
];

const BUSINESS_TYPES = [
  { id: 'restaurant', name: 'Restaurant', capital: 150000, risk: 'low', monthlyProfit: 25000, description: 'Food business - steady demand', icon: '🍛', trend: 'stable' },
  { id: 'grocery', name: 'Kirana Store', capital: 80000, risk: 'low', monthlyProfit: 15000, description: 'Essential goods - stable income', icon: '🥬', trend: 'growing' },
  { id: 'premium_grocery', name: 'Premium Grocery', capital: 200000, risk: 'medium', monthlyProfit: 35000, description: 'Organic & specialty foods', icon: '🥗', trend: 'booming' },
  { id: 'retail', name: 'Retail Store', capital: 120000, risk: 'medium', monthlyProfit: 20000, description: 'General merchandise', icon: '👕', trend: 'stable' },
  { id: 'tech', name: 'Tech Services', capital: 100000, risk: 'high', monthlyProfit: 45000, description: 'Software & IT services', icon: '💻', trend: 'booming' },
  { id: 'fitness', name: 'Fitness Center', capital: 180000, risk: 'medium', monthlyProfit: 30000, description: 'Gym & wellness', icon: '🏋️', trend: 'growing' },
  { id: 'pharmacy', name: 'Pharmacy', capital: 150000, risk: 'low', monthlyProfit: 28000, description: 'Medical store - reliable', icon: '💊', trend: 'stable' },
  { id: 'salon', name: 'Salon', capital: 100000, risk: 'low', monthlyProfit: 22000, description: 'Beauty & grooming', icon: '💇', trend: 'growing' },
  { id: 'service', name: 'Professional Services', capital: 75000, risk: 'low', monthlyProfit: 35000, description: 'Consulting, coaching', icon: '📋', trend: 'growing' },
  { id: 'manufacturing', name: 'Manufacturing', capital: 300000, risk: 'high', monthlyProfit: 60000, description: 'Production business', icon: '🏭', trend: 'stable' },
  { id: 'food_stall', name: 'Food Stall', capital: 50000, risk: 'low', monthlyProfit: 18000, description: 'Quick bites & snacks', icon: '🍕', trend: 'growing' },
  { id: 'mobile_repair', name: 'Mobile Repair', capital: 40000, risk: 'low', monthlyProfit: 20000, description: 'Electronics repair', icon: '📱', trend: 'booming' },
  { id: 'tuition', name: 'Tuition Center', capital: 30000, risk: 'low', monthlyProfit: 15000, description: 'Classes & coaching', icon: '📚', trend: 'growing' },
  { id: 'laundry', name: 'Laundry Service', capital: 60000, risk: 'low', monthlyProfit: 12000, description: 'Dry cleaning & washing', icon: '👔', trend: 'stable' }
];

const UI_LEVELS = [
  { id: 'game', name: 'Simple Play', description: 'Card-based decisions, guided gameplay', icon: '🎮' },
  { id: 'advanced', name: 'Detailed View', description: 'More options with financial tracking', icon: '📊' },
  { id: 'expert', name: 'Full Simulation', description: 'All metrics and advanced decisions', icon: '🚀' }
];

interface AIRecommendation {
  business: typeof BUSINESS_TYPES[0];
  score: number;
  reasons: string[];
  trend: string;
  demand: number;
}

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingFlow: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [selectedUI, setSelectedUI] = useState<'game' | 'advanced' | 'expert'>('game');
  const [capital, setCapital] = useState(100000);
  const [name, setName] = useState('');
  const [riskAppetite, setRiskAppetite] = useState<'low' | 'medium' | 'high'>('medium');
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [cityData, setCityData] = useState<typeof CITIES[0] | null>(null);

  useEffect(() => {
    if (step === 3 && selectedCity) {
      fetchAIRecommendations();
    }
  }, [step, selectedCity, capital]);

  const fetchAIRecommendations = async () => {
    setIsLoadingAI(true);
    const city = CITIES.find(c => c.id === selectedCity);
    setCityData(city || null);

    try {
      const response = await fetch('http://localhost:8000/unified/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            capital,
            risk_appetite: riskAppetite,
            experience: 'beginner',
            time_commitment: 'moderate',
            interests: []
          },
          city: {
            city: selectedCity,
            business_type: '',
            purchasing_power: city?.demand ? city.demand / 100 : 0.8,
            competition_level: city ? (100 - city.demand) / 100 : 0.5,
            seasonality: [1, 1.1, 1.2, 1.1, 1, 0.9, 0.8, 0.9, 1, 1.1, 1.2, 1.3]
          }
        })
      });
      
      const data = await response.json();
      
      const available = BUSINESS_TYPES.filter(b => b.capital <= capital);
      
      const recs: AIRecommendation[] = available.map(biz => {
        let score = 50;
        let reasons: string[] = [];
        
        if (city?.bestFor.includes(biz.id)) {
          score += 25;
          reasons.push(`Strong demand in ${city.name}`);
        }
        
        if (biz.trend === 'booming') {
          score += 15;
          reasons.push('Trending industry in 2026');
        } else if (biz.trend === 'growing') {
          score += 10;
          reasons.push('Growing sector');
        }
        
        if (riskAppetite === 'low' && biz.risk === 'low') {
          score += 10;
          reasons.push('Matches your risk profile');
        }
        
        if (biz.monthlyProfit / biz.capital > 0.3) {
          score += 5;
          reasons.push('High ROI potential');
        }
        
        const cityDemand = city?.demand || 70;
        const demand = Math.min(100, cityDemand + (biz.trend === 'booming' ? 10 : 0));
        
        return {
          business: biz,
          score,
          reasons: reasons.slice(0, 3),
          trend: biz.trend,
          demand
        };
      });
      
      recs.sort((a, b) => b.score - a.score);
      setAiRecommendations(recs.slice(0, 5));
      
    } catch (error) {
      const available = BUSINESS_TYPES.filter(b => b.capital <= capital);
      const fallback = available.slice(0, 5).map(biz => ({
        business: biz,
        score: 70,
        reasons: ['Available within your budget'],
        trend: biz.trend,
        demand: 70
      }));
      setAiRecommendations(fallback);
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
    const business = BUSINESS_TYPES.find(b => b.id === selectedBusiness);
    const profile: UserProfile = {
      id: Date.now().toString(),
      name: name || 'Player',
      city: selectedCity,
      capital: business?.capital || capital,
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

  const renderStep2_City = () => (
    <div style={styles.step}>
      <div style={styles.selectedCapital}>
        <span>💰 Capital: <strong>₹{capital.toLocaleString()}</strong></span>
      </div>

      <h2 style={styles.title}>🌆 Choose Your City</h2>
      <p style={styles.subtitle}>Where do you want to build your business?</p>
      
      <div style={styles.grid}>
        {CITIES.map(city => (
          <div
            key={city.id}
            onClick={() => setSelectedCity(city.id)}
            style={{
              ...styles.card,
              ...(selectedCity === city.id ? styles.cardSelected : {})
            }}
          >
            <span style={styles.cardIcon}>{city.icon}</span>
            <h3 style={styles.cardTitle}>{city.name}</h3>
            <p style={styles.cardDesc}>{city.description}</p>
            <div style={styles.cityMeta}>
              <span style={styles.demandBadge}>📈 {city.demand}% demand</span>
              <span style={styles.marketBadge}>{city.market}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        style={{ ...styles.primaryButton, opacity: selectedCity ? 1 : 0.5 }}
        disabled={!selectedCity}
        onClick={() => setStep(3)}
      >
        Get AI Recommendations →
      </button>
    </div>
  );

  const renderStep3_Recommendations = () => {
    const city = CITIES.find(c => c.id === selectedCity);
    
    return (
      <div style={styles.step}>
        <div style={styles.headerRow}>
          <div>
            <span style={styles.selectedLabel}>📍 {city?.name}</span>
            <span style={styles.selectedLabel}>💰 ₹{capital.toLocaleString()}</span>
          </div>
        </div>

        <h2 style={styles.title}>🤖 AI-Powered Recommendations</h2>
        <p style={styles.subtitle}>Based on your capital, city trends & market analysis</p>

        {isLoadingAI ? (
          <div style={styles.loadingBox}>
            <div style={styles.spinner}>⏳</div>
            <p>Analyzing market data...</p>
          </div>
        ) : (
          <div style={styles.recommendList}>
            {aiRecommendations.map((rec, idx) => (
              <div
                key={rec.business.id}
                onClick={() => setSelectedBusiness(rec.business.id)}
                style={{
                  ...styles.recCard,
                  ...(selectedBusiness === rec.business.id ? styles.recCardSelected : {}),
                  borderColor: selectedBusiness === rec.business.id ? '#22c55e' : undefined
                }}
              >
                <div style={styles.recHeader}>
                  <span style={styles.recIcon}>{rec.business.icon}</span>
                  <div style={styles.recTitle}>
                    <h3>{rec.business.name}</h3>
                    <span style={styles.recScore}>AI Score: {rec.score}%</span>
                  </div>
                  <span style={{
                    ...styles.trendBadge,
                    background: rec.trend === 'booming' ? '#ef4444' : rec.trend === 'growing' ? '#22c55e' : '#64748b'
                  }}>
                    {rec.trend}
                  </span>
                </div>
                
                <p style={styles.recDesc}>{rec.business.description}</p>
                
                <div style={styles.recMeta}>
                  <span>💰 ₹{rec.business.capital.toLocaleString()}</span>
                  <span>📈 ₹{rec.business.monthlyProfit.toLocaleString()}/mo</span>
                  <span>📊 {rec.demand}% demand</span>
                </div>

                <div style={styles.reasons}>
                  {rec.reasons.map((reason, i) => (
                    <span key={i} style={styles.reasonTag}>✓ {reason}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          style={{ ...styles.primaryButton, opacity: selectedBusiness ? 1 : 0.5 }}
          disabled={!selectedBusiness}
          onClick={() => setStep(4)}
        >
          Continue →
        </button>
      </div>
    );
  };

  const renderStep4_PlayStyle = () => (
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
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{...styles.progressDot, ...(step >= s ? styles.progressDotActive : {})}} />
        ))}
      </div>
      {step === 1 && renderStep1_Capital()}
      {step === 2 && renderStep2_City()}
      {step === 3 && renderStep3_Recommendations()}
      {step === 4 && renderStep4_PlayStyle()}
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
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24, maxHeight: 320, overflowY: 'auto' },
  card: { padding: 16, borderRadius: 12, border: '2px solid #334155', background: '#1e293b', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' },
  cardSelected: { borderColor: '#3b82f6', background: '#1e3a5f' },
  cardIcon: { fontSize: 28, display: 'block', marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: 600, marginBottom: 2, color: '#fff' },
  cardDesc: { fontSize: 11, color: '#94a3b8', marginBottom: 8 },
  cityMeta: { display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' },
  demandBadge: { fontSize: 10, color: '#22c55e' },
  marketBadge: { fontSize: 10, color: '#64748b', background: '#334155', padding: '2px 6px', borderRadius: 4 },
  
  headerRow: { display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16 },
  selectedLabel: { background: '#1e293b', padding: '6px 12px', borderRadius: 8, fontSize: 13 },
  
  loadingBox: { textAlign: 'center', padding: 40, background: '#1e293b', borderRadius: 16, marginBottom: 20 },
  spinner: { fontSize: 32, animation: 'spin 1s linear infinite' },
  
  recommendList: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, maxHeight: 350, overflowY: 'auto' },
  recCard: { padding: 16, borderRadius: 12, border: '2px solid #334155', background: '#1e293b', cursor: 'pointer', transition: 'all 0.2s' },
  recCardSelected: { borderColor: '#22c55e', background: '#1e3a5f' },
  recHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 },
  recIcon: { fontSize: 32 },
  recTitle: { flex: 1 },
  recScore: { fontSize: 12, color: '#22c55e', fontWeight: 600 },
  trendBadge: { padding: '4px 10px', borderRadius: 20, fontSize: 10, color: '#fff', textTransform: 'uppercase' },
  recDesc: { fontSize: 13, color: '#94a3b8', marginBottom: 8 },
  recMeta: { display: 'flex', gap: 12, fontSize: 12, color: '#64748b', marginBottom: 8 },
  reasons: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  reasonTag: { fontSize: 11, color: '#22c55e', background: '#22c55e22', padding: '3px 8px', borderRadius: 4 },
  
  verticalGrid: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 },
  largeCard: { padding: 20, borderRadius: 14, border: '2px solid #334155', background: '#1e293b', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 16 },
  
  primaryButton: { width: '100%', padding: 16, fontSize: 16, fontWeight: 700, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', cursor: 'pointer' }
};
