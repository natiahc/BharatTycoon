/**
 * Component Tests
 * Tests for React components with mocked API calls
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FinancialDashboard } from '../components/FinancialDashboard';
import { MLFeaturesPanel } from '../components/MLFeaturesPanel';
import * as api from '../utils/api';

vi.mock('../utils/api');

const mockApi = api as any;

describe('FinancialDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    mockApi.api.financial.report.mockImplementation(() => new Promise(() => {}));
    
    render(<FinancialDashboard businessType="restaurant" cityTier={1} capital={500000} />);
    
    expect(screen.getByText(/loading/i)).toBeTruthy();
  });

  it('should display financial data when loaded', async () => {
    const mockReport = {
      annual_summary: {
        total_revenue: 1000000,
        total_expenses: 700000,
        total_profit: 300000,
        roi: 60,
        final_net_worth: 800000,
        final_cash: 200000
      },
      final_balance_sheet: {
        assets: { cash: 200000, inventory: 100000, equipment: 300000 },
        liabilities: { loans_payable: 100000, accounts_payable: 50000 },
        equity: { owner_equity: 500000, retained_earnings: 250000 }
      },
      final_ratios: {
        liquidity: { current_ratio: 2.5, quick_ratio: 1.8 },
        profitability: { gross_margin: 35, net_margin: 30, roe: 60 },
        leverage: { debt_to_equity: 0.3 },
        efficiency: { asset_turnover: 1.2 }
      }
    };

    mockApi.api.financial.report.mockResolvedValueOnce(mockReport);

    render(<FinancialDashboard businessType="restaurant" cityTier={1} capital={500000} />);

    await waitFor(() => {
      expect(screen.getByText(/Total Revenue/i)).toBeTruthy();
      expect(screen.getByText(/Net Profit/i)).toBeTruthy();
      expect(screen.getByText(/₹10,00,000/i)).toBeTruthy();
    });
  });

  it('should handle errors gracefully', async () => {
    mockApi.api.financial.report.mockRejectedValueOnce(new Error('API Error'));

    render(<FinancialDashboard businessType="restaurant" cityTier={1} capital={500000} />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeTruthy();
    });

    const retryButton = screen.getByText(/retry/i);
    expect(retryButton).toBeTruthy();
  });
});

describe('MLFeaturesPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render ML features panel with tabs', () => {
    mockApi.api.ml.status.mockResolvedValueOnce({});

    render(<MLFeaturesPanel />);

    expect(screen.getByText('AI Features')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Search' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Sentiment' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'AI Advice' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Translate' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Q&A' })).toHaveLength(1);
  });

  it('should render search input by default', () => {
    mockApi.api.ml.status.mockResolvedValueOnce({});

    render(<MLFeaturesPanel />);

    expect(screen.getByPlaceholderText(/delhi cafe/i)).toBeTruthy();
  });

  it('should switch to sentiment tab when clicked', () => {
    mockApi.api.ml.status.mockResolvedValueOnce({});

    render(<MLFeaturesPanel />);

    const sentimentTab = screen.getByText('Sentiment');
    fireEvent.click(sentimentTab);

    expect(screen.getByPlaceholderText(/analyze sentiment/i)).toBeTruthy();
  });
});
