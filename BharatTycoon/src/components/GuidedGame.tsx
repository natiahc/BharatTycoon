import React, { useState, useEffect } from 'react';
import { UserProfile, GameState } from '../App';
import { getRandomCards, DecisionCard } from '../utils/decisionCards';
import { calculateImpact } from '../utils/decisionImpactMap';
import { getPhaseForMonth } from '../utils/startupJourneySimulator';

interface Props {
  user: UserProfile;
  gameState: GameState;
  setGameState: (state: GameState | null) => void;
}

export const GuidedGame: React.FC<Props> = ({ user, gameState, setGameState }) => {
  const [cards, setCards] = useState<DecisionCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<DecisionCard | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{ message: string; impact: any } | null>(null);

  const phase = getPhaseForMonth(gameState.month);

  useEffect(() => {
    const businessType = gameState.businessType || 'restaurant';
    const newCards = getRandomCards(businessType, gameState.cityTier, 6, phase, gameState.cash, gameState.month);
    setCards(newCards);
  }, [gameState.month]);

  const handleSelectCard = (card: DecisionCard) => {
    setSelectedCard(card);
  };

  const handleConfirm = () => {
    if (!selectedCard) return;

    const impact = calculateImpact(selectedCard.id, {
      month: gameState.month,
      phase,
      riskAppetite: user.riskAppetite,
      capital: user.capital
    });

    const baseRevenue = gameState.revenue || user.capital * 0.3;
    const newRevenue = Math.round(baseRevenue * (1 + impact.growth));
    const newCosts = Math.round(gameState.costs + impact.costs);
    const newCash = Math.max(0, gameState.cash + impact.cash + (newRevenue - newCosts) * 0.3);
    const newProfit = newRevenue - newCosts;

    setResult({
      message: impact.revenue > 0 ? `Great decision! Revenue up by ₹${impact.revenue.toLocaleString()}` :
              impact.cash < 0 ? `Investment made: ₹${Math.abs(impact.cash).toLocaleString()}` :
              'Decision applied successfully',
      impact
    });
    setShowResult(true);

    setTimeout(() => {
      setGameState({
        ...gameState,
        month: gameState.month + 1,
        cash: newCash,
        revenue: newRevenue,
        costs: newCosts,
        profit: newProfit,
        phase: getPhaseForMonth(gameState.month + 1)
      });
      setShowResult(false);
      setSelectedCard(null);
      setResult(null);
    }, 2000);
  };

  const handleSkip = () => {
    const baseGrowth = 0.05;
    const baseRevenue = gameState.revenue || user.capital * 0.3;
    const newRevenue = Math.round(baseRevenue * (1 + baseGrowth));
    const newCosts = Math.round(gameState.costs * 1.02);
    const newCash = Math.max(0, gameState.cash + (newRevenue - newCosts) * 0.3);

    setGameState({
      ...gameState,
      month: gameState.month + 1,
      cash: newCash,
      revenue: newRevenue,
      costs: newCosts,
      profit: newRevenue - newCosts,
      phase: getPhaseForMonth(gameState.month + 1)
    });
  };

  const generateBalanceSheet = () => {
    const totalAssets = gameState.cash + (gameState.revenue * 0.3);
    const totalLiabilities = gameState.costs * 0.2;
    const netWorth = totalAssets - totalLiabilities;
    
    return {
      assets: {
        current: { cash: gameState.cash, accountsReceivable: gameState.revenue * 0.1, inventory: gameState.costs * 0.15 },
        fixed: { equipment: gameState.costs * 0.5, furniture: gameState.costs * 0.2, depreciation: -gameState.costs * 0.1 }
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
Business: ${(gameState.businessType || 'business').toUpperCase()} | City: ${user.city} | Month: ${gameState.month}/18
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
────────────────
Final Cash:        ₹${gameState.cash.toLocaleString()}
Total Revenue:     ₹${(gameState.revenue * gameState.month).toLocaleString()}
Total Costs:      ₹${(gameState.costs * gameState.month).toLocaleString()}
Net Worth:        ₹${bs.totals.netWorth.toLocaleString()}

BharatTycoon - AI Business Simulation Game
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BalanceSheet_${gameState.businessType}_Month${gameState.month}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (gameState.cash < 5000) {
    const bs = generateBalanceSheet();
    return (
      <div style={styles.container}>
        <div style={styles.endScreen}>
          <h1>💸 Out of Cash!</h1>
          <p>Your business couldn't survive. You made it {gameState.month} months.</p>
          
          <div style={{background: '#1a1a2e', padding: '20px', borderRadius: '12px', margin: '20px auto', maxWidth: '500px', textAlign: 'left'}}>
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

  if (gameState.month > 18) {
    const bs = generateBalanceSheet();
    return (
      <div style={styles.container}>
        <div style={styles.endScreen}>
          <h1>🎉 18 Months Complete!</h1>
          <p>You built a successful business!</p>
          <p>Final Cash: ₹{gameState.cash.toLocaleString()}</p>
          
          <div style={{background: '#1a1a2e', padding: '20px', borderRadius: '12px', margin: '20px auto', maxWidth: '500px', textAlign: 'left'}}>
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
          <h1 style={styles.title}>🏆 Month {gameState.month} of 18</h1>
          <p style={styles.phase}>{phase.charAt(0).toUpperCase() + phase.slice(1)} Phase</p>
        </div>
      </header>

      <div style={styles.stats}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Cash</span>
          <span style={styles.statValue}>₹{gameState.cash.toLocaleString()}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Revenue</span>
          <span style={styles.statValue}>₹{gameState.revenue.toLocaleString()}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Costs</span>
          <span style={styles.statValue}>₹{gameState.costs.toLocaleString()}</span>
        </div>
        <div style={{...styles.statBox, background: gameState.profit >= 0 ? '#064e3b' : '#7f1d1d'}}>
          <span style={styles.statLabel}>Profit</span>
          <span style={styles.statValue}>₹{gameState.profit.toLocaleString()}</span>
        </div>
      </div>

      {showResult && result ? (
        <div style={styles.resultScreen}>
          <h2>{result.message}</h2>
          <div style={styles.resultDetails}>
            <p>Revenue: {result.impact.revenue > 0 ? '+' : ''}₹{result.impact.revenue.toLocaleString()}</p>
            <p>Costs: {result.impact.costs > 0 ? '+' : ''}₹{result.impact.costs.toLocaleString()}</p>
            <p>Cash: {result.impact.cash > 0 ? '+' : ''}₹{result.impact.cash.toLocaleString()}</p>
          </div>
        </div>
      ) : (
        <div style={styles.cardsContainer}>
          <h2 style={styles.sectionTitle}>Choose Your Action</h2>
          <div style={styles.cards}>
            {cards.map(card => (
              <div
                key={card.id}
                onClick={() => handleSelectCard(card)}
                style={{
                  ...styles.card,
                  ...(selectedCard?.id === card.id ? styles.cardSelected : {})
                }}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardCategory}>{card.category}</span>
                </div>
                <h3 style={styles.cardTitle}>{card.title}</h3>
                <p style={styles.cardDesc}>{card.description}</p>
                <div style={styles.cardCost}>
                  💰 Cost: ₹{card.cost.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.actions}>
            <button
              style={{...styles.confirmButton, opacity: selectedCard ? 1 : 0.5}}
              disabled={!selectedCard}
              onClick={handleConfirm}
            >
              Confirm Decision
            </button>
            <button style={styles.skipButton} onClick={handleSkip}>
              Skip Month →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', color: '#fff', padding: 20 },
  header: { textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 32, fontWeight: 700, margin: 0 },
  phase: { fontSize: 16, color: '#94a3b8', marginTop: 4 },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 },
  statBox: { background: '#1e293b', borderRadius: 12, padding: 16, textAlign: 'center' },
  statLabel: { display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 700 },
  cardsContainer: {},
  sectionTitle: { fontSize: 20, marginBottom: 16, textAlign: 'center' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
  card: { background: '#334155', borderRadius: 16, padding: 20, cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s' },
  cardSelected: { borderColor: '#3b82f6', background: '#1e3a5f' },
  cardHeader: { marginBottom: 8 },
  cardCategory: { background: '#475569', padding: '4px 10px', borderRadius: 20, fontSize: 11, textTransform: 'uppercase' },
  cardTitle: { fontSize: 18, marginBottom: 8 },
  cardDesc: { fontSize: 14, color: '#cbd5e1', marginBottom: 12 },
  cardCost: { fontSize: 13, color: '#94a3b8' },
  actions: { display: 'flex', gap: 12 },
  confirmButton: { flex: 2, padding: 16, background: '#22c55e', border: 'none', borderRadius: 12, color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer' },
  skipButton: { flex: 1, padding: 16, background: 'transparent', border: '1px solid #475569', borderRadius: 12, color: '#94a3b8', fontSize: 16, cursor: 'pointer' },
  resultScreen: { textAlign: 'center', padding: 60, animation: 'fadeIn 0.3s' },
  resultDetails: { marginTop: 24, fontSize: 18, color: '#94a3b8' },
  endScreen: { textAlign: 'center', padding: 60 },
  button: { padding: '16px 32px', background: '#3b82f6', border: 'none', borderRadius: 8, color: '#fff', fontSize: 18, cursor: 'pointer', marginTop: 20 }
};
