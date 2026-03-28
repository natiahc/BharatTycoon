export type StartupPhase = 'founder' | 'seed' | 'growth' | 'scale';

export interface PhaseConfig {
  name: string;
  months: [number, number];
  typicalFunding: number;
  teamSize: [number, number];
  revenueMultiplier: number;
  riskLevel: number;
  availableDecisions: string[];
}

export const PHASE_CONFIGS: Record<StartupPhase, PhaseConfig> = {
  founder: {
    name: 'Founder Stage',
    months: [1, 3],
    typicalFunding: 50000,
    teamSize: [1, 3],
    revenueMultiplier: 0.6,
    riskLevel: 0.4,
    availableDecisions: [
      'hire_employee',
      'marketing_campaign',
      'partner_upsell',
      'bulk_order',
      'reduce_costs'
    ]
  },
  seed: {
    name: 'Seed Stage',
    months: [4, 8],
    typicalFunding: 200000,
    teamSize: [3, 8],
    revenueMultiplier: 1.0,
    riskLevel: 0.3,
    availableDecisions: [
      'hire_employee',
      'marketing_campaign',
      'expand_location',
      'upgrade_technology',
      'partner_upsell',
      'launch_new_product',
      'bulk_order',
      'reduce_costs'
    ]
  },
  growth: {
    name: 'Growth Stage',
    months: [9, 14],
    typicalFunding: 1000000,
    teamSize: [8, 25],
    revenueMultiplier: 1.5,
    riskLevel: 0.25,
    availableDecisions: [
      'marketing_campaign',
      'expand_location',
      'upgrade_technology',
      'launch_new_product',
      'digital_transformation',
      'premium_positioning',
      'bulk_order'
    ]
  },
  scale: {
    name: 'Scale Stage',
    months: [15, 18],
    typicalFunding: 5000000,
    teamSize: [25, 100],
    revenueMultiplier: 2.0,
    riskLevel: 0.2,
    availableDecisions: [
      'expand_location',
      'upgrade_technology',
      'launch_new_product',
      'digital_transformation',
      'premium_positioning'
    ]
  }
};

export function getPhaseForMonth(month: number): StartupPhase {
  if (month <= 3) return 'founder';
  if (month <= 8) return 'seed';
  if (month <= 14) return 'growth';
  return 'scale';
}

export function getPhaseConfig(month: number): PhaseConfig {
  return PHASE_CONFIGS[getPhaseForMonth(month)];
}

export function calculatePhaseProgress(month: number): number {
  const phase = getPhaseForMonth(month);
  const config = PHASE_CONFIGS[phase];
  const [start, end] = config.months;
  return ((month - start) / (end - start)) * 100;
}

export interface JourneyMetrics {
  phase: StartupPhase;
  progress: number;
  monthsRemaining: number;
  nextPhase: StartupPhase | null;
  recommendedFocus: string[];
}

export function getJourneyMetrics(month: number): JourneyMetrics {
  const phase = getPhaseForMonth(month);
  const config = PHASE_CONFIGS[phase];
  const progress = calculatePhaseProgress(month);
  const [_, end] = config.months;
  const monthsRemaining = Math.max(0, end - month);

  const nextPhaseMap: Record<StartupPhase, StartupPhase | null> = {
    founder: 'seed',
    seed: 'growth',
    growth: 'scale',
    scale: null
  };

  const focusMap: Record<StartupPhase, string[]> = {
    founder: ['Product-Market Fit', 'First Customers', 'Basic Operations'],
    seed: ['Scale Team', 'Validate Model', 'Build Reputation'],
    growth: ['Rapid Expansion', 'Market Dominance', 'Operational Excellence'],
    scale: ['IPO Preparation', 'Global Expansion', 'M&A Opportunities']
  };

  return {
    phase,
    progress,
    monthsRemaining,
    nextPhase: nextPhaseMap[phase],
    recommendedFocus: focusMap[phase]
  };
}
