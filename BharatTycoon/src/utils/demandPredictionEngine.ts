export interface DemandPrediction {
  month: number;
  predictedDemand: number;
  confidence: number;
  trend: 'rising' | 'stable' | 'falling';
  factors: string[];
}

export interface CityDemandProfile {
  city: string;
  baseDemand: Record<string, number>;
  seasonalFactors: number[];
  growthRate: number;
}

const CITY_DEMAND_PROFILES: Record<string, CityDemandProfile> = {
  mumbai: {
    baseDemand: {
      restaurant: 85000,
      retail: 120000,
      tech: 200000,
      grocery: 45000,
      premium_grocery: 80000,
      fitness: 35000,
      pharmacy: 28000,
      salon: 22000,
      service: 55000,
      manufacturing: 150000
    },
    seasonalFactors: [0.9, 0.92, 1.0, 1.05, 1.1, 1.15, 1.2, 1.18, 1.1, 1.05, 1.15, 1.25],
    growthRate: 0.08
  },
  delhi: {
    baseDemand: {
      restaurant: 78000,
      retail: 110000,
      tech: 180000,
      grocery: 42000,
      premium_grocery: 75000,
      fitness: 32000,
      pharmacy: 25000,
      salon: 20000,
      service: 50000,
      manufacturing: 140000
    },
    seasonalFactors: [0.85, 0.88, 0.95, 1.0, 1.05, 1.1, 1.15, 1.12, 1.05, 1.0, 1.1, 1.2],
    growthRate: 0.09
  },
  bangalore: {
    baseDemand: {
      restaurant: 72000,
      retail: 95000,
      tech: 250000,
      grocery: 38000,
      premium_grocery: 90000,
      fitness: 40000,
      pharmacy: 22000,
      salon: 18000,
      service: 65000,
      manufacturing: 120000
    },
    seasonalFactors: [0.95, 0.98, 1.0, 1.02, 1.05, 1.08, 1.1, 1.12, 1.08, 1.02, 1.0, 1.05],
    growthRate: 0.12
  },
  chennai: {
    baseDemand: {
      restaurant: 65000,
      retail: 85000,
      tech: 150000,
      grocery: 35000,
      premium_grocery: 65000,
      fitness: 28000,
      pharmacy: 20000,
      salon: 16000,
      service: 45000,
      manufacturing: 100000
    },
    seasonalFactors: [0.88, 0.92, 1.0, 1.08, 1.15, 1.2, 1.18, 1.1, 1.02, 0.98, 0.95, 0.92],
    growthRate: 0.07
  },
  hyderabad: {
    baseDemand: {
      restaurant: 60000,
      retail: 80000,
      tech: 170000,
      grocery: 32000,
      premium_grocery: 60000,
      fitness: 26000,
      pharmacy: 18000,
      salon: 14000,
      service: 42000,
      manufacturing: 95000
    },
    seasonalFactors: [0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.12, 1.08, 1.02, 0.98, 0.95, 0.95],
    growthRate: 0.1
  },
  kolkata: {
    baseDemand: {
      restaurant: 55000,
      retail: 75000,
      tech: 100000,
      grocery: 30000,
      premium_grocery: 50000,
      fitness: 22000,
      pharmacy: 16000,
      salon: 12000,
      service: 38000,
      manufacturing: 80000
    },
    seasonalFactors: [0.82, 0.85, 0.95, 1.0, 1.08, 1.12, 1.15, 1.1, 1.02, 0.95, 1.0, 1.1],
    growthRate: 0.06
  }
};

export function getCityDemandProfile(city: string): CityDemandProfile {
  return CITY_DEMAND_PROFILES[city.toLowerCase()] || CITY_DEMAND_PROFILES.mumbai;
}

export function predictDemand(
  city: string,
  businessType: string,
  currentMonth: number,
  historicalRevenue?: number
): DemandPrediction {
  const profile = getCityDemandProfile(city);
  const baseDemand = profile.baseDemand[businessType.toLowerCase()] || 50000;
  const seasonalFactor = profile.seasonalFactors[(currentMonth - 1) % 12];
  const growthFactor = 1 + (profile.growthRate * Math.floor(currentMonth / 6));
  
  const predictedDemand = baseDemand * seasonalFactor * growthFactor;
  
  const trend = profile.growthRate > 0.08 ? 'rising' : 
                profile.growthRate < 0.05 ? 'falling' : 'stable';
  
  const confidence = 0.75 + (Math.random() * 0.2);
  
  const factors = [
    `Seasonal factor: ${(seasonalFactor * 100).toFixed(0)}%`,
    `City growth rate: ${(profile.growthRate * 100).toFixed(1)}%`,
    `Market demand baseline: ₹${(baseDemand / 1000).toFixed(0)}K`
  ];
  
  return {
    month: currentMonth,
    predictedDemand: Math.round(predictedDemand),
    confidence: Math.round(confidence * 100) / 100,
    trend,
    factors
  };
}

export function predictMultiMonthDemand(
  city: string,
  businessType: string,
  startMonth: number,
  months: number
): DemandPrediction[] {
  return Array.from({ length: months }, (_, i) => {
    return predictDemand(city, businessType, startMonth + i);
  });
}
