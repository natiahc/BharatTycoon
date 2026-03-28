import { Phase } from './startupJourneySimulator';

export type NewsCategory = 
  | 'economy' 
  | 'tech' 
  | 'local' 
  | 'regulatory'
  | 'competition'
  | 'trend'
  | 'weather'
  | 'event';

export interface DynamicNews {
  id: string;
  headline: string;
  category: NewsCategory;
  sentiment: number;
  impact: {
    demand: number;
    cost: number;
    competition: number;
  };
  duration: number;
  expiresAt: number;
  city: string;
}

export interface MarketDynamics {
  timestamp: number;
  news: DynamicNews[];
  demandModifier: number;
  costModifier: number;
  competitionLevel: number;
  activeTrends: string[];
  seasonalFactor: number;
  randomEvent: RandomEvent | null;
}

export interface RandomEvent {
  type: 'opportunity' | 'crisis' | 'discovery' | 'disruption';
  title: string;
  description: string;
  impact: {
    revenue: number;
    demand: number;
    costs: number;
  };
  choices?: EventChoice[];
  resolved: boolean;
}

export interface EventChoice {
  choice: string;
  outcome: string;
  impact: {
    revenue: number;
    demand: number;
    costs: number;
  };
}

const NEWS_TEMPLATES: Record<NewsCategory, string[]> = {
  economy: [
    'RBI keeps repo rate unchanged at 6.5%',
    'Inflation drops to 4.5% - consumer spending expected to rise',
    'GDP growth forecast revised to 7% for FY26',
    'Unemployment rate falls to 4.2%',
    'Bank credit growth hits 15% high',
    'FD rates rise - savings become attractive',
    'Consumer confidence index rises to 85',
    'Trade deficit widens unexpectedly',
  ],
  tech: [
    'AI startups raise $2B in funding this quarter',
    'Tech giants announce new India expansion',
    '5G rollout completes in tier-2 cities',
    'SaaS companies see 40% revenue growth',
    'Cybersecurity threats increase for SMBs',
    'Cloud adoption accelerates among SMEs',
    'Tech layoffs continue - 50K affected',
    'India becomes 3rd largest startup ecosystem',
  ],
  local: [
    'New metro line to connect suburb areas',
    'Major corporate announces 10K hiring spree',
    'Festival season brings 30% more footfall',
    'Road infrastructure project causes traffic',
    'New shopping mall opens next month',
    'Local festival draws record tourists',
    'Water shortage affects residential areas',
    'Power cuts announced for summer months',
  ],
  regulatory: [
    'New GST rate announced for retail sector',
    'Labor law changes impact hiring costs',
    'Data privacy rules tighten for e-commerce',
    'Export benefits extended for MSMEs',
    'Single window clearance for businesses',
    'New licensing requirements announced',
    'Tax compliance deadline approaches',
    'Subsidy program for SMEs launched',
  ],
  competition: [
    'Unicorn startup enters local market',
    'Major chain announces new store openings',
    'Foreign brand enters through acquisition',
    'Local business goes national',
    'Discount war erupts in retail sector',
    'New delivery startup offers free shipping',
    'Aggregators increase commission rates',
    'E-commerce platforms launch local stores',
  ],
  trend: [
    'Sustainable products see 50% higher demand',
    'Health consciousness drives wellness spending',
    'Remote work creates new service demands',
    'Gen-Z prefers experiential purchases',
    'Premiumization trend continues strong',
    'Local brands gain market share',
    'Subscription models grow 30%',
    'Social commerce gains momentum',
  ],
  weather: [
    'Monsoon arrives early this year',
    'Heatwave alert for next 2 weeks',
    'Cyclone warning issued for coastal areas',
    'Winter arrives with heavy rainfall',
    'Air quality index worsens in metro',
    'Best weather in decade for tourism',
    'Flooding affects supply chain',
    'Clear skies forecast for festival season',
  ],
  event: [
    'International cricket match in city',
    'Tech conference announces celebrity speakers',
    'Cultural festival expects 1L visitors',
    'Major exhibition draws global buyers',
    'Marathon event closes main roads',
    'Film festival celebrates local talent',
    'Trade fair sees record participation',
    'New year celebration brings tourists',
  ],
};

