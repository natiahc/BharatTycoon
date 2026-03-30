import React, { useState, useEffect, useCallback } from 'react';
import { api, BusinessAction, BusinessAnalysis } from '../utils/api';

interface BusinessSimulationProps {
  businessType: string;
  cityTier: number;
  capital: number;
}

interface InternalState {
  cash: number;
  assets: Record<string, number>;
  inventory: number;
  monthly_staff_cost: number;
  monthly_expenses: number;
  retained_earnings: number;
  owner_equity: number;
  active_actions: string[];
}

const DEFAULT_STATE: InternalState = {
  cash: 0,
  assets: {},
  inventory: 0,
  monthly_staff_cost: 0,
  monthly_expenses: 0,
  retained_earnings: 0,
  owner_equity: 0,
  active_actions: []
};

export const BusinessSimulation: React.FC<BusinessSimulationProps> = ({ 
  businessType, 
  cityTier, 
  capital 
}) => {
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<BusinessAction[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [internalState, setInternalState] = useState<InternalState>(DEFAULT_STATE);
  const [balanceSheet, setBalanceSheet] = useState<any>(null);
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'actions' | 'balance' | 'analysis' | 'forecast'>('actions');
  const [executing, setExecuting] = useState<string | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState<Record<string, number>>({});

  useEffect(() => {
    loadBusinessActions();
  }, [businessType, cityTier]);

  useEffect(() => {
    setInternalState(prev => ({
      ...prev,
      cash: capital,
      owner_equity: capital
    }));
  }, [capital]);

  useEffect(() => {
    if (internalState.cash > 0) {
      loadBalanceSheet();
    }
  }, [internalState]);

  const loadBusinessActions = async () => {
    setLoading(true);
    try {
      const result = await api.business.getActions(businessType, cityTier, capital);
      setActions(result.actions || []);
    } catch (err) {
      console.error('Failed to load business actions:', err);
      setActions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadBalanceSheet = useCallback(async () => {
    try {
      const state = {
        cash: internalState.cash,
        assets: internalState.assets,
        inventory: internalState.inventory,
        owner_equity: internalState.owner_equity,
        retained_earnings: internalState.retained_earnings,
        loans: 0,
        payables: internalState.monthly_expenses * 0.5
      };
      const result = await api.business.getBalanceSheet(state);
      setBalanceSheet(result.balance_sheet);
    } catch (err) {
      console.error('Failed to load balance sheet:', err);
    }
  }, [internalState]);

  const analyzeBusiness = async () => {
    try {
      const result = await api.business.analyze(
        businessType,
        cityTier,
        { ...internalState, total_assets: internalState.cash + internalState.inventory + Object.values(internalState.assets).reduce((a, b) => a + b, 0) },
        calculateMonthlyRevenue(),
        calculateMonthlyExpenses()
      );
      setAnalysis(result);
    } catch (err) {
      console.error('Failed to analyze business:', err);
    }
  };

  const forecastBusiness = async () => {
    try {
      const result = await api.business.forecast(
        businessType,
        cityTier,
        calculateMonthlyRevenue(),
        calculateMonthlyExpenses(),
        internalState.active_actions
      );
      setForecast(result);
    } catch (err) {
      console.error('Failed to forecast:', err);
    }
  };

  const handleExecuteAction = async (action: BusinessAction, quantity: number = 1) => {
    if (executing) return;
    setExecuting(action.id);

    try {
      const result = await api.business.executeAction(
        businessType,
        cityTier,
        capital,
        action.id,
        internalState
      );

      if (result.balance_sheet) {
        setInternalState(result.internal_state);
      }
    } catch (err) {
      console.error('Failed to execute action:', err);
      alert('Failed to execute action. Check if you have enough cash.');
    } finally {
      setExecuting(null);
    }
  };

  const handleNextMonth = async () => {
    const monthlyRevenue = calculateMonthlyRevenue();
    const monthlyExpenses = calculateMonthlyExpenses();
    const netProfit = monthlyRevenue - monthlyExpenses;

    setInternalState(prev => ({
      ...prev,
      cash: prev.cash + netProfit,
      retained_earnings: prev.retained_earnings + netProfit
    }));
  };

  const calculateMonthlyRevenue = () => {
    const baseRevenue = {
      restaurant: 120000,
      retail: 150000,
      tech: 200000,
      salon: 80000,
      tuition: 60000,
      manufacturing: 250000
    }[businessType] || 100000;

    const tierMultiplier = cityTier === 1 ? 1.5 : cityTier === 2 ? 1.2 : 1.0;
    const actionBonus = 1 + (internalState.active_actions.length * 0.08);

    return Math.round(baseRevenue * tierMultiplier * actionBonus);
  };

  const calculateMonthlyExpenses = () => {
    return internalState.monthly_staff_cost + internalState.monthly_expenses;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const categories = ['all', 'asset', 'inventory', 'staff', 'marketing', 'upgrade', 'service', 'compliance'];
  const filteredActions = activeCategory === 'all' 
    ? actions 
    : actions.filter(a => a.category === activeCategory);

  const monthlyRevenue = calculateMonthlyRevenue();
  const monthlyExpenses = calculateMonthlyExpenses();
  const netProfit = monthlyRevenue - monthlyExpenses;
  const netWorth = internalState.cash + internalState.inventory + Object.values(internalState.assets).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div className="business-simulation loading">
        <div className="loader">Loading business actions...</div>
      </div>
    );
  }

  return (
    <div className="business-simulation">
      <div className="sim-header">
        <h2>Business Simulation</h2>
        <div className="sim-stats">
          <span className="month-label">Capital: {formatCurrency(capital)}</span>
          <span className="cash-badge">Cash: {formatCurrency(internalState.cash)}</span>
        </div>
      </div>

      <div className="sim-stats-row">
        <div className="stat-card revenue">
          <span className="stat-label">Monthly Revenue</span>
          <span className="stat-value">{formatCurrency(monthlyRevenue)}</span>
        </div>
        <div className="stat-card expenses">
          <span className="stat-label">Monthly Expenses</span>
          <span className="stat-value">{formatCurrency(monthlyExpenses)}</span>
        </div>
        <div className="stat-card profit">
          <span className="stat-label">Net Profit</span>
          <span className="stat-value">{formatCurrency(netProfit)}</span>
        </div>
        <div className="stat-card networth">
          <span className="stat-label">Net Worth</span>
          <span className="stat-value">{formatCurrency(netWorth)}</span>
        </div>
      </div>

      <div className="sim-tabs">
        <button className={activeTab === 'actions' ? 'active' : ''} onClick={() => setActiveTab('actions')}>
          Actions ({actions.length})
        </button>
        <button className={activeTab === 'balance' ? 'active' : ''} onClick={() => setActiveTab('balance')}>
          Balance Sheet
        </button>
        <button className={activeTab === 'analysis' ? 'active' : ''} onClick={() => { setActiveTab('analysis'); analyzeBusiness(); }}>
          AI Analysis
        </button>
        <button className={activeTab === 'forecast' ? 'active' : ''} onClick={() => { setActiveTab('forecast'); forecastBusiness(); }}>
          Forecast
        </button>
      </div>

      {activeTab === 'actions' && (
        <>
          <div className="category-tabs">
            {categories.map(cat => (
              <button 
                key={cat}
                className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                {cat !== 'all' && (
                  <span className="count">
                    {actions.filter(a => a.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="actions-grid">
            {filteredActions.map(action => {
              const isActive = internalState.active_actions.includes(action.id);
              const canAfford = internalState.cash >= action.baseCost;
              const quantity = purchaseQuantity[action.id] || 1;
              const totalCost = action.baseCost * quantity;

              return (
                <div 
                  key={action.id} 
                  className={`action-card ${isActive ? 'active' : ''} ${!canAfford ? 'disabled' : ''}`}
                >
                  <div className="action-header">
                    <h4>{action.name}</h4>
                    <span className={`category-badge ${action.category}`}>{action.category}</span>
                  </div>
                  <p className="action-desc">{action.description}</p>
                  
                  <div className="action-details">
                    <div className="cost-row">
                      <span>One-time:</span>
                      <span className="cost">{formatCurrency(action.baseCost)}</span>
                    </div>
                    {action.monthlyCost > 0 && (
                      <div className="cost-row monthly">
                        <span>Monthly:</span>
                        <span>+{formatCurrency(action.monthlyCost)}</span>
                      </div>
                    )}
                    <div className="effect-row">
                      <span>Effect:</span>
                      <span className="effect">+{action.effect.value}% {action.effect.type.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  {!action.isRecurring && action.baseCost > 5000 && (
                    <div className="quantity-input">
                      <label>Quantity:</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={quantity}
                        onChange={(e) => setPurchaseQuantity({ ...purchaseQuantity, [action.id]: parseInt(e.target.value) || 1 })}
                      />
                      <span className="total-cost">Total: {formatCurrency(totalCost)}</span>
                    </div>
                  )}

                  <div className="action-buttons">
                    {isActive ? (
                      <span className="active-badge">Active</span>
                    ) : action.isRecurring ? (
                      <button 
                        className="action-btn subscribe"
                        onClick={() => handleExecuteAction(action)}
                        disabled={!canAfford || executing === action.id}
                      >
                        {executing === action.id ? 'Subscribing...' : 'Subscribe'}
                      </button>
                    ) : (
                      <button 
                        className="action-btn purchase"
                        onClick={() => handleExecuteAction(action, quantity)}
                        disabled={!canAfford || executing === action.id}
                      >
                        {executing === action.id ? 'Purchasing...' : 'Purchase'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button className="next-month-btn" onClick={handleNextMonth}>
            End Month → Start Next Month
          </button>
        </>
      )}

      {activeTab === 'balance' && balanceSheet && (
        <div className="balance-sheet-view">
          <div className="bs-section">
            <h3>Assets</h3>
            <h4>Current Assets</h4>
            <div className="bs-row"><span>Cash</span><span>{formatCurrency(balanceSheet.assets.current_assets.cash)}</span></div>
            <div className="bs-row"><span>Accounts Receivable</span><span>{formatCurrency(balanceSheet.assets.current_assets.accounts_receivable)}</span></div>
            <div className="bs-row"><span>Inventory</span><span>{formatCurrency(balanceSheet.assets.current_assets.inventory)}</span></div>
            <div className="bs-row"><span>Prepaid Expenses</span><span>{formatCurrency(balanceSheet.assets.current_assets.prepaid_expenses)}</span></div>
            <div className="bs-row total"><span>Total Current Assets</span><span>{formatCurrency(balanceSheet.assets.current_assets.total_current_assets)}</span></div>
            
            <h4>Fixed Assets</h4>
            <div className="bs-row"><span>Equipment</span><span>{formatCurrency(balanceSheet.assets.fixed_assets.equipment)}</span></div>
            <div className="bs-row"><span>Furniture</span><span>{formatCurrency(balanceSheet.assets.fixed_assets.furniture)}</span></div>
            <div className="bs-row"><span>Less: Depreciation</span><span>-{formatCurrency(balanceSheet.assets.fixed_assets.less_depreciation)}</span></div>
            <div className="bs-row total"><span>Net Fixed Assets</span><span>{formatCurrency(balanceSheet.assets.fixed_assets.net_fixed_assets)}</span></div>
            
            <div className="bs-row grand-total"><span>Total Assets</span><span>{formatCurrency(balanceSheet.assets.total_assets)}</span></div>
          </div>

          <div className="bs-section">
            <h3>Liabilities</h3>
            <h4>Current Liabilities</h4>
            <div className="bs-row"><span>Accounts Payable</span><span>{formatCurrency(balanceSheet.liabilities.current_liabilities.accounts_payable)}</span></div>
            <div className="bs-row"><span>Taxes Payable</span><span>{formatCurrency(balanceSheet.liabilities.current_liabilities.taxes_payable)}</span></div>
            <div className="bs-row"><span>Salaries Payable</span><span>{formatCurrency(balanceSheet.liabilities.current_liabilities.salaries_payable)}</span></div>
            <div className="bs-row total"><span>Total Current Liabilities</span><span>{formatCurrency(balanceSheet.liabilities.current_liabilities.total_current_liabilities)}</span></div>
            
            <h4>Long-Term Liabilities</h4>
            <div className="bs-row"><span>Loans Payable</span><span>{formatCurrency(balanceSheet.liabilities.long_term_liabilities.loans_payable)}</span></div>
            <div className="bs-row total"><span>Total Liabilities</span><span>{formatCurrency(balanceSheet.liabilities.total_liabilities)}</span></div>
            
            <h3>Equity</h3>
            <div className="bs-row"><span>Owner Equity</span><span>{formatCurrency(balanceSheet.equity.owner_equity)}</span></div>
            <div className="bs-row"><span>Retained Earnings</span><span>{formatCurrency(balanceSheet.equity.retained_earnings)}</span></div>
            <div className="bs-row total"><span>Total Equity</span><span>{formatCurrency(balanceSheet.equity.total_equity)}</span></div>
            
            <div className="bs-row grand-total"><span>Total Liabilities + Equity</span><span>{formatCurrency(balanceSheet.accounting_check.total_liabilities_plus_equity)}</span></div>
          </div>
        </div>
      )}

      {activeTab === 'analysis' && analysis && (
        <div className="analysis-view">
          <div className="health-score-card">
            <div className="score-circle" style={{ 
              background: `conic-gradient(${analysis.health_score > 70 ? '#2ecc71' : analysis.health_score > 50 ? '#f39c12' : '#e74c3c'} ${analysis.health_score}%, #eee ${analysis.health_score}%)`
            }}>
              <span className="score-value">{analysis.health_score}</span>
            </div>
            <span className={`health-status ${analysis.health_status.toLowerCase()}`}>{analysis.health_status}</span>
          </div>

          <div className="metrics-grid">
            <div className="metric-box">
              <span className="label">ROI</span>
              <span className="value">{analysis.metrics.roi.toFixed(1)}%</span>
            </div>
            <div className="metric-box">
              <span className="label">Profit Margin</span>
              <span className="value">{analysis.metrics.profit_margin.toFixed(1)}%</span>
            </div>
            <div className="metric-box">
              <span className="label">Current Ratio</span>
              <span className="value">{analysis.metrics.current_ratio.toFixed(2)}</span>
            </div>
            <div className="metric-box">
              <span className="label">Net Worth</span>
              <span className="value">{formatCurrency(analysis.metrics.net_worth)}</span>
            </div>
          </div>

          <div className="sentiment-box">
            <h4>Market Sentiment</h4>
            <span className={`sentiment ${analysis.market_sentiment}`}>{analysis.market_sentiment}</span>
          </div>

          <div className="recommendations-box">
            <h4>AI Recommendations</h4>
            <ul>
              {analysis.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>

          <div className="ai-insight-box">
            <h4>AI Insight</h4>
            <p>{analysis.ai_insight}</p>
          </div>
        </div>
      )}

      {activeTab === 'forecast' && forecast && (
        <div className="forecast-view">
          <div className="forecast-assumptions">
            <h4>Growth Assumptions</h4>
            <p>Base Growth: {forecast.growth_assumptions.base_growth}</p>
            <p>Tier Multiplier: {forecast.growth_assumptions.tier_multiplier}x</p>
            <p>Action Bonus: {forecast.growth_assumptions.action_bonus}</p>
          </div>

          <div className="forecast-table">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue</th>
                  <th>Expenses</th>
                  <th>Profit</th>
                  <th>Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {forecast.forecast.map((m: any) => (
                  <tr key={m.month}>
                    <td>Month {m.month}</td>
                    <td>{formatCurrency(m.revenue)}</td>
                    <td>{formatCurrency(m.expenses)}</td>
                    <td className={m.profit > 0 ? 'positive' : 'negative'}>{formatCurrency(m.profit)}</td>
                    <td className={m.cumulative_profit > 0 ? 'positive' : 'negative'}>{formatCurrency(m.cumulative_profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="forecast-summary">
            <h4>6-Month Summary</h4>
            <div className="summary-row"><span>Total Revenue</span><span>{formatCurrency(forecast.summary.total_projected_revenue)}</span></div>
            <div className="summary-row"><span>Total Expenses</span><span>{formatCurrency(forecast.summary.total_projected_expenses)}</span></div>
            <div className="summary-row total"><span>Total Profit</span><span>{formatCurrency(forecast.summary.total_projected_profit)}</span></div>
            <div className="summary-row avg"><span>Avg Monthly Profit</span><span>{formatCurrency(forecast.summary.avg_monthly_profit)}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessSimulation;
