export interface WorkingCapitalMetrics {
  receivables: number;
  payables: number;
  inventory: number;
  netWorkingCapital: number;
  currentRatio: number;
  quickRatio: number;
  cashConversionDays: number;
}

export interface WorkingCapitalConfig {
  receivableDays: number;
  payableDays: number;
  inventoryDays: number;
}

const INDUSTRY_CONFIGS: Record<string, WorkingCapitalConfig> = {
  restaurant: { receivableDays: 7, payableDays: 30, inventoryDays: 14 },
  retail: { receivableDays: 15, payableDays: 45, inventoryDays: 30 },
  manufacturing: { receivableDays: 30, payableDays: 60, inventoryDays: 45 },
  service: { receivableDays: 30, payableDays: 30, inventoryDays: 0 },
  tech: { receivableDays: 45, payableDays: 30, inventoryDays: 0 },
  grocery: { receivableDays: 7, payableDays: 21, inventoryDays: 7 },
  premium_grocery: { receivableDays: 14, payableDays: 21, inventoryDays: 10 },
  pharmacy: { receivableDays: 7, payableDays: 30, inventoryDays: 21 },
  salon: { receivableDays: 0, payableDays: 30, inventoryDays: 30},
  fitness: { receivableDays: 30, payableDays: 30, inventoryDays: 0}
};

export function getWorkingCapitalConfig(businessType: string): WorkingCapitalConfig {
  const key = Object.keys(INDUSTRY_CONFIGS).find(k => 
    businessType.toLowerCase().includes(k)
  );
  return key ? INDUSTRY_CONFIGS[key] : INDUSTRY_CONFIGS.service;
}

export function calculateWorkingCapital(
  monthlyRevenue: number,
  monthlyCosts: number,
  businessType: string
): WorkingCapitalMetrics {
  const config = getWorkingCapitalConfig(businessType);
  
  const receivables = (monthlyRevenue * config.receivableDays) / 30;
  const payables = (monthlyCosts * config.payableDays) / 30;
  const inventory = (monthlyCosts * config.inventoryDays) / 30;
  
  const netWorkingCapital = receivables + inventory - payables;
  const currentAssets = receivables + inventory;
  const currentLiabilities = payables;
  
  const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 2;
  const quickRatio = currentLiabilities > 0 ? receivables / currentLiabilities : 1.5;
  
  const cashConversionDays = config.receivableDays + config.inventoryDays - config.payableDays;
  
  return {
    receivables: Math.round(receivables),
    payables: Math.round(payables),
    inventory: Math.round(inventory),
    netWorkingCapital: Math.round(netWorkingCapital),
    currentRatio: Math.round(currentRatio * 100) / 100,
    quickRatio: Math.round(quickRatio * 100) / 100,
    cashConversionDays: Math.round(cashConversionDays)
  };
}

export function assessWorkingCapitalHealth(metrics: WorkingCapitalMetrics): {
  health: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  if (metrics.currentRatio < 1) {
    issues.push('Current ratio below 1 - liquidity risk');
    recommendations.push('Accelerate receivables collection');
  }
  
  if (metrics.quickRatio < 0.8) {
    issues.push('Quick ratio below 0.8 - immediate liquidity concern');
    recommendations.push('Negotiate better payment terms with suppliers');
  }
  
  if (metrics.cashConversionDays > 60) {
    issues.push('Cash conversion cycle too long');
    recommendations.push('Reduce inventory levels');
  }
  
  if (metrics.netWorkingCapital < 0) {
    issues.push('Negative working capital');
    recommendations.push('Review pricing and cost structure');
  }
  
  const health = issues.length === 0 ? 'healthy' : issues.length === 1 ? 'warning' : 'critical';
  
  return { health, issues, recommendations };
}
