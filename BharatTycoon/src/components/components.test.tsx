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
      expect(screen.getByText(/1000000/i)).toBeTruthy();
    });

    expect(screen.getByText(/300000/i)).toBeTruthy();
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

  it('should render ML features panel', async () => {
    const mockStatus = {
      semantic_search: { loaded: true },
      news_intelligence: { loaded: true },
      text_generation: { available: true }
    };

    mockApi.api.ml.status.mockResolvedValueOnce(mockStatus);

    render(<MLFeaturesPanel />);

    await waitFor(() => {
      expect(screen.getByText(/AI Features/i)).toBeTruthy();
    });
  });

  it('should have all feature tabs', async () => {
    mockApi.api.ml.status.mockResolvedValueOnce({});

    render(<MLFeaturesPanel />);

    await waitFor(() => {
      expect(screen.getByText(/Search/i)).toBeTruthy();
      expect(screen.getByText(/Sentiment/i)).toBeTruthy();
      expect(screen.getByText(/AI Advice/i)).toBeTruthy();
      expect(screen.getByText(/Translate/i)).toBeTruthy();
      expect(screen.getByText(/Q&A/i)).toBeTruthy();
    });
  });

  it('should switch between tabs', async () => {
    mockApi.api.ml.status.mockResolvedValueOnce({});

    render(<MLFeaturesPanel />);

    await waitFor(() => {
      const sentimentTab = screen.getByText(/Sentiment/i);
      fireEvent.click(sentimentTab);
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter text to analyze/i)).toBeTruthy();
    });
  });

  it('should perform semantic search', async () => {
    mockApi.api.ml.status.mockResolvedValueOnce({});
    mockApi.api.ml.search.mockResolvedValueOnce({
      results: [
        { name: 'Mumbai', type: 'city', score: 95 },
        { name: 'Delhi', type: 'city', score: 85 }
      ]
    });

    render(<MLFeaturesPanel />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/delhi cafe/i);
      fireEvent.change(searchInput, { target: { value: 'mumbai' } });
      
      const searchButton = screen.getByText(/Search/i);
      fireEvent.click(searchButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Mumbai/i)).toBeTruthy();
    });
  });
});
