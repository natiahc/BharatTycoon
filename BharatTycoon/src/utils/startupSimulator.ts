import { calculateImpact, DecisionImpact } from './decisionImpactMap';
import { getPhaseForMonth, getPhaseConfig, PhaseConfig } from './startupJourneySimulator';
import { calculateWorkingCapital } from './workingCapitalEngine';
import { predictDemand } from './demandPredictionEngine';
import { assessRisk } from './riskDetectionEngine';
import { getEventsForMonth, applyEventImpact } from './dynamicSystemEngine';
import { getAdvisorRecommendations } from './smartAdvisorEngine';

export interface SimulationState {
  month: number;
  cash: number;
  revenue: number;
  costs: number;
  profit: number;
  totalRevenue: number;
  totalCosts: number;
  phase: string;
  riskScore: number;
  growthRate: number;
}

export interface SimulationResult {
  state: SimulationState;
  impact: DecisionImpact;
  events: string[];
  warnings: string[];
  phaseInfo: PhaseConfig;
}

export function simulateMonth(
  currentState: SimulationState,
  decisionId: string | null,
  context: {
    city: string;
    businessType: string;
    riskAppetite: string;
    capital: number;
  }
): SimulationResult {
  const phase = getPhaseForMonth(currentState.month + 1);
  const phaseConfig = getPhaseConfig(currentState.month + 1);
  
  const baseRevenue = currentState.revenue || context.capital * 0.3 * phaseConfig.revenueMultiplier;
  const baseCosts = currentState.costs || context.capital * 0.25;
  
  const events = getEventsForMonth(currentState.month + 1, context.city, context.businessType);
  const eventImpact = applyEventImpact(baseRevenue, baseCosts, events);
  
  let decisionImpact: DecisionImpact = {
    revenue: 0,
    costs: 0,
    cash: 0,
    risk: 0,
    growth: 0,
    satisfaction: 0
  };
  
  if (decisionId) {
    decisionImpact = calculateImpact(decisionId, {
      month: currentState.month + 1,
      phase,
      riskAppetite: context.riskAppetite,
      capital: context.capital
    });
  }
  
  const newRevenue = Math.round(
    (eventImpact.revenue + decisionImpact.revenue) * phaseConfig.revenueMultiplier
  );
  const newCosts = Math.round(
    (eventImpact.costs + decisionImpact.costs)
  );
  
  const cashChange = decisionImpact.cash || (newRevenue - newCosts) * 0.3;
  const newCash = Math.max(0, currentState.cash + cashChange);
  
  const workingCapital = calculateWorkingCapital(newRevenue, newCosts, context.businessType);
  
  const riskAssessment = assessRisk({
    month: currentState.month + 1,
    cash: newCash,
    costs: newCosts,
    revenue: newRevenue,
    businessType: context.businessType
  });
  
  const newState: SimulationState = {
    month: currentState.month + 1,
    cash: newCash,
    revenue: newRevenue,
    costs: newCosts,
    profit: newRevenue - newCosts,
    totalRevenue: currentState.totalRevenue + newRevenue,
    totalCosts: currentState.totalCosts + newCosts,
    phase,
    riskScore: riskAssessment.riskScore,
    growthRate: phaseConfig.revenueMultiplier
  };
  
  const eventDescriptions = events.map(e => e.title);
  const warnings = riskAssessment.warnings;
  
  return {
    state: newState,
    impact: decisionImpact,
    events: eventDescriptions,
    warnings,
    phaseInfo: phaseConfig
  };
}

export function initializeSimulation(
  capital: number,
  businessType: string,
  city: string
): SimulationState {
  return {
    month: 0,
    cash: capital,
    revenue: 0,
    costs: capital * 0.15,
    profit: -capital * 0.15,
    totalRevenue: 0,
    totalCosts: 0,
    phase: 'founder',
    riskScore: 20,
    growthRate: 0.6
  };
}

export function runSimulation(
  initialState: SimulationState,
  decisions: (string | null)[],
  context: {
    city: string;
    businessType: string;
    riskAppetite: string;
    capital: number;
  }
): SimulationState[] {
  const states: SimulationState[] = [initialState];
  let currentState = initialState;
  
  for (const decision of decisions) {
    const result = simulateMonth(currentState, decision, context);
    states.push(result.state);
    currentState = result.state;
  }
  
  return states;
}
