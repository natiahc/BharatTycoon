import React, { useState, useEffect } from 'react';
import { UserProfile, GameState } from '../App';
import { GameEngine } from '../utils/gameEngine';
import { getAvailableCards, DecisionCard } from '../utils/decisionCards';
import { generateDashboard, DashboardMetrics } from '../utils/businessIntelligenceDashboard';
import { getJourneyMetrics } from '../utils/startupJourneySimulator';

interface Props {
  user: UserProfile;
  gameState: GameState;
  setGameState: (state: GameState | null) => void;
}

export const GameplayLoop: React.FC<Props> = ({ user, gameState, setGameState }) => {
  const [engine] = useState(() => new GameEngine(user.uiLevel, user.capital));
  const [currentState, setCurrentState] = useState(engine.getState());
  const [availableCards, setAvailableCards] = useState<DecisionCard[]>([]);
  const [dashboard, setDashboard] = useState<DashboardMetrics | null>(null);
  const [showEvent, setShowEvent] = useState(false);
  const [eventMessage, setEventMessage] = useState('');

  useEffect(() => {
    const cards = getAvailableCards(currentState.phase, currentState.cash, currentState.month);
    setAvailableCards(cards.slice(0, 3));
    
    const dash = generateDashboard(
      { month: currentState.month, revenue: currentState.revenue, costs: currentState.costs, cash: currentState.cash, businessType: user.interests[0] || 'service' },
      { city: user.city, capital: user.capital, riskAppetite: user.riskAppetite }
    );
    setDashboard(dash);
  }, [currentState.month]);

  const handleDecision = (cardId: string) => {
    const result = engine.makeDecision(cardId, { city: user.city, businessType: user.interests[0] || 'service', riskAppetite: user.riskAppetite });
    setCurrentState(result.newState);
    
    if (result.impact.revenue > 0) {
      setEventMessage(`+₹${result.impact.revenue.toLocaleString()} revenue!`);
    } else if (result.impact.cash < 0) {
      setEventMessage(`-₹${Math.abs(result.impact.cash).toLocaleString()} cash used`);
    }
    setShowEvent(true);
    setTimeout(() => setShowEvent(false), 2000);
  };

  const handleNextMonth = () => {
    const result = engine.advanceMonth({ city: user.city, businessType: user.interests[0] || 'service' });
    setCurrentState(result.newState);
  };

  const journey = getJourneyMetrics(currentState.month);

  if (currentState.gameOver) {
    return (
      <div style={styles.container}>
        <div style={styles.gameOver}>
          <h1>Game Over 💸</h1>
          <p>Your business ran out of cash after {currentState.month} months.</p>
          <button style={styles.button} onClick={() => setGameState(null)}>Try Again</button>
        </div>
      </div>
    );
  }

  if (currentState.victory) {
    return (
      <div style={styles.container}>
        <div style={styles.victory}>
          <h1>🎉 Victory!</h1>
          <p>You successfully built a business for 18 months!</p>
          <p>Final Cash: ₹{currentState.cash.toLocaleString()}</p>
          <button style={styles.button} onClick={() => setGameState(null)}>Play Again</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>BharatTycoon</h1>
          <p style={styles.subtitle}>{user.city} • {user.interests[0] || 'Business'}</p>
        </div>
        <div style={styles.stats}>
          <div style={styles.stat}><span>Month</span><strong>{currentState.month}/18</strong></div>
          <div style={styles.stat}><span>Cash</span><strong>₹{currentState.cash.toLocaleString()}</strong></div>
          <div style={styles.stat}><span>Revenue</span><strong>₹{currentState.revenue.toLocaleString()}</strong></div>
          <div style={styles.stat}><span>Costs</span><strong>₹{currentState.costs.toLocaleString()}</strong></div>
        </div>
      </header>

      <div style={styles.phaseBar}>
        <div style={styles.phaseInfo}>
          <span style={styles.phaseLabel}>Current Phase:</span>
          <strong>{journey.phase.charAt(0).toUpperCase() + journey.phase.slice(1)}</strong>
        </div>
        <div style={styles.progressBar}>
          <div style={{...styles.progressFill, width: `${journey.progress}%`}} />
        </div>
        <div style={styles.focus}>
          {journey.recommendedFocus.slice(0, 2).map(f => (
            <span key={f} style={styles.focusTag}>{f}</span>
          ))}
        </div>
      </div>

      {showEvent && (
        <div style={styles.eventToast}>
          {eventMessage}
        </div>
      )}

      <div style={styles.main}>
        <div style={styles.cardsSection}>
          <h2 style={styles.sectionTitle}>Make a Decision</h2>
          <div style={styles.cards}>
            {availableCards.map(card => (
              <div key={card.id} style={styles.card}>
                <h3 style={styles.cardTitle}>{card.title}</h3>
                <p style={styles.cardDesc}>{card.description}</p>
                <div style={styles.cardImpact}>
                  <span>💰 {card.impact.revenue}</span>
                  <span>📉 {card.impact.costs}</span>
                  <span>⚡ {card.impact.timeline}</span>
                </div>
                <button style={styles.cardButton} onClick={() => handleDecision(card.id)}>
                  Take Action
                </button>
              </div>
            ))}
          </div>
          <button style={styles.skipButton} onClick={handleNextMonth}>
            Skip to Next Month →
          </button>
        </div>

        {dashboard && (
          <div style={styles.dashboard}>
            <h2 style={styles.sectionTitle}>Business Intelligence</h2>
            <div style={styles.dashGrid}>
              <div style={styles.dashCard}>
                <h4>Profit Margin</h4>
                <p style={styles.dashValue}>{dashboard.financial.profitMargin}%</p>
              </div>
              <div style={styles.dashCard}>
                <h4>Cash Runway</h4>
                <p style={styles.dashValue}>{dashboard.financial.cashRunway} months</p>
              </div>
              <div style={styles.dashCard}>
                <h4>Demand Trend</h4>
                <p style={styles.dashValue}>{dashboard.market.demandTrend}</p>
              </div>
              <div style={styles.dashCard}>
                <h4>Risk Level</h4>
                <p style={{...styles.dashValue, color: dashboard.risk.level === 'low' ? '#22c55e' : dashboard.risk.level === 'high' ? '#ef4444' : '#f59e0b'}}>
                  {dashboard.risk.level.toUpperCase()}
                </p>
              </div>
            </div>
            
            {dashboard.recommendations.warnings.length > 0 && (
              <div style={styles.warnings}>
                {dashboard.recommendations.warnings.map((w, i) => (
                  <div key={i} style={styles.warning}>⚠️ {w}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', background: '#0f172a', color: '#fff', padding: 20 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 700, margin: 0 },
  subtitle: { fontSize: 14, color: '#94a3b8', margin: 0 },
  stats: { display: 'flex', gap: 24 },
  stat: { textAlign: 'center' },
  phaseBar: { background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 24 },
  phaseInfo: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 },
  phaseLabel: { color: '#94a3b8', fontSize: 14 },
  progressBar: { height: 8, background: '#334155', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', background: '#3b82f6', transition: 'width 0.3s' },
  focus: { display: 'flex', gap: 8 },
  focusTag: { background: '#334155', padding: '4px 10px', borderRadius: 20, fontSize: 12 },
  eventToast: { position: 'fixed', top: 100, left: '50%', transform: 'translateX(-50%)', background: '#22c55e', color: '#fff', padding: '12px 24px', borderRadius: 8, fontWeight: 600, animation: 'fadeIn 0.2s' },
  main: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 },
  cardsSection: {},
  sectionTitle: { fontSize: 20, marginBottom: 16 },
  cards: { display: 'flex', flexDirection: 'column', gap: 16 },
  card: { background: '#1e293b', borderRadius: 16, padding: 20, border: '1px solid #334155' },
  cardTitle: { fontSize: 18, margin: '0 0 8px' },
  cardDesc: { fontSize: 14, color: '#94a3b8', marginBottom: 12 },
  cardImpact: { display: 'flex', gap: 16, fontSize: 13, color: '#64748b', marginBottom: 16 },
  cardButton: { width: '100%', padding: 12, background: '#3b82f6', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' },
  skipButton: { marginTop: 16, padding: 14, background: 'transparent', border: '1px solid #475569', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', width: '100%' },
  dashboard: {},
  dashGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 },
  dashCard: { background: '#1e293b', borderRadius: 12, padding: 16, textAlign: 'center' },
  dashValue: { fontSize: 24, fontWeight: 700, margin: '8px 0 0' },
  warnings: { marginTop: 16 },
  warning: { background: '#451a03', border: '1px solid #f59e0b', borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 13 },
  gameOver: { textAlign: 'center', padding: 60 },
  victory: { textAlign: 'center', padding: 60 },
  button: { padding: '16px 32px', background: '#3b82f6', border: 'none', borderRadius: 8, color: '#fff', fontSize: 18, cursor: 'pointer', marginTop: 20 }
};
