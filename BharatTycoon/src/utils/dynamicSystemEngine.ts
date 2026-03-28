export interface DynamicEvent {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  impact: {
    revenue: number;
    costs: number;
    risk: number;
    demand: number;
  };
  duration: number;
  affectedCities: string[];
  affectedBusinesses: string[];
}

export const DYNAMIC_EVENTS: DynamicEvent[] = [
  {
    id: 'festival_season',
    title: 'Festival Season Boom',
    description: 'Diwali/Christmas season increases consumer spending significantly',
    type: 'positive',
    impact: { revenue: 1.5, costs: 1.1, risk: 0.9, demand: 1.4 },
    duration: 2,
    affectedCities: ['all'],
    affectedBusinesses: ['all']
  },
  {
    id: 'monsoon_challenges',
    title: 'Monsoon Disruptions',
    description: 'Heavy rains affect footfall and supply chains',
    type: 'negative',
    impact: { revenue: 0.7, costs: 1.2, risk: 1.3, demand: 0.6 },
    duration: 2,
    affectedCities: ['mumbai', 'chennai', 'bangalore'],
    affectedBusinesses: ['restaurant', 'retail', 'grocery']
  },
  {
    id: 'tech_boom',
    title: 'Tech Sector Expansion',
    description: 'Major IT companies announcing hiring spree in the city',
    type: 'positive',
    impact: { revenue: 1.2, costs: 1.05, risk: 0.95, demand: 1.3 },
    duration: 3,
    affectedCities: ['bangalore', 'hyderabad', 'chennai'],
    affectedBusinesses: ['restaurant', 'fitness', 'service', 'premium_grocery']
  },
  {
    id: 'inflation_pressure',
    title: 'Economic Inflation',
    description: 'Rising costs affect margins across all businesses',
    type: 'negative',
    impact: { revenue: 1.0, costs: 1.25, risk: 1.2, demand: 0.85 },
    duration: 4,
    affectedCities: ['all'],
    affectedBusinesses: ['all']
  },
  {
    id: 'govt_incentive',
    title: 'Government Startup Initiative',
    description: 'New incentives for small businesses and startups',
    type: 'positive',
    impact: { revenue: 1.1, costs: 0.9, risk: 0.8, demand: 1.1 },
    duration: 6,
    affectedCities: ['all'],
    affectedBusinesses: ['tech', 'service', 'manufacturing']
  },
  {
    id: 'competitor_entry',
    title: 'New Competitor Enters Market',
    description: 'A major chain announces new location nearby',
    type: 'negative',
    impact: { revenue: 0.85, costs: 1.0, risk: 1.1, demand: 0.9 },
    duration: 3,
    affectedCities: ['all'],
    affectedBusinesses: ['restaurant', 'retail', 'grocery', 'fitness', 'salon']
  },
  {
    id: 'viral_trend',
    title: 'Social Media Viral Trend',
    description: 'Your business type becomes trending on social media',
    type: 'positive',
    impact: { revenue: 1.4, costs: 1.15, risk: 1.0, demand: 1.5 },
    duration: 2,
    affectedCities: ['bangalore', 'mumbai', 'delhi'],
    affectedBusinesses: ['restaurant', 'fitness', 'premium_grocery']
  },
  {
    id: 'supply_shortage',
    title: 'Supply Chain Disruption',
    description: 'Key supplies become scarce or delayed',
    type: 'negative',
    impact: { revenue: 0.8, costs: 1.4, risk: 1.5, demand: 0.9 },
    duration: 3,
    affectedCities: ['all'],
    affectedBusinesses: ['restaurant', 'manufacturing', 'grocery']
  },
  {
    id: 'infrastructure_boost',
    title: 'Metro/Road Infrastructure Upgrade',
    description: 'New metro line or road improvement near your location',
    type: 'positive',
    impact: { revenue: 1.25, costs: 1.0, risk: 0.95, demand: 1.2 },
    duration: 6,
    affectedCities: ['delhi', 'bangalore', 'chennai'],
    affectedBusinesses: ['all']
  },
  {
    id: 'health_scare',
    title: 'Public Health Advisory',
    description: 'Health concerns reduce public gathering and footfall',
    type: 'negative',
    impact: { revenue: 0.6, costs: 0.9, risk: 1.4, demand: 0.5 },
    duration: 2,
    affectedCities: ['all'],
    affectedBusinesses: ['restaurant', 'fitness', 'salon']
  }
];

export interface ActiveEvent extends DynamicEvent {
  remainingDuration: number;
}

export function getEventsForMonth(
  month: number,
  city: string,
  businessType: string
): ActiveEvent[] {
  const seed = month * 7 + city.length;
  const events: ActiveEvent[] = [];
  
  const shuffled = [...DYNAMIC_EVENTS].sort(() => (seed % 11) - 5);
  
  const numEvents = month <= 3 ? 0 : month <= 6 ? 1 : month <= 12 ? 2 : 3;
  
  for (let i = 0; i < numEvents && i < shuffled.length; i++) {
    const event = shuffled[i];
    const affectsCity = event.affectedCities.includes('all') || 
                       event.affectedCities.includes(city.toLowerCase());
    const affectsBusiness = event.affectedBusinesses.includes('all') ||
                          event.affectedBusinesses.includes(businessType.toLowerCase());
    
    if (affectsCity && affectsBusiness) {
      events.push({
        ...event,
        remainingDuration: event.duration
      });
    }
  }
  
  return events;
}

export function applyEventImpact(
  baseRevenue: number,
  baseCosts: number,
  events: ActiveEvent[]
): { revenue: number; costs: number; risk: number; demand: number } {
  let revenueMultiplier = 1;
  let costsMultiplier = 1;
  let riskMultiplier = 1;
  let demandMultiplier = 1;
  
  for (const event of events) {
    revenueMultiplier *= event.impact.revenue;
    costsMultiplier *= event.impact.costs;
    riskMultiplier *= event.impact.risk;
    demandMultiplier *= event.impact.demand;
  }
  
  return {
    revenue: Math.round(baseRevenue * revenueMultiplier),
    costs: Math.round(baseCosts * costsMultiplier),
    risk: Math.min(1, riskMultiplier),
    demand: demandMultiplier
  };
}
