export interface DecisionImpact {
  revenue: number;
  costs: number;
  cash: number;
  risk: number;
  growth: number;
  satisfaction: number;
}

export const decisionImpactMap: Record<string, DecisionImpact> = {
  hire_employee: {
    revenue: 15000,
    costs: 25000,
    cash: -25000,
    risk: 0.1,
    growth: 0.15,
    satisfaction: 0.05
  },
  marketing_campaign: {
    revenue: 30000,
    costs: 20000,
    cash: -20000,
    risk: 0.05,
    growth: 0.2,
    satisfaction: 0
  },
  expand_location: {
    revenue: 50000,
    costs: 100000,
    cash: -100000,
    risk: 0.3,
    growth: 0.4,
    satisfaction: 0.15
  },
  upgrade_technology: {
    revenue: 20000,
    costs: 50000,
    cash: -50000,
    risk: 0.15,
    growth: 0.25,
    satisfaction: 0.1
  },
  partner_upsell: {
    revenue: 25000,
    costs: 5000,
    cash: -5000,
    risk: 0.08,
    growth: 0.18,
    satisfaction: 0.12
  },
  reduce_costs: {
    revenue: -5000,
    costs: -15000,
    cash: 15000,
    risk: 0.05,
    growth: -0.1,
    satisfaction: -0.05
  },
  launch_new_product: {
    revenue: 40000,
    costs: 35000,
    cash: -35000,
    risk: 0.25,
    growth: 0.35,
    satisfaction: 0.2
  },
  digital_transformation: {
    revenue: 35000,
    costs: 60000,
    cash: -60000,
    risk: 0.2,
    growth: 0.3,
    satisfaction: 0.15
  },
  bulk_order: {
    revenue: 20000,
    costs: 10000,
    cash: -10000,
    risk: 0.12,
    growth: 0.08,
    satisfaction: 0.05
  },
  premium_positioning: {
    revenue: 45000,
    costs: 15000,
    cash: -5000,
    risk: 0.18,
    growth: 0.22,
    satisfaction: 0.1
  }
};

export function calculateImpact(
  decisionId: string,
  context: { month: number; phase: string; riskAppetite: string; capital: number }
): DecisionImpact {
  const base = decisionImpactMap[decisionId] || {
    revenue: 0,
    costs: 0,
    cash: 0,
    risk: 0,
    growth: 0,
    satisfaction: 0
  };

  let modifier = 1.0;

  if (context.phase === 'founder') modifier *= 0.8;
  else if (context.phase === 'growth') modifier *= 1.2;
  else if (context.phase === 'scale') modifier *= 1.4;

  if (context.riskAppetite === 'low') {
    modifier *= 0.85;
  } else if (context.riskAppetite === 'high') {
    modifier *= 1.15;
  }

  if (context.month <= 3) modifier *= 0.9;
  else if (context.month >= 12) modifier *= 1.1;

  return {
    revenue: Math.round(base.revenue * modifier),
    costs: Math.round(base.costs * modifier),
    cash: Math.round(base.cash * modifier),
    risk: Math.min(1, base.risk * modifier),
    growth: Math.round(base.growth * modifier * 100) / 100,
    satisfaction: Math.round(base.satisfaction * modifier * 100) / 100
  };
}
