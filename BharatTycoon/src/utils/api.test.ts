/**
 * API Utility Tests
 * Tests for the api.ts module with mocked responses
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../utils/api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Module', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('India Endpoints', () => {
    it('should fetch states', async () => {
      const mockStates = { states: [{ id: 'delhi', name: 'Delhi' }] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStates)
      });

      const result = await api.india.states();
      expect(result).toEqual(mockStates);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should search locations', async () => {
      const mockResults = { states: [], cities: [{ id: 'mumbai', name: 'Mumbai' }] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResults)
      });

      const result = await api.india.search('mumbai');
      expect(result.cities).toHaveLength(1);
    });
  });

  describe('Financial Endpoints', () => {
    it('should get financial status', async () => {
      const mockStatus = { financial_system: 'Active', available_business_types: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStatus)
      });

      const result = await api.financial.status();
      expect(result.financial_system).toBe('Active');
    });

    it('should generate financial report', async () => {
      const mockReport = {
        annual_summary: { total_revenue: 1000000, total_profit: 200000 }
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReport)
      });

      const result = await api.financial.report('restaurant', 1, 500000, 12);
      expect(result.annual_summary.total_revenue).toBe(1000000);
    });

    it('should compare business types', async () => {
      const mockCompare = {
        comparisons: [
          { business_type: 'restaurant', roi: 25 },
          { business_type: 'tech', roi: 40 }
        ],
        recommendation: { business_type: 'tech' }
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCompare)
      });

      const result = await api.financial.compare(['restaurant', 'tech'], 1, 500000);
      expect(result.comparisons).toHaveLength(2);
      expect(result.recommendation.business_type).toBe('tech');
    });

    it('should calculate profit/loss', async () => {
      const mockResult = {
        revenue: 100000,
        total_expenses: 60000,
        net_profit: 40000,
        status: 'profitable'
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const result = await api.financial.profitLoss(100000, { rent: 20000, salaries: 40000 });
      expect(result.net_profit).toBe(40000);
      expect(result.status).toBe('profitable');
    });
  });

  describe('ML Endpoints', () => {
    it('should get ML status', async () => {
      const mockStatus = {
        semantic_search: { loaded: true },
        news_intelligence: { loaded: true }
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStatus)
      });

      const result = await api.ml.status();
      expect(result.semantic_search.loaded).toBe(true);
    });

    it('should analyze sentiment', async () => {
      const mockSentiment = {
        sentiment: { label: 'positive', score: 0.85 }
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSentiment)
      });

      const result = await api.ml.sentiment('Great business opportunity!');
      expect(result.sentiment.label).toBe('positive');
    });

    it('should search semantically', async () => {
      const mockResults = {
        results: [
          { name: 'Mumbai', type: 'city', score: 95 }
        ]
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResults)
      });

      const result = await api.ml.search('delhi cafe');
      expect(result.results).toHaveLength(1);
    });
  });

  describe('AI Endpoints', () => {
    it('should generate business advice', async () => {
      const mockAdvice = {
        advice: 'Consider the market demand and competition.',
        model: 'gpt2'
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAdvice)
      });

      const result = await api.ai.advice('starting a restaurant');
      expect(result.advice).toBeDefined();
    });

    it('should generate marketing copy', async () => {
      const mockCopy = {
        tagline: 'Taste the Difference',
        description: 'Best food in town'
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCopy)
      });

      const result = await api.ai.marketingCopy('restaurant', 'professional');
      expect(result.tagline).toBe('Taste the Difference');
    });

    it('should translate to Hindi', async () => {
      const mockTranslation = {
        original: 'Welcome to business',
        hindi: 'व्यापार में आपका स्वागत है'
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTranslation)
      });

      const result = await api.ai.translateHindi('Welcome to business');
      expect(result.hindi).toBe('व्यापार में आपका स्वागत है');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(api.health()).rejects.toThrow('Network error');
    });

    it('should handle non-ok responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(api.financial.status()).rejects.toThrow('API error: 500');
    });
  });
});
