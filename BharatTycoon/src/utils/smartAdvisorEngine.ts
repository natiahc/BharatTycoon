export interface AdvisorRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'growth' | 'cost' | 'risk' | 'operational' | 'strategy';
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

export interface AdvisorContext {
  month: number;
  phase: string;
  cash: number;
  revenue: number;
  costs: number;
  riskLevel: string;
  riskScore: number;
  capital: number;
}

const ADVISOR_RULES: Array<{
  condition: (ctx: AdvisorContext) => boolean;
  recommendation: (ctx: AdvisorContext) => AdvisorRecommendation;
}> = [
  {
    condition: (ctx) => ctx.cash < ctx.costs * 3,
    recommendation: (ctx) => ({
      id: 'cash-crisis',
      title: 'Cash Flow Emergency',
      description: 'Your cash reserves are critically low. Prioritize immediate actions to improve cash position.',
      priority: 'urgent',
      category: 'risk',
      impact: 'Prevents business failure',
      effort: 'high'
    })
  },
  {
    condition: (ctx) => ctx.revenue < ctx.costs,
    recommendation: (ctx) => ({
      id: 'unprofitable',
      title: 'Achieve Profitability',
      description: 'You are currently losing money. Focus on reducing costs or increasing revenue.',
      priority: 'urgent',
      category: 'cost',
      impact: 'Reaches break-even faster',
      effort: 'medium'
    })
  },
  {
    condition: (ctx) => ctx.riskScore > 25,
    recommendation: (ctx) => ({
      id: 'risk-mitigation',
      title: 'Address Risk Factors',
      description: 'Multiple risk factors detected. Review and address them to ensure business stability.',
      priority: 'high',
      category: 'risk',
      impact: 'Reduces business vulnerability',
      effort: 'medium'
    })
  },
  {
    condition: (ctx) => ctx.phase === 'founder' && ctx.month > 2,
    recommendation: (ctx) => ({
      id: 'pmf-focus',
      title: 'Focus on Product-Market Fit',
      description: 'As an early-stage business, focus on validating your product/service with customers.',
      priority: 'high',
      category: 'strategy',
      impact: 'Foundation for future growth',
      effort: 'medium'
    })
  },
  {
    condition: (ctx) => ctx.revenue > ctx.costs * 1.5 && ctx.cash > ctx.costs * 6,
    recommendation: (ctx) => ({
      id: 'scale-ready',
      title: 'Ready to Scale',
      description: 'Strong financial position. Consider expanding operations or launching new offerings.',
      priority: 'high',
      category: 'growth',
      impact: 'Accelerates growth trajectory',
      effort: 'high'
    })
  },
  {
    condition: (ctx) => ctx.month >= 6 && ctx.month <= 8 && ctx.phase === 'seed',
    recommendation: (ctx) => ({
      id: 'seed-prep',
      title: 'Prepare for Seed Round',
      description: 'Build metrics and documentation for potential investors.',
      priority: 'medium',
      category: 'strategy',
      impact: 'Access to growth capital',
      effort: 'medium'
    })
  },
  {
    condition: (ctx) => ctx.phase === 'growth',
    recommendation: (ctx) => ({
      id: 'growth-focus',
      title: 'Aggressive Growth Mode',
      description: 'Invest in marketing, team, and infrastructure to capture market share.',
      priority: 'medium',
      category: 'growth',
      impact: 'Market leadership position',
      effort: 'high'
    })
  }
];

export function getAdvisorRecommendations(ctx: AdvisorContext): AdvisorRecommendation[] {
  const recommendations: AdvisorRecommendation[] = [];
  
  for (const rule of ADVISOR_RULES) {
    if (rule.condition(ctx)) {
      recommendations.push(rule.recommendation(ctx));
    }
  }
  
  recommendations.sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return recommendations.slice(0, 5);
}

export function getContextualTip(phase: string, month: number): string {
  const tips: Record<string, string[]> = {
    founder: [
      'Focus on getting your first 10 customers',
      'Validate your business model with real feedback',
      'Keep fixed costs as low as possible'
    ],
    seed: [
      'Build a repeatable sales process',
      'Hire your first key team members',
      'Establish basic financial tracking'
    ],
    growth: [
      'Systematize operations for scale',
      'Invest in marketing to fuel growth',
      'Monitor unit economics closely'
    ],
    scale: [
      'Prepare for potential IPO or exit',
      'Build senior leadership team',
      'Expand to new markets or products'
    ]
  };
  
  const phaseTips = tips[phase] || tips.founder;
  return phaseTips[month % phaseTips.length];
}
