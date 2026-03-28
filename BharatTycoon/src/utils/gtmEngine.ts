export interface GTMStrategy {
  name: string;
  description: string;
  channels: string[];
  estimatedCost: number;
  expectedReach: number;
  timeline: string;
  bestFor: string[];
}

export const GTM_STRATEGIES: Record<string, GTMStrategy[]> = {
  mumbai: [
    {
      name: 'Local Community Marketing',
      description: 'Target local neighborhoods with hyperlocal ads and community events',
      channels: ['local_newspapers', 'community_boards', 'whatsapp_groups', 'local_radio'],
      estimatedCost: 15000,
      expectedReach: 25000,
      timeline: '2-4 weeks',
      bestFor: ['restaurant', 'grocery', 'retail', 'salon']
    },
    {
      name: 'Digital-First B2B',
      description: 'Leverage LinkedIn and industry forums for B2B customer acquisition',
      channels: ['linkedin', 'google_ads', 'industry_portals', 'email_outreach'],
      estimatedCost: 35000,
      expectedReach: 40000,
      timeline: '4-8 weeks',
      bestFor: ['tech', 'service', 'manufacturing']
    },
    {
      name: 'Premium Brand Building',
      description: 'Focus on brand prestige through premium publications and events',
      channels: ['magazine_ads', 'event_sponsorships', 'influencer_partnerships', 'pr'],
      estimatedCost: 50000,
      expectedReach: 60000,
      timeline: '8-12 weeks',
      bestFor: ['premium_grocery', 'fitness', 'pharmacy']
    }
  ],
  delhi: [
    {
      name: 'Multi-Channel Retail',
      description: 'Combine physical retail presence with digital marketing',
      channels: ['local_ads', 'google_maps', 'whatsapp_business', 'marketplace'],
      estimatedCost: 25000,
      expectedReach: 35000,
      timeline: '3-6 weeks',
      bestFor: ['retail', 'grocery', 'premium_grocery']
    },
    {
      name: 'Startup Ecosystem Outreach',
      description: 'Connect with Delhi NCR startup community for B2B opportunities',
      channels: ['startup_events', 'linkedin', 'coworking_networks', 'incubators'],
      estimatedCost: 20000,
      expectedReach: 20000,
      timeline: '4-6 weeks',
      bestFor: ['tech', 'service']
    }
  ],
  bangalore: [
    {
      name: 'Tech Community Integration',
      description: 'Engage with Bangalore tech community through meetups and online forums',
      channels: ['meetup_groups', 'twitter', 'linkedin', 'tech blogs', 'podcasts'],
      estimatedCost: 30000,
      expectedReach: 50000,
      timeline: '4-8 weeks',
      bestFor: ['tech', 'service']
    },
    {
      name: 'Premium Urban Strategy',
      description: 'Target affluent Bangalore neighborhoods with premium positioning',
      channels: ['instagram', 'influencer_marketing', 'luxury_events', 'colive_community'],
      estimatedCost: 45000,
      expectedReach: 55000,
      timeline: '6-10 weeks',
      bestFor: ['premium_grocery', 'fitness', 'restaurant']
    }
  ],
  chennai: [
    {
      name: 'Tamil Media Focus',
      description: 'Target Tamil-speaking audience through regional media',
      channels: ['tamil_newspapers', 'tamil_tv', 'whatsapp_groups', 'local_radio'],
      estimatedCost: 18000,
      expectedReach: 30000,
      timeline: '3-5 weeks',
      bestFor: ['restaurant', 'grocery', 'retail', 'salon']
    }
  ],
  hyderabad: [
    {
      name: 'IT Corridor Targeting',
      description: 'Focus on IT professionals in HITEC City and surrounding areas',
      channels: ['office_park_ads', 'linkedin', 'food_delivery_apps', 'google_ads'],
      estimatedCost: 22000,
      expectedReach: 35000,
      timeline: '3-6 weeks',
      bestFor: ['restaurant', 'tech', 'fitness', 'service']
    }
  ],
  kolkata: [
    {
      name: 'Bengali Community Marketing',
      description: 'Leverage strong community bonds in Kolkata',
      channels: ['bengali_newspapers', 'community_events', 'whatsapp', 'local_hoardings'],
      estimatedCost: 15000,
      expectedReach: 25000,
      timeline: '3-5 weeks',
      bestFor: ['restaurant', 'grocery', 'retail']
    }
  ]
};

export function getGTMStrategies(city: string, businessType: string): GTMStrategy[] {
  const cityStrategies = GTM_STRATEGIES[city.toLowerCase()] || GTM_STRATEGIES.mumbai;
  
  return cityStrategies.filter(strategy => 
    strategy.bestFor.includes(businessType.toLowerCase())
  );
}

export function getRecommendedGTM(
  city: string,
  businessType: string,
  budget: number,
  phase: string
): GTMStrategy | null {
  let strategies = getGTMStrategies(city, businessType);
  
  if (phase === 'founder') {
    strategies = strategies.filter(s => s.estimatedCost <= 25000);
  }
  
  strategies = strategies.filter(s => s.estimatedCost <= budget);
  
  if (strategies.length === 0) {
    return null;
  }
  
  return strategies[0];
}
