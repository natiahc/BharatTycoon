import { calculateImpact, DecisionImpact } from './decisionImpactMap';
import { getPhaseForMonth, getPhaseConfig, getJourneyMetrics } from './startupJourneySimulator';
import { assessRisk } from './riskDetectionEngine';
import { getAdvisorRecommendations, AdvisorContext } from './smartAdvisorEngine';
import { predictDemand } from './demandPredictionEngine';

export type UILevel = 'game' | 'advanced' | 'expert';

export interface GameEngineState {
  month: number;
  cash: number;
  revenue: number;
  costs: number;
  profit: number;
  phase: string;
  uiLevel: UILevel;
  achievements: string[];
  gameOver: boolean;
  victory: boolean;
}

export interface GameEngineConfig {
  startingCapital: number;
  monthsToWin: number;
  minCashToSurvive: number;
}

const DEFAULT_CONFIG: GameEngineConfig = {
  startingCapital: 100000,
  monthsToWin: 18,
  minCashToSurvive: 5000
};

export class GameEngine {
  private state: GameEngineState;
  private config: GameEngineConfig;
  private decisionHistory: { month: number; decision: string; impact: DecisionImpact }[] = [];

  constructor(uiLevel: UILevel, capital?: number) {
    this.config = { ...DEFAULT_CONFIG };
    this.state = {
      month: 1,
      cash: capital || this.config.startingCapital,
      revenue: 0,
      costs: capital ? capital * 0.15 : this.config.startingCapital * 0.15,
      profit: 0,
      phase: 'founder',
      uiLevel,
      achievements: [],
      gameOver: false,
      victory: false
    };
  }

  getState(): GameEngineState {
    return { ...this.state };
  }

  makeDecision(
    decisionId: string,
    context: { city: string; businessType: string; riskAppetite: string }
  ): { impact: DecisionImpact; newState: GameEngineState } {
    const phase = getPhaseForMonth(this.state.month);
    const impact = calculateImpact(decisionId, {
      month: this.state.month,
      phase,
      riskAppetite: context.riskAppetite,
      capital: this.state.cash
    });

    const baseRevenue = this.state.revenue || this.state.costs * 1.2;
    const newRevenue = Math.round(baseRevenue * (1 + impact.growth));
    const newCosts = Math.round(this.state.costs * (1 + impact.costs / this.state.costs));
    const newCash = Math.max(0, this.state.cash + impact.cash + (newRevenue - newCosts) * 0.3);

    this.state = {
      ...this.state,
      month: this.state.month + 1,
      cash: newCash,
      revenue: newRevenue,
      costs: newCosts,
      profit: newRevenue - newCosts,
      phase: getPhaseForMonth(this.state.month + 1),
      gameOver: newCash < this.config.minCashToSurvive,
      victory: this.state.month >= this.config.monthsToWin
    };

    this.decisionHistory.push({ month: this.state.month, decision: decisionId, impact });
    this.checkAchievements();

    return { impact, newState: this.getState() };
  }

  advanceMonth(
    context: { city: string; businessType: string }
  ): { newState: GameEngineState; demand: number; risk: any } {
    const phase = getPhaseForMonth(this.state.month);
    const demand = predictDemand(context.city, context.businessType, this.state.month);
    const risk = assessRisk({
      month: this.state.month,
      cash: this.state.cash,
      costs: this.state.costs,
      revenue: this.state.revenue,
      businessType: context.businessType
    });

    const revenueGrowth = 1 + (demand.predictedDemand - 50000) / 500000;
    const newRevenue = Math.round(this.state.revenue * revenueGrowth);
    const newCosts = Math.round(this.state.costs * 1.02);
    const newCash = Math.max(0, this.state.cash + (newRevenue - newCosts) * 0.5);

    this.state = {
      ...this.state,
      month: this.state.month + 1,
      cash: newCash,
      revenue: newRevenue,
      costs: newCosts,
      profit: newRevenue - newCosts,
      phase: getPhaseForMonth(this.state.month + 1),
      gameOver: newCash < this.config.minCashToSurvive,
      victory: this.state.month >= this.config.monthsToWin
    };

    return { newState: this.getState(), demand: demand.predictedDemand, risk };
  }

  private checkAchievements(): void {
    const achievements = [...this.state.achievements];

    if (this.state.cash > this.config.startingCapital * 2 && !achievements.includes('first_profit')) {
      achievements.push('first_profit');
    }
    if (this.state.month >= 6 && !achievements.includes('six_months')) {
      achievements.push('six_months');
    }
    if (this.state.revenue > this.config.startingCapital && !achievements.includes('scale_up')) {
      achievements.push('scale_up');
    }
    if (this.state.phase === 'scale' && !achievements.includes('growth_phase')) {
      achievements.push('growth_phase');
    }

    this.state.achievements = achievements;
  }

  getJourneyInfo() {
    return getJourneyMetrics(this.state.month);
  }

  getAdvisorRecommendations() {
    const ctx: AdvisorContext = {
      month: this.state.month,
      phase: this.state.phase,
      cash: this.state.cash,
      revenue: this.state.revenue,
      costs: this.state.costs,
      riskLevel: assessRisk({
        month: this.state.month,
        cash: this.state.cash,
        costs: this.state.costs,
        revenue: this.state.revenue,
        businessType: ''
      }).overallRisk,
      riskScore: this.state.riskScore,
      capital: this.config.startingCapital
    };
    return getAdvisorRecommendations(ctx);
  }
}