const RANDOM_EVENTS: RandomEvent[] = [
  {
    type: 'opportunity',
    title: '📢 Viral Social Media Post',
    description: 'A customer posted about your business and it went viral!',
    impact: { revenue: 1.5, demand: 1.3, costs: 1.0 },
    resolved: false,
  },
  {
    type: 'opportunity',
    title: '🤝 Corporate Partnership',
    description: 'A large company wants to partner for bulk orders.',
    impact: { revenue: 1.4, demand: 1.2, costs: 1.1 },
    resolved: false,
  },
  {
    type: 'opportunity',
    title: '📰 Media Coverage',
    description: 'Local news wants to feature your business.',
    impact: { revenue: 1.2, demand: 1.3, costs: 1.0 },
    resolved: false,
  },
  {
    type: 'crisis',
    title: '🚨 Equipment Failure',
    description: 'Critical equipment broke down unexpectedly.',
    impact: { revenue: 0.7, demand: 1.0, costs: 1.3 },
    resolved: false,
  },
  {
    type: 'crisis',
    title: '🏪 Key Competitor Sale',
    description: 'A competitor is having a massive sale.',
    impact: { revenue: 0.8, demand: 0.9, costs: 1.0 },
    resolved: false,
  },
  {
    type: 'crisis',
    title: '📋 Regulatory Audit',
    description: 'You received a notice for compliance audit.',
    impact: { revenue: 0.9, demand: 1.0, costs: 1.2 },
    resolved: false,
  },
  {
    type: 'discovery',
    title: '💡 New Customer Segment',
    description: 'You discovered an untapped customer segment nearby.',
    impact: { revenue: 1.3, demand: 1.4, costs: 1.05 },
    resolved: false,
  },
  {
    type: 'disruption',
    title: '📱 New App Launch',
    description: 'A new app is offering deep discounts in your category.',
    impact: { revenue: 0.7, demand: 0.8, costs: 1.0 },
    resolved: false,
  },
];

const SEASONALITY: Record<string, { peak: number[]; off: number[]; events: Record<number, string> }> = {
  Mumbai: { peak: [10, 11, 12], off: [6, 7], events: { 10: 'Diwali shopping', 1: 'New Year', 7: 'Monsoon sale' } },
  Delhi: { peak: [10, 11, 12, 1, 2], off: [5, 6, 7], events: { 10: 'Dussehra', 11: 'Diwali', 1: 'New Year', 5: 'Summer sale' } },
  Bangalore: { peak: [10, 11, 12, 1, 2, 3], off: [6, 7, 8], events: { 10: 'Festival season', 1: 'New Year', 6: 'Monsoon' } },
  Pune: { peak: [10, 11, 12, 1, 2], off: [6, 7], events: { 10: 'Festivals', 1: 'New Year' } },
  Goa: { peak: [10, 11, 12, 1, 2, 3], off: [6, 7, 8, 9], events: { 10: 'Tourism peak', 12: 'Christmas', 1: 'New Year' } },
  Jaipur: { peak: [10, 11, 12, 1, 2], off: [5, 6, 7], events: { 10: 'Festival tourism', 11: 'Diwali', 1: 'Winter tourism' } },
  Kochi: { peak: [10, 11, 12, 1, 2, 3], off: [6, 7, 8], events: { 10: 'Onam', 12: 'Christmas', 6: 'Monsoon' } },
};

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateDynamicNews(city: string, turn: number): DynamicNews[] {
  const news: DynamicNews[] = [];
  const numNews = randomBetween(2, 4);
  
  const categories: NewsCategory[] = ['economy', 'tech', 'local', 'competition', 'trend'];
  
  for (let i = 0; i < numNews; i++) {
    const category = randomFromArray(categories);
    const templates = NEWS_TEMPLATES[category];
    const headline = randomFromArray(templates);
    
    let sentiment = 0;
    let demandImpact = 0;
    let costImpact = 0;
    
    switch (category) {
      case 'economy':
        sentiment = Math.random() > 0.5 ? randomBetween(1, 3) / 10 : -randomBetween(1, 2) / 10;
        demandImpact = sentiment * 15;
        costImpact = sentiment > 0 ? sentiment * 5 : sentiment * 10;
        break;
      case 'tech':
        sentiment = randomBetween(2, 5) / 10;
        demandImpact = sentiment * 20;
        costImpact = sentiment * 8;
        break;
      case 'local':
        sentiment = randomBetween(-2, 5) / 10;
        demandImpact = sentiment * 25;
        costImpact = sentiment > 0 ? sentiment * 3 : sentiment * 8;
        break;
      case 'competition':
        sentiment = -randomBetween(1, 3) / 10;
        demandImpact = sentiment * 15;
        costImpact = 0;
        break;
      case 'trend':
        sentiment = randomBetween(2, 5) / 10;
        demandImpact = sentiment * 18;
        costImpact = sentiment * 5;
        break;
      default:
        sentiment = 0;
    }
    
    news.push({
      id: generateId(),
      headline: headline.replace('city', city),
      category,
      sentiment,
      impact: {
        demand: demandImpact,
        cost: costImpact,
        competition: sentiment > 0 ? -5 : sentiment < 0 ? 10 : 0,
      },
      duration: randomBetween(1, 3),
      expiresAt: turn + randomBetween(1, 3),
      city,
    });
  }
  
  return news;
}

export function getSeasonalFactors(city: string, turn: number): { 
  factor: number; 
  isPeak: boolean; 
  isOff: boolean;
  event: string | null;
} {
  const cityData = SEASONALITY[city] || SEASONALITY['Mumbai'];
  
  const isPeak = cityData.peak.includes(turn);
  const isOff = cityData.off.includes(turn);
  
  let factor = 1.0;
  if (isPeak) factor = 1.2;
  else if (isOff) factor = 0.8;
  
  const event = cityData.events[turn] || null;
  
  return { factor, isPeak, isOff, event };
}

