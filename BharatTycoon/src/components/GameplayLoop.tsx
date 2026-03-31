import React, { useState, useEffect } from 'react';
import { UserProfile, GameState } from '../App';
import { GameEngine } from '../utils/gameEngine';
import { getBusinessCards, DecisionCard } from '../utils/decisionCards';
import { generateDashboard, DashboardMetrics } from '../utils/businessIntelligenceDashboard';
import { getJourneyMetrics } from '../utils/startupJourneySimulator';
import api from '../utils/api';

interface Props {
  user: UserProfile;
  gameState: GameState;
  setGameState: (state: GameState | null) => void;
}

export const GameplayLoop: React.FC<Props> = ({ user, gameState, setGameState }) => {
  const businessType = user.interests[0]?.toLowerCase() || 'restaurant';
  const cityTier = gameState?.cityTier || 1;
  
  const [engine] = useState(() => new GameEngine(user.uiLevel, user.capital));
  const [currentState, setCurrentState] = useState(engine.getState());
  const [availableCards, setAvailableCards] = useState<DecisionCard[]>([]);
  const [dashboard, setDashboard] = useState<DashboardMetrics | null>(null);
  const [showEvent, setShowEvent] = useState(false);
  const [eventMessage, setEventMessage] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  useEffect(() => {
    const cards = getBusinessCards(businessType, cityTier, currentState.phase, currentState.cash, currentState.month);
    const shuffled = cards.sort(() => Math.random() - 0.5);
    setAvailableCards(shuffled.slice(0, 6));
    
    const dash = generateDashboard(
      { month: currentState.month, revenue: currentState.revenue, costs: currentState.costs, cash: currentState.cash, businessType },
      { city: user.city, capital: user.capital, riskAppetite: user.riskAppetite }
    );
    setDashboard(dash);
    
    // Get AI recommendation
    fetchAiRecommendation(cards, currentState);
  }, [currentState.month, businessType, cityTier]);

  const fetchAiRecommendation = async (cards: DecisionCard[], state: typeof currentState) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const prompt = `I'm running a ${businessType} business in a Tier ${cityTier} city with ₹${state.cash.toLocaleString()} cash, making ₹${state.revenue.toLocaleString()}/month revenue. Given these options: ${cards.map(c => c.title).join(', ')}. Which should I prioritize for maximum growth?`;
      const response = await api.ml.textGeneration(prompt);
      clearTimeout(timeoutId);
      
      if (response?.generated_text) {
        setAiRecommendation(response.generated_text.slice(0, 150) + '...');
      }
    } catch {
      setAiRecommendation(null);
    }
  };

  const handleDecision = (card: DecisionCard) => {
    // Check if can afford
    if (currentState.cash < card.cost) {
      setEventMessage(`Not enough cash! Need ₹${card.cost.toLocaleString()}`);
      setShowEvent(true);
      setTimeout(() => setShowEvent(false), 2000);
      return;
    }
    
    const result = engine.makeDecision(card.id, { city: user.city, businessType, riskAppetite: user.riskAppetite });
    setCurrentState(result.newState);
    
    if (card.cost > 0) {
      setEventMessage(`Invested ₹${card.cost.toLocaleString()} in ${card.title}`);
    } else if (card.monthlyCost > 0) {
      setEventMessage(`Hired ${card.title} - ₹${card.monthlyCost.toLocaleString()}/month`);
    } else {
      setEventMessage(`Started ${card.title}`);
    }
    setShowEvent(true);
    setTimeout(() => setShowEvent(false), 2000);
  };

  const handleNextMonth = () => {
    const result = engine.advanceMonth({ city: user.city, businessType: user.interests[0] || 'service' });
    setCurrentState(result.newState);
  };

  const journey = getJourneyMetrics(currentState.month);

  const generateBalanceSheet = () => {
    const totalAssets = currentState.cash + (currentState.revenue * 0.3);
    const totalLiabilities = currentState.costs * 0.2;
    const netWorth = totalAssets - totalLiabilities;
    
    return {
      assets: {
        current: { cash: currentState.cash, accountsReceivable: currentState.revenue * 0.1, inventory: currentState.costs * 0.15 },
        fixed: { equipment: currentState.costs * 0.5, furniture: currentState.costs * 0.2, depreciation: -currentState.costs * 0.1 }
      },
      liabilities: { current: { payables: totalLiabilities * 0.6, taxes: totalLiabilities * 0.3, salaries: totalLiabilities * 0.1 }, longTerm: { loans: 0 } },
      equity: { ownerCapital: user.capital, retainedEarnings: netWorth - user.capital },
      totals: { totalAssets, totalLiabilities, netWorth }
    };
  };

  const downloadPDF = () => {
    const bs = generateBalanceSheet();
    const content = `
BALANCE SHEET - ${user.name}
Business: ${businessType.toUpperCase()} | City: ${user.city} | Month: ${currentState.month}/18
Generated: ${new Date().toLocaleDateString()}

═══════════════════════════════════════════════════════════════
ASSETS
═══════════════════════════════════════════════════════════════
Current Assets:
  Cash                          ₹${bs.assets.current.cash.toLocaleString()}
  Accounts Receivable            ₹${Math.round(bs.assets.current.accountsReceivable).toLocaleString()}
  Inventory                     ₹${Math.round(bs.assets.current.inventory).toLocaleString()}
  ─────────────────────────────────────────────────────────
  Total Current Assets           ₹${Math.round(bs.assets.current.cash + bs.assets.current.accountsReceivable + bs.assets.current.inventory).toLocaleString()}

Fixed Assets:
  Equipment                     ₹${Math.round(bs.assets.fixed.equipment).toLocaleString()}
  Furniture                     ₹${Math.round(bs.assets.fixed.furniture).toLocaleString()}
  Less: Depreciation            ₹${Math.round(bs.assets.fixed.depreciation).toLocaleString()}
  ─────────────────────────────────────────────────────────
  Total Fixed Assets            ₹${Math.round(bs.assets.fixed.equipment + bs.assets.fixed.furniture + bs.assets.fixed.depreciation).toLocaleString()}

═══════════════════════════════════════════════════════════════
TOTAL ASSETS                   ₹${bs.totals.totalAssets.toLocaleString()}
═══════════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════════
LIABILITIES
═══════════════════════════════════════════════════════════════
Current Liabilities:
  Accounts Payable              ₹${Math.round(bs.liabilities.current.payables).toLocaleString()}
  Taxes Payable                 ₹${Math.round(bs.liabilities.current.taxes).toLocaleString()}
  Salaries Payable              ₹${Math.round(bs.liabilities.current.salaries).toLocaleString()}
  ─────────────────────────────────────────────────────────
  Total Current Liabilities     ₹${Math.round(bs.totals.totalLiabilities).toLocaleString()}

Long-term Liabilities:
  Loans Payable                ₹${bs.liabilities.longTerm.loans.toLocaleString()}
  ─────────────────────────────────────────────────────────

═══════════════════════════════════════════════════════════════
TOTAL LIABILITIES              ₹${bs.totals.totalLiabilities.toLocaleString()}
═══════════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════════
EQUITY
═══════════════════════════════════════════════════════════════
Owner's Capital                ₹${bs.equity.ownerCapital.toLocaleString()}
Retained Earnings              ₹${Math.round(bs.equity.retainedEarnings).toLocaleString()}
  ─────────────────────────────────────────────────────────
TOTAL EQUITY                   ₹${Math.round(bs.equity.ownerCapital + bs.equity.retainedEarnings).toLocaleString()}

═══════════════════════════════════════════════════════════════
TOTAL LIABILITIES + EQUITY    ₹${(bs.totals.totalLiabilities + bs.equity.ownerCapital + bs.equity.retainedEarnings).toLocaleString()}
═══════════════════════════════════════════════════════════════

FINANCIAL SUMMARY
─────────────────
Final Cash:        ₹${currentState.cash.toLocaleString()}
Total Revenue:     ₹${(currentState.revenue * currentState.month).toLocaleString()}
Total Costs:      ₹${(currentState.costs * currentState.month).toLocaleString()}
Net Worth:        ₹${bs.totals.netWorth.toLocaleString()}

BharatTycoon - AI Business Simulation Game
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BalanceSheet_${businessType}_Month${currentState.month}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (currentState.gameOver) {
    const bs = generateBalanceSheet();
    return (
      <div style={styles.container}>
        <div style={styles.gameOver}>
          <h1>Game Over 💸</h1>
          <p>Your business ran out of cash after {currentState.month} months.</p>
          
          <div style={{background: '#1a1a2e', padding: '20px', borderRadius: '12px', margin: '20px 0', textAlign: 'left'}}>
            <h3 style={{color: '#fff', marginBottom: '15px'}}>📊 Final Balance Sheet</h3>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', color: '#aaa', fontSize: '14px'}}>
              <div><strong style={{color: '#22c55e'}}>Total Assets</strong><br/>₹{bs.totals.totalAssets.toLocaleString()}</div>
              <div><strong style={{color: '#ef4444'}}>Total Liabilities</strong><br/>₹{bs.totals.totalLiabilities.toLocaleString()}</div>
              <div><strong style={{color: '#60a5fa'}}>Owner's Capital</strong><br/>₹{bs.equity.ownerCapital.toLocaleString()}</div>
              <div><strong style={{color: '#fbbf24'}}>Net Worth</strong><br/>₹{bs.totals.netWorth.toLocaleString()}</div>
            </div>
          </div>
          
          <button style={{...styles.button, background: '#22c55e', marginRight: '10px'}} onClick={downloadPDF}>
            📄 Download Balance Sheet
          </button>
          <button style={styles.button} onClick={() => setGameState(null)}>Try Again</button>
        </div>
      </div>
    );
  }

  if (currentState.victory) {
    const bs = generateBalanceSheet();
    return (
      <div style={styles.container}>
        <div style={styles.victory}>
          <h1>🎉 Victory!</h1>
          <p>You successfully built a business for 18 months!</p>
          <p>Final Cash: ₹{currentState.cash.toLocaleString()}</p>
          
          <div style={{background: '#1a1a2e', padding: '20px', borderRadius: '12px', margin: '20px 0', textAlign: 'left'}}>
            <h3 style={{color: '#fff', marginBottom: '15px'}}>📊 Final Balance Sheet</h3>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', color: '#aaa', fontSize: '14px'}}>
              <div><strong style={{color: '#22c55e'}}>Total Assets</strong><br/>₹{bs.totals.totalAssets.toLocaleString()}</div>
              <div><strong style={{color: '#ef4444'}}>Total Liabilities</strong><br/>₹{bs.totals.totalLiabilities.toLocaleString()}</div>
              <div><strong style={{color: '#60a5fa'}}>Owner's Capital</strong><br/>₹{bs.equity.ownerCapital.toLocaleString()}</div>
              <div><strong style={{color: '#fbbf24'}}>Net Worth</strong><br/>₹{bs.totals.netWorth.toLocaleString()}</div>
            </div>
          </div>
          
          <button style={{...styles.button, background: '#22c55e', marginRight: '10px'}} onClick={downloadPDF}>
            📄 Download Balance Sheet
          </button>
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
          <h2 style={styles.sectionTitle}>Make a Decision - {businessType.charAt(0).toUpperCase() + businessType.slice(1)}</h2>
          
          {aiRecommendation && (
            <div style={{background: '#e0f2fe', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px'}}>
              <strong>🤖 AI Advisor:</strong> {aiRecommendation}
            </div>
          )}
          
          <div style={styles.cards}>
            {availableCards.map(card => (
              <div key={card.id} style={styles.card}>
                <span style={{fontSize: '11px', color: '#666', textTransform: 'uppercase'}}>{card.category}</span>
                <h3 style={styles.cardTitle}>{card.title}</h3>
                <p style={styles.cardDesc}>{card.description}</p>
                <div style={styles.cardImpact}>
                  <span style={{color: '#22c55e'}}>📈 {card.impact.revenue}</span>
                  <span style={{color: card.cost > 0 ? '#ef4444' : '#666'}}>
                    {card.cost > 0 ? `💸 ₹${card.cost.toLocaleString()}` : card.monthlyCost > 0 ? `📅 ₹${card.monthlyCost.toLocaleString()}/mo` : '✅ Free'}
                  </span>
                </div>
                <button 
                  style={{...styles.cardButton, opacity: currentState.cash < card.cost ? 0.5 : 1}} 
                  onClick={() => handleDecision(card)}
                  disabled={currentState.cash < card.cost}
                >
                  {currentState.cash < card.cost ? 'Need More Cash' : 'Take Action'}
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
