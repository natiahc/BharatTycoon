export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskFactor {
  category: string;
  description: string;
  severity: RiskLevel;
  probability: number;
  impact: number;
  mitigation: string;
}

export interface RiskAssessment {
  overallRisk: RiskLevel;
  riskScore: number;
  factors: RiskFactor[];
  warnings: string[];
}

const RISK_TEMPLATES: Record<string, RiskFactor[]> = {
  low_cash: [
    {
      category: 'Liquidity',
      description: 'Cash reserves below 3 months of expenses',
      severity: 'high',
      probability: 0.6,
      impact: 0.8,
      mitigation: 'Accelerate receivables or reduce costs'
    }
  ],
  high_growth: [
    {
      category: 'Operational',
      description: 'Rapid growth outpacing infrastructure',
      severity: 'medium',
      probability: 0.4,
      impact: 0.5,
      mitigation: 'Invest in systems before expanding further'
    }
  ],
  new_business: [
    {
      category: 'Market',
      description: 'Business less than 6 months old',
      severity: 'medium',
      probability: 0.5,
      impact: 0.4,
      mitigation: 'Focus on building customer base'
    }
  ],
  competitive: [
    {
      category: 'Market',
      description: 'High competition in the area',
      severity: 'medium',
      probability: 0.45,
      impact: 0.55,
      mitigation: 'Differentiate through unique value proposition'
    }
  ],
  seasonal: [
    {
      category: 'External',
      description: 'Approaching low season period',
      severity: 'low',
      probability: 0.7,
      impact: 0.3,
      mitigation: 'Build reserves during peak season'
    }
  ],
  regulatory: [
    {
      category: 'Compliance',
      description: 'Regulatory changes affecting industry',
      severity: 'high',
      probability: 0.2,
      impact: 0.7,
      mitigation: 'Stay updated on compliance requirements'
    }
  ]
};

export function assessRisk(
  gameState: {
    month: number;
    cash: number;
    costs: number;
    revenue: number;
    businessType: string;
  }
): RiskAssessment {
  const factors: RiskFactor[] = [];
  const warnings: string[] = [];
  let riskScore = 0;

  const monthlyExpenses = gameState.costs;
  const cashMonths = monthlyExpenses > 0 ? gameState.cash / monthlyExpenses : 999;
  
  if (cashMonths < 3) {
    factors.push(...RISK_TEMPLATES.low_cash);
    riskScore += 35;
    warnings.push('⚠️ Critical: Less than 3 months cash runway!');
  } else if (cashMonths < 6) {
    riskScore += 20;
    warnings.push('⚠️ Warning: Cash reserves running low');
  }

  if (gameState.month < 6) {
    factors.push(...RISK_TEMPLATES.new_business);
    riskScore += 15;
  }

  if (gameState.revenue > gameState.costs * 2) {
    factors.push(...RISK_TEMPLATES.high_growth);
    riskScore += 10;
  }

  const month = gameState.month;
  if (month >= 10 && month <= 2) {
    factors.push(...RISK_TEMPLATES.seasonal);
    riskScore += 5;
  }

  const overallRisk = riskScore >= 40 ? 'critical' :
                      riskScore >= 25 ? 'high' :
                      riskScore >= 10 ? 'medium' : 'low';

  return {
    overallRisk,
    riskScore,
    factors,
    warnings
  };
}

export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case 'low': return '#22c55e';
    case 'medium': return '#f59e0b';
    case 'high': return '#ef4444';
    case 'critical': return '#dc2626';
    default: return '#6b7280';
  }
}
