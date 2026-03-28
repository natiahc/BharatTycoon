export interface DecisionCard {
  id: string;
  title: string;
  description: string;
  category: 'growth' | 'operational' | 'risk' | 'strategy';
  cost: number;
  impact: {
    revenue: string;
    costs: string;
    risk: string;
    timeline: string;
  };
  requirements?: {
    minPhase?: string;
    minCash?: number;
    minMonth?: number;
  };
}

export const DECISION_CARDS: DecisionCard[] = [
  {
    id: 'hire_employee',
    title: 'Hire Team Member',
    description: 'Add talent to your team to handle more customers and operations.',
    category: 'operational',
    cost: 25000,
    impact: {
      revenue: '+15-25%',
      costs: '+25K/month',
      risk: 'Low',
      timeline: 'Immediate'
    },
    requirements: { minMonth: 1 }
  },
  {
    id: 'marketing_campaign',
    title: 'Marketing Push',
    description: 'Run targeted ads and promotions to attract more customers.',
    category: 'growth',
    cost: 20000,
    impact: {
      revenue: '+30-40%',
      costs: '-20K',
      risk: 'Low',
      timeline: '2-4 weeks'
    }
  },
  {
    id: 'expand_location',
    title: 'Open New Location',
    description: 'Expand to a second location in a different area.',
    category: 'growth',
    cost: 100000,
    impact: {
      revenue: '+50-80%',
      costs: '-100K',
      risk: 'Medium',
      timeline: '2-3 months'
    },
    requirements: { minPhase: 'seed', minCash: 200000, minMonth: 6 }
  },
  {
    id: 'upgrade_technology',
    title: 'Tech Upgrade',
    description: 'Invest in better systems, software, or equipment.',
    category: 'operational',
    cost: 50000,
    impact: {
      revenue: '+20-30%',
      costs: '-50K',
      risk: 'Low',
      timeline: '1-2 months'
    }
  },
  {
    id: 'partner_upsell',
    title: 'Partner Promotion',
    description: 'Team up with complementary businesses for cross-promotion.',
    category: 'strategy',
    cost: 5000,
    impact: {
      revenue: '+25%',
      costs: '-5K',
      risk: 'Very Low',
      timeline: '1-2 weeks'
    }
  },
  {
    id: 'reduce_costs',
    title: 'Cost Optimization',
    description: 'Streamline operations to reduce monthly expenses.',
    category: 'operational',
    cost: 0,
    impact: {
      revenue: '-5%',
      costs: '-15K/month',
      risk: 'Very Low',
      timeline: 'Immediate'
    }
  },
  {
    id: 'launch_new_product',
    title: 'Launch New Offering',
    description: 'Introduce a new product or service to your customers.',
    category: 'growth',
    cost: 35000,
    impact: {
      revenue: '+40-60%',
      costs: '-35K',
      risk: 'Medium',
      timeline: '1-2 months'
    },
    requirements: { minPhase: 'seed', minMonth: 4 }
  },
  {
    id: 'digital_transformation',
    title: 'Go Digital',
    description: 'Build online presence, delivery, or booking systems.',
    category: 'strategy',
    cost: 60000,
    impact: {
      revenue: '+35-50%',
      costs: '-60K',
      risk: 'Medium',
      timeline: '2-4 months'
    },
    requirements: { minPhase: 'growth' }
  },
  {
    id: 'bulk_order',
    title: 'Bulk Discount',
    description: 'Buy inventory in bulk for better unit economics.',
    category: 'operational',
    cost: 10000,
    impact: {
      revenue: '+20%',
      costs: '-10K',
      risk: 'Low',
      timeline: 'Immediate'
    }
  },
  {
    id: 'premium_positioning',
    title: 'Premium Upgrade',
    description: 'Reposition as a premium brand with higher margins.',
    category: 'strategy',
    cost: 15000,
    impact: {
      revenue: '+45%',
      costs: '-5K',
      risk: 'Medium',
      timeline: '1-3 months'
    },
    requirements: { minPhase: 'growth', minMonth: 8 }
  }
];

export function getAvailableCards(
  phase: string,
  cash: number,
  month: number
): DecisionCard[] {
  return DECISION_CARDS.filter(card => {
    if (card.requirements?.minCash && cash < card.requirements.minCash) return false;
    if (card.requirements?.minMonth && month < card.requirements.minMonth) return false;
    if (card.requirements?.minPhase) {
      const phaseOrder = ['founder', 'seed', 'growth', 'scale'];
      const currentIdx = phaseOrder.indexOf(phase);
      const requiredIdx = phaseOrder.indexOf(card.requirements.minPhase);
      if (currentIdx < requiredIdx) return false;
    }
    return true;
  });
}

export function getCardsByCategory(category: DecisionCard['category']): DecisionCard[] {
  return DECISION_CARDS.filter(card => card.category === category);
}

export function getRandomCards(count: number, phase: string, cash: number, month: number): DecisionCard[] {
  const available = getAvailableCards(phase, cash, month);
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, available.length));
}