export function getRandomEvent(turn: number, phase: Phase): RandomEvent | null {
  const eventChance = phase === 'setup' ? 0.15 : phase === 'unstable' ? 0.25 : 0.2;
  
  if (Math.random() > eventChance) return null;
  
  const event = { ...randomFromArray(RANDOM_EVENTS) };
  event.id = generateId();
  
  const baseImpact = event.impact;
  const phaseMultiplier = phase === 'setup' ? 0.7 : phase === 'unstable' ? 1.0 : phase === 'growth' ? 1.2 : 1.5;
  
  event.impact = {
    revenue: baseImpact.revenue + (Math.random() - 0.5) * 0.2 * phaseMultiplier,
    demand: baseImpact.demand + (Math.random() - 0.5) * 0.2 * phaseMultiplier,
    costs: baseImpact.costs + (Math.random() - 0.5) * 0.1 * phaseMultiplier,
  };
  
  return event;
}

export function updateMarketDynamics(
  previousDynamics: MarketDynamics | null,
  city: string,
  turn: number,
  phase: Phase,
  recentDecisions: string[]
): MarketDynamics {
  const news = previousDynamics?.news || [];
  
  const activeNews = news.filter(n => n.expiresAt > turn);
  
  const newNews = generateDynamicNews(city, turn);
  
  const allNews = [...activeNews, ...newNews].slice(-6);
  
  const seasonal = getSeasonalFactors(city, turn);
  
  let demandModifier = 50;
  let costModifier = 50;
  let competitionLevel = 50;
  
  allNews.forEach(n => {
    demandModifier += n.impact.demand;
    costModifier += n.impact.cost;
    competitionLevel += n.impact.competition;
  });
  
  if (seasonal.isPeak) demandModifier += 15;
  if (seasonal.isOff) demandModifier -= 10;
  
  demandModifier = Math.max(10, Math.min(95, demandModifier));
  costModifier = Math.max(20, Math.min(80, costModifier));
  competitionLevel = Math.max(20, Math.min(90, competitionLevel));
  
  const trendFactors = ['AI boom', 'sustainability', 'health', 'premiumization', 'digital'];
  const activeTrends = trendFactors.filter(() => Math.random() > 0.6);
  
  const randomEvent = getRandomEvent(turn, phase);
  
  return {
    timestamp: Date.now(),
    news: allNews,
    demandModifier,
    costModifier,
    competitionLevel,
    activeTrends,
    seasonalFactor: seasonal.factor,
    randomEvent,
  };
}

export function applyDecisionModifier(
  decision: string,
  currentDynamics: MarketDynamics
): MarketDynamics {
  let modified = { ...currentDynamics };
  
  switch (decision) {
    case 'marketing':
      modified.demandModifier += randomBetween(5, 15);
      modified.competitionLevel += randomBetween(5, 10);
      break;
    case 'expand':
      modified.competitionLevel += randomBetween(10, 20);
      modified.demandModifier += randomBetween(-5, 10);
      break;
    case 'hire':
      modified.demandModifier += randomBetween(3, 8);
      modified.costModifier += randomBetween(5, 12);
      break;
    case 'invest':
      modified.demandModifier += randomBetween(2, 8);
      modified.costModifier += randomBetween(-3, 5);
      break;
    case 'hold':
      modified.demandModifier += randomBetween(-5, 3);
      break;
  }
  
  modified.demandModifier = Math.max(10, Math.min(95, modified.demandModifier));
  modified.costModifier = Math.max(20, Math.min(80, modified.costModifier));
  modified.competitionLevel = Math.max(20, Math.min(90, modified.competitionLevel));
  
  return modified;
}

export function generateCityReport(dynamics: MarketDynamics): string {
  const { news, demandModifier, costModifier, competitionLevel, seasonalFactor, activeTrends } = dynamics;
  
  let report = `📊 City Market Report\n\n`;
  
  if (news.length > 0) {
    report += `📰 Latest News:\n`;
    news.slice(-3).forEach(n => {
      const emoji = n.sentiment > 0 ? '📈' : n.sentiment < 0 ? '📉' : '➡️';
      report += `${emoji} ${n.headline}\n`;
    });
    report += '\n';
  }
  
  report += `📈 Demand: ${demandModifier}/100\n`;
  report += `💰 Costs: ${costModifier}/100\n`;
  report += `🏢 Competition: ${competitionLevel}/100\n`;
  report += `🌟 Season: ${seasonalFactor > 1 ? 'PEAK' : seasonalFactor < 1 ? 'OFF' : 'NORMAL'}\n`;
  
  if (activeTrends.length > 0) {
    report += `\n🔥 Trends: ${activeTrends.join(', ')}`;
  }
  
  return report;
}
