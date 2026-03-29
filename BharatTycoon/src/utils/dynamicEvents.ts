export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'challenge' | 'milestone' | 'market';
  choices?: {
    id: string;
    label: string;
    outcome: string;
    impact: {
      revenue: number;
      costs: number;
      cash: number;
      risk: number;
    };
  }[];
  automatic?: {
    impact: {
      revenue: number;
      costs: number;
      cash: number;
      risk: number;
    };
  };
  trigger: (month: number, state: any) => boolean;
}

export const MONTHLY_EVENTS: GameEvent[] = [
  {
    id: 'investor_interest',
    title: 'Investor Meeting',
    description: 'An investor wants to discuss potential funding for your growth.',
    type: 'opportunity',
    choices: [
      {
        id: 'accept_meeting',
        label: 'Meet with Investor',
        outcome: 'Great conversation! They want to learn more.',
        impact: { revenue: 0, costs: 5000, cash: 0, risk: -0.05 }
      },
      {
        id: 'decline',
        label: 'Decline Meeting',
        outcome: 'You focus on organic growth for now.',
        impact: { revenue: 0, costs: 0, cash: 0, risk: 0 }
      }
    ],
    trigger: (month, state) => month >= 4 && month <= 8 && state.revenue > 50000
  },
  {
    id: 'competitor_opens',
    title: 'New Competitor',
    description: 'A new competitor has opened nearby. How do you respond?',
    type: 'challenge',
    choices: [
      {
        id: 'price_war',
        label: 'Start Price Competition',
        outcome: 'You won some customers but margins are squeezed.',
        impact: { revenue: 15000, costs: 5000, cash: -5000, risk: 0.1 }
      },
      {
        id: 'differentiate',
        label: 'Focus on Differentiation',
        outcome: 'You maintained your positioning and loyal customers.',
        impact: { revenue: 5000, costs: 10000, cash: -10000, risk: -0.05 }
      },
      {
        id: 'ignore',
        label: 'Ignore and Focus',
        outcome: 'Your regulars stayed with you. Business as usual.',
        impact: { revenue: 0, costs: 0, cash: 0, risk: 0.05 }
      }
    ],
    trigger: (month, state) => month >= 3 && Math.random() < 0.2
  },
  {
    id: 'viral_moment',
    title: 'Social Media Viral',
    description: 'Your business went viral on social media!',
    type: 'opportunity',
    choices: [
      {
        id: 'capitalize',
        label: 'Capitalize on Fame',
        outcome: 'You gained many new customers!',
        impact: { revenue: 40000, costs: 15000, cash: 25000, risk: -0.1 }
      },
      {
        id: 'measured',
        label: 'Measured Response',
        outcome: 'Steady growth from the exposure.',
        impact: { revenue: 20000, costs: 5000, cash: 15000, risk: 0 }
      }
    ],
    trigger: (month, state) => month >= 2 && Math.random() < 0.1
  },
  {
    id: 'supply_issue',
    title: 'Supply Disruption',
    description: 'Your key supplier has delays. How to handle?',
    type: 'challenge',
    choices: [
      {
        id: 'find_alternative',
        label: 'Find New Supplier',
        outcome: 'New supplier but at higher costs.',
        impact: { revenue: -5000, costs: 15000, cash: -15000, risk: 0.05 }
      },
      {
        id: 'pause_sales',
        label: 'Pause Sales Temporarily',
        outcome: 'You preserved margins but lost some customers.',
        impact: { revenue: -20000, costs: 0, cash: 5000, risk: 0.1 }
      },
      {
        id: 'pass_costs',
        label: 'Pass Costs to Customers',
        outcome: 'Some customers left, but you maintained margins.',
        impact: { revenue: 0, costs: 10000, cash: -5000, risk: 0.15 }
      }
    ],
    trigger: (month, state) => month >= 2 && Math.random() < 0.15
  },
  {
    id: 'milestone_6m',
    title: '6 Months Milestone!',
    description: 'Congratulations on surviving and growing for 6 months!',
    type: 'milestone',
    automatic: {
      impact: { revenue: 10000, costs: 0, cash: 20000, risk: -0.1 }
    },
    trigger: (month, state) => month === 6
  },
  {
    id: 'milestone_12m',
    title: '1 Year Achievement!',
    description: 'One year strong! You have proven your business model.',
    type: 'milestone',
    automatic: {
      impact: { revenue: 25000, costs: 0, cash: 50000, risk: -0.15 }
    },
    trigger: (month, state) => month === 12
  },
  {
    id: 'tax_reminder',
    title: 'Tax Obligations',
    description: 'Time to set aside money for taxes.',
    type: 'market',
    choices: [
      {
        id: 'set_aside',
        label: 'Set Aside 15% for Taxes',
        outcome: 'Funds reserved for tax payments.',
        impact: { revenue: 0, costs: 0, cash: 0, risk: 0 }
      }
    ],
    trigger: (month, state) => month % 3 === 0 && state.revenue > 0
  },
  {
    id: 'festival_season',
    title: 'Festival Bonanza',
    description: 'The festival season is here! Extra customers expected.',
    type: 'opportunity',
    choices: [
      {
        id: 'full_force',
        label: 'Go All In',
        outcome: 'Amazing festival sales!',
        impact: { revenue: 50000, costs: 20000, cash: 30000, risk: -0.1 }
      },
      {
        id: 'moderate',
        label: 'Moderate Push',
        outcome: 'Good seasonal boost.',
        impact: { revenue: 25000, costs: 8000, cash: 17000, risk: -0.05 }
      }
    ],
    trigger: (month, state) => (month === 9 || month === 10 || month === 11) && Math.random() < 0.5
  }
];

export function getEventForMonth(month: number, state: any): GameEvent | null {
  const eligibleEvents = MONTHLY_EVENTS.filter(event => event.trigger(month, state));
  
  if (eligibleEvents.length === 0) return null;
  
  return eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];
}

export function getEventsForPhase(phase: string): GameEvent[] {
  return MONTHLY_EVENTS.filter(event => {
    return event.trigger(1, { revenue: 50000 });
  });
}
