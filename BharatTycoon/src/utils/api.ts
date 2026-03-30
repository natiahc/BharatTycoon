const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface UserFactors {
  capital: number;
  risk_appetite: string;
  experience: string;
  time_commitment: string;
  interests: string[];
}

export interface CityFactors {
  city: string;
  business_type: string;
  purchasing_power: number;
  competition_level: number;
  seasonality: number[];
}

export interface FinancialReport {
  business_type: string;
  city_tier: number;
  initial_capital: number;
  annual_summary: {
    total_revenue: number;
    total_expenses: number;
    total_profit: number;
    roi: number;
  };
  final_balance_sheet: any;
  final_ratios: any;
}

export interface MLStatus {
  semantic_search: { loaded: boolean };
  news_intelligence: { loaded: boolean };
  text_generation: { available: boolean };
  translation: { available: boolean };
  qa: { available: boolean };
}

export interface Recommendation {
  business_type: string;
  score: number;
  reasons: string[];
}

export interface BusinessAction {
  id: string;
  name: string;
  category: string;
  description: string;
  effect: { type: string; value: number };
  baseCost: number;
  monthlyCost: number;
  isRecurring: boolean;
}

export interface BalanceSheet {
  assets: {
    current_assets: Record<string, number>;
    fixed_assets: Record<string, number>;
    total_assets: number;
  };
  liabilities: {
    current_liabilities: Record<string, number>;
    long_term_liabilities: Record<string, number>;
    total_liabilities: number;
  };
  equity: Record<string, number>;
  accounting_check: Record<string, any>;
}

export interface BusinessAnalysis {
  health_score: number;
  health_status: string;
  metrics: {
    roi: number;
    profit_margin: number;
    current_ratio: number;
    net_worth: number;
  };
  market_sentiment: string;
  recommendations: string[];
  ai_insight: string;
}

async function fetchAPI(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  health: () => fetchAPI('/'),

  india: {
    states: () => fetchAPI('/india/states'),
    cities: () => fetchAPI('/india/cities'),
    search: (q: string) => fetchAPI(`/india/search?q=${encodeURIComponent(q)}`),
  },

  unified: {
    recommend: (user: UserFactors, city: CityFactors) =>
      fetchAPI('/unified/recommendations', {
        method: 'POST',
        body: JSON.stringify({ user, city }),
      }),
    simulate: (user: UserFactors, city: CityFactors, initialCash: number, months: number) =>
      fetchAPI('/unified/simulate', {
        method: 'POST',
        body: JSON.stringify({ user, city, initial_cash: initialCash, months }),
      }),
  },

  financial: {
    status: () => fetchAPI('/financial/status'),
    report: (businessType: string, cityTier: number, capital: number, months = 12) =>
      fetchAPI('/financial/report', {
        method: 'POST',
        body: JSON.stringify({ business_type: businessType, city_tier: cityTier, initial_capital: capital, months }),
      }),
    compare: (businessTypes: string[], cityTier: number, capital: number) =>
      fetchAPI('/financial/compare', {
        method: 'POST',
        body: JSON.stringify({ business_types: businessTypes, city_tier: cityTier, initial_capital: capital }),
      }),
    breakdown: (businessType: string, cityTier = 1, capital = 100000) =>
      fetchAPI(`/financial/breakdown/${businessType}?city_tier=${cityTier}&capital=${capital}`),
    profitLoss: (revenue: number, expenses: Record<string, number>) =>
      fetchAPI('/financial/profit-loss', {
        method: 'POST',
        body: JSON.stringify({ revenue, expenses }),
      }),
  },

  ml: {
    status: () => fetchAPI('/ml/status'),
    search: (q: string, topK = 5) => fetchAPI(`/ml/search?q=${encodeURIComponent(q)}&top_k=${topK}`),
    sentiment: (text: string) => fetchAPI(`/ml/sentiment?text=${encodeURIComponent(text)}`),
    entities: (text: string) => fetchAPI(`/ml/entities?text=${encodeURIComponent(text)}`),
    summarize: (text: string, maxLength = 50) =>
      fetchAPI(`/ml/summarize?text=${encodeURIComponent(text)}&max_length=${maxLength}`),
    classify: (text: string) => fetchAPI(`/ml/classify?text=${encodeURIComponent(text)}`),
  },

  ai: {
    advice: (context: string) => fetchAPI(`/ai/generate-advice?context=${encodeURIComponent(context)}`),
    marketingCopy: (product: string, tone = 'professional') =>
      fetchAPI(`/ai/marketing-copy?product=${encodeURIComponent(product)}&tone=${tone}`),
    businessNames: (businessType: string, keywords = '') =>
      fetchAPI(`/ai/business-names?business_type=${encodeURIComponent(businessType)}&keywords=${keywords}`),
    translate: (text: string, target = 'hi') =>
      fetchAPI(`/ai/translate?text=${encodeURIComponent(text)}&target=${target}`),
    translateHindi: (text: string) => fetchAPI(`/ai/translate-to-hindi?text=${encodeURIComponent(text)}`),
    languages: () => fetchAPI('/ai/languages'),
    answerQuestion: (question: string, topic = '') =>
      fetchAPI(`/ai/answer-question?question=${encodeURIComponent(question)}&topic=${topic}`),
    businessFaq: (topic: string) => fetchAPI(`/ai/business-faq?topic=${encodeURIComponent(topic)}`),
  },

  business: {
    getActions: (businessType: string, cityTier: number, capital: number) =>
      fetchAPI('/business/actions', {
        method: 'POST',
        body: JSON.stringify({ business_type: businessType, city_tier: cityTier, capital }),
      }),
    executeAction: (businessType: string, cityTier: number, capital: number, actionId: string, actionType: string, amount: number, currentState: any) =>
      fetchAPI('/business/execute', {
        method: 'POST',
        body: JSON.stringify({
          business_type: businessType,
          city_tier: cityTier,
          capital,
          action_id: actionId,
          action_type: actionType,
          amount,
          current_state: currentState
        }),
      }),
    getBalanceSheet: (state: any) =>
      fetchAPI('/business/balance-sheet', {
        method: 'POST',
        body: JSON.stringify(state),
      }),
    analyze: (businessType: string, cityTier: number, balanceSheet: any, monthlyRevenue: number, monthlyExpenses: number) =>
      fetchAPI('/business/analyze', {
        method: 'POST',
        body: JSON.stringify({
          business_type: businessType,
          city_tier: cityTier,
          balance_sheet: balanceSheet,
          monthly_revenue: monthlyRevenue,
          monthly_expenses: monthlyExpenses
        }),
      }),
    forecast: (businessType: string, cityTier: number, monthlyRevenue: number, monthlyExpenses: number, activeActions: string[]) =>
      fetchAPI('/business/forecast', {
        method: 'POST',
        body: JSON.stringify({
          business_type: businessType,
          city_tier: cityTier,
          monthly_revenue: monthlyRevenue,
          monthly_expenses: monthlyExpenses,
          active_actions: activeActions
        }),
      }),
  },
};

export default api;
