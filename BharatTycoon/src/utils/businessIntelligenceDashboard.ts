import { predictDemand } from './demandPredictionEngine';
import { assessRisk, RiskLevel } from './riskDetectionEngine';
import { getAdvisorRecommendations, AdvisorContext } from './smartAdvisorEngine';
import { getWorkingCapitalMetrics } from './workingCapitalEngine';
import { getPhaseForMonth } from './startupJourneySimulator';
import { getEventsForMonth, applyEventImpact } from './dynamicSystemEngine';

export interface DashboardMetrics {
  financial: {
    revenue: number;
    costs: number;
    profit: number;
    cash: number;
    profitMargin: number;
    cashRunway: number;
  };
  operational: {
    phase: string;
    month: number;
    teamSize: number;
    locations: number;
  };
  market: {
    demand: number;
    demandTrend: string;
    competition: string;
    marketShare: number;
  };
  risk: {
    level: RiskLevel;
    score: number;
    factors: string[];
  };
  recommendations: {
    priority: string[];
    strategic: string[];
    warnings: string[];
  };
  forecast: {
    nextMonth: { revenue: number; profit: number };
    threeMonth: { revenue: number; profit: number };
  };
}

export interface BusinessIntel {
  city: string;
  businessType: string;
  targetCustomers: string[];
  competitors: string[];
  opportunities: string[];
  challenges: string[];
  seasonalPatterns: string[];
  growthPotential: string;
}

const CITY_MARKET_INTEL: Record<string, BusinessIntel> = {
  mumbai: {
    city: 'Mumbai',
    businessType: 'Mixed',
    targetCustomers: ['Working professionals', 'Families', 'Students', 'Tourists'],
    competitors: ['Local businesses', 'Chain stores', 'E-commerce'],
    opportunities: ['High disposable income', 'Diverse population', 'Tech-savvy customers'],
    challenges: ['High rent', 'Competition', 'Traffic logistics'],
    seasonalPatterns: ['Festival surge (Oct-Jan)', 'Summer slump (Apr-Jun)', 'Monsoon slow (Jul-Aug)'],
    growthPotential: 'High'
  },
  bangalore: {
    city: 'Bangalore',
    businessType: 'Tech/Service',
    targetCustomers: ['IT professionals', 'Startups', 'Expats', 'Young couples'],
    competitors: ['Tech companies', 'Co-working spaces', 'Digital services'],
    opportunities: ['Tech talent pool', 'Startup ecosystem', 'High adoption of new tech'],
    challenges: ['Talent retention', 'Rising costs', 'Traffic'],
    seasonalPatterns: ['Year-round stable', 'Holiday dip (Dec)'],
    growthPotential: 'Very High'
  },
  delhi: {
    city: 'Delhi',
    businessType: 'Mixed/Retail',
    targetCustomers: ['Middle class', 'Families', 'Business owners', 'Students'],
    competitors: ['Local markets', 'Malls', 'E-commerce'],
    opportunities: ['Large market', 'Growing middle class', 'Government initiatives'],
    challenges: ['Pollution', 'Infrastructure', 'Competition'],
    seasonalPatterns: ['Winter peak (Nov-Feb)', 'Summer low (May-Jul)'],
    growthPotential: 'High'
  }
};

export function generateDashboard(
  gameState: {
    month: number;
    revenue: number;
    costs: number;
    cash: number;
    businessType: string;
  },
  userProfile: {
    city: string;
    capital: number;
    riskAppetite: string;
  }
): DashboardMetrics {
  const phase = getPhaseForMonth(gameState.month);
  const demandPrediction = predictDemand(
    userProfile.city,
    gameState.businessType,
    gameState.month
  );
  
  const riskAssessment = assessRisk(gameState);
  
  const advisorContext: AdvisorContext = {
    month: gameState.month,
    phase,
    cash: gameState.cash,
    revenue: gameState.revenue,
    costs: gameState.costs,
    riskLevel: riskAssessment.overallRisk,
    riskScore: riskAssessment.riskScore,
    capital: userProfile.capital
  };
  
  const recommendations = getAdvisorRecommendations(advisorContext);
  
  const events = getEventsForMonth(gameState.month, userProfile.city, gameState.businessType);
  const eventImpact = applyEventImpact(gameState.revenue, gameState.costs, events);
  
  const nextDemand = predictDemand(userProfile.city, gameState.businessType, gameState.month + 1);
  const threeMonthDemand = predictDemand(userProfile.city, gameState.businessType, gameState.month + 3);
  
  return {
    financial: {
      revenue: eventImpact.revenue,
      costs: eventImpact.costs,
      profit: eventImpact.revenue - eventImpact.costs,
      cash: gameState.cash,
      profitMargin: eventImpact.revenue > 0 
        ? Math.round(((eventImpact.revenue - eventImpact.costs) / eventImpact.revenue) * 100)
        : 0,
      cashRunway: gameState.costs > 0 
        ? Math.round(gameState.cash / gameState.costs)
        : 99
    },
    operational: {
      phase,
      month: gameState.month,
      teamSize: Math.floor(gameState.month * 1.5) + 1,
      locations: gameState.month >= 6 ? Math.floor(gameState.month / 8) + 1 : 1
    },
    market: {
      demand: Math.round(nextDemand.predictedDemand),
      demandTrend: demandPrediction.trend,
      competition: 'Moderate',
      marketShare: Math.min(15, Math.round(gameState.revenue / 50000 * 10) / 10)
    },
    risk: {
      level: riskAssessment.overallRisk,
      score: riskAssessment.riskScore,
      factors: riskAssessment.factors.map(f => f.description)
    },
    recommendations: {
      priority: recommendations.filter(r => r.priority === 'urgent').map(r => r.title),
      strategic: recommendations.filter(r => r.priority !== 'urgent').map(r => r.title),
      warnings: riskAssessment.warnings
    },
    forecast: {
      nextMonth: {
        revenue: Math.round(threeMonthDemand.predictedDemand * 0.8),
        profit: Math.round(threeMonthDemand.predictedDemand * 0.8 * 0.15)
      },
      threeMonth: {
        revenue: Math.round(threeMonthDemand.predictedDemand),
        profit: Math.round(threeMonthDemand.predictedDemand * 0.2)
      }
    }
  };
}

export function getBusinessIntelligence(city: string): BusinessIntel {
  return CITY_MARKET_INTEL[city.toLowerCase()] || CITY_MARKET_INTEL.mumbai;
}
