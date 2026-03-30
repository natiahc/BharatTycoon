import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

interface BalanceSheet {
  assets: { [key: string]: number };
  liabilities: { [key: string]: number };
  equity: { [key: string]: number };
  net_worth: number;
}

interface FinancialRatios {
  liquidity: { [key: string]: number };
  profitability: { [key: string]: number };
  leverage: { [key: string]: number };
  efficiency: { [key: string]: number };
}

interface FinancialDashboardProps {
  businessType: string;
  cityTier: number;
  capital: number;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ businessType, cityTier, capital }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'balance' | 'ratios' | 'compare'>('summary');
  const [report, setReport] = useState<any>(null);
  const [compareResults, setCompareResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFinancialReport();
  }, [businessType, cityTier, capital]);

  const loadFinancialReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.financial.report(businessType, cityTier, capital, 12);
      setReport(data);
    } catch (err) {
      setError('Failed to load financial report. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const compareAllBusinessTypes = async () => {
    setLoading(true);
    try {
      const types = ['restaurant', 'retail', 'tech', 'salon', 'tuition', 'manufacturing'];
      const data = await api.financial.compare(types, cityTier, capital);
      setCompareResults(data.comparisons || []);
      setActiveTab('compare');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  if (loading && !report) {
    return (
      <div className="financial-dashboard loading">
        <div className="loader">Loading AI-powered financial analysis...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="financial-dashboard error">
        <p>{error}</p>
        <button onClick={loadFinancialReport}>Retry</button>
      </div>
    );
  }

  const annual = report?.annual_summary || {};
  const balance = report?.final_balance_sheet || {};
  const ratios = report?.final_ratios || {};

  return (
    <div className="financial-dashboard">
      <div className="dashboard-header">
        <h2>AI Financial Dashboard</h2>
        <span className="badge">Powered by HuggingFace ML</span>
      </div>

      <div className="tabs">
        {(['summary', 'balance', 'ratios', 'compare'] as const).map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'summary' && (
        <div className="summary-section">
          <div className="metric-cards">
            <div className="metric">
              <label>Total Revenue</label>
              <value>{formatCurrency(annual.total_revenue || 0)}</value>
            </div>
            <div className="metric">
              <label>Total Expenses</label>
              <value>{formatCurrency(annual.total_expenses || 0)}</value>
            </div>
            <div className="metric profit">
              <label>Net Profit</label>
              <value>{formatCurrency(annual.total_profit || 0)}</value>
            </div>
            <div className="metric">
              <label>ROI</label>
              <value>{formatPercent(annual.roi || 0)}</value>
            </div>
            <div className="metric">
              <label>Net Worth</label>
              <value>{formatCurrency(annual.final_net_worth || 0)}</value>
            </div>
            <div className="metric">
              <label>Cash on Hand</label>
              <value>{formatCurrency(annual.final_cash || 0)}</value>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'balance' && (
        <div className="balance-section">
          <div className="balance-column">
            <h3>Assets</h3>
            <ul>
              {Object.entries(balance.assets || {}).map(([key, value]) => (
                <li key={key}>
                  <span>{key.replace(/_/g, ' ')}</span>
                  <span>{formatCurrency(value)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="balance-column">
            <h3>Liabilities</h3>
            <ul>
              {Object.entries(balance.liabilities || {}).map(([key, value]) => (
                <li key={key}>
                  <span>{key.replace(/_/g, ' ')}</span>
                  <span>{formatCurrency(value)}</span>
                </li>
              ))}
            </ul>
            <h3>Equity</h3>
            <ul>
              {Object.entries(balance.equity || {}).map(([key, value]) => (
                <li key={key}>
                  <span>{key.replace(/_/g, ' ')}</span>
                  <span>{formatCurrency(value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'ratios' && (
        <div className="ratios-section">
          <div className="ratio-group">
            <h3>Liquidity Ratios</h3>
            <ul>
              {Object.entries(ratios.liquidity || {}).map(([key, value]) => (
                <li key={key}>
                  <span>{key.replace(/_/g, ' ')}</span>
                  <span>{typeof value === 'number' ? value.toFixed(2) : value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="ratio-group">
            <h3>Profitability Ratios</h3>
            <ul>
              {Object.entries(ratios.profitability || {}).map(([key, value]) => (
                <li key={key}>
                  <span>{key.replace(/_/g, ' ')}</span>
                  <span>{typeof value === 'number' ? formatPercent(value) : value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="ratio-group">
            <h3>Leverage Ratios</h3>
            <ul>
              {Object.entries(ratios.leverage || {}).map(([key, value]) => (
                <li key={key}>
                  <span>{key.replace(/_/g, ' ')}</span>
                  <span>{typeof value === 'number' ? value.toFixed(2) : value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="ratio-group">
            <h3>Efficiency Ratios</h3>
            <ul>
              {Object.entries(ratios.efficiency || {}).map(([key, value]) => (
                <li key={key}>
                  <span>{key.replace(/_/g, ' ')}</span>
                  <span>{typeof value === 'number' ? value.toFixed(2) : value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'compare' && (
        <div className="compare-section">
          <button className="compare-btn" onClick={compareAllBusinessTypes}>
            Compare All Business Types
          </button>
          {compareResults.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Business Type</th>
                  <th>Revenue</th>
                  <th>Net Profit</th>
                  <th>ROI</th>
                </tr>
              </thead>
              <tbody>
                {compareResults
                  .filter((r) => !r.error)
                  .sort((a, b) => (b.roi || 0) - (a.roi || 0))
                  .map((result) => (
                    <tr key={result.business_type}>
                      <td>{result.business_type}</td>
                      <td>{formatCurrency(result.month_12?.revenue || 0)}</td>
                      <td>{formatCurrency(result.month_12?.net_profit || 0)}</td>
                      <td className={result.roi > 20 ? 'good' : result.roi > 10 ? 'medium' : 'low'}>
                        {formatPercent(result.roi || 0)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default FinancialDashboard;
