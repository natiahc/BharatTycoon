from typing import Dict, List, Any

class MultiFactorRiskAnalyzer:
    def __init__(self):
        self.risk_weights = {
            'liquidity': 0.35,
            'market': 0.25,
            'operational': 0.20,
            'financial': 0.20
        }

    def analyze(
        self,
        user: Dict,
        city: Dict,
        business: Dict,
        current_metrics: Dict
    ) -> Dict[str, Any]:
        liquidity_risk = self._assess_liquidity(current_metrics)
        market_risk = self._assess_market(city, business)
        operational_risk = self._assess_operational(user, current_metrics)
        financial_risk = self._assess_financial(business, current_metrics)
        
        overall_score = (
            liquidity_risk['score'] * self.risk_weights['liquidity'] +
            market_risk['score'] * self.risk_weights['market'] +
            operational_risk['score'] * self.risk_weights['operational'] +
            financial_risk['score'] * self.risk_weights['financial']
        )
        
        risk_level = 'low' if overall_score < 0.25 else 'medium' if overall_score < 0.5 else 'high'
        
        return {
            'overall_risk_score': round(overall_score, 3),
            'risk_level': risk_level,
            'factors': {
                'liquidity': liquidity_risk,
                'market': market_risk,
                'operational': operational_risk,
                'financial': financial_risk
            },
            'warnings': self._generate_warnings(liquidity_risk, market_risk, operational_risk, financial_risk),
            'mitigations': self._suggest_mitigations(risk_level, overall_score)
        }

    def _assess_liquidity(self, metrics: Dict) -> Dict[str, Any]:
        cash = metrics.get('cash', 100000)
        monthly_costs = metrics.get('costs', 20000)
        runway = cash / monthly_costs if monthly_costs > 0 else 999
        
        if runway < 3:
            score = 0.8
            severity = 'critical'
        elif runway < 6:
            score = 0.5
            severity = 'high'
        elif runway < 12:
            score = 0.3
            severity = 'medium'
        else:
            score = 0.1
            severity = 'low'
        
        return {
            'score': score,
            'severity': severity,
            'runway_months': round(runway, 1),
            'description': f'Cash runway of {round(runway, 1)} months'
        }

    def _assess_market(self, city: Dict, business: Dict) -> Dict[str, Any]:
        city_name = city.get('city', 'mumbai').lower()
        competition_map = {'mumbai': 0.7, 'delhi': 0.65, 'bangalore': 0.6, 'chennai': 0.4, 'hyderabad': 0.35, 'kolkata': 0.45}
        competition = competition_map.get(city_name, 0.5)
        
        score = competition
        severity = 'high' if competition > 0.6 else 'medium' if competition > 0.4 else 'low'
        
        return {
            'score': score,
            'severity': severity,
            'competition_level': competition,
            'description': f'Competition level: {competition * 100:.0f}%'
        }

    def _assess_operational(self, user: Dict, metrics: Dict) -> Dict[str, Any]:
        risk_appetite = user.get('risk_appetite', 'medium')
        
        if risk_appetite == 'high':
            score = 0.6
            severity = 'medium'
        elif risk_appetite == 'medium':
            score = 0.4
            severity = 'medium'
        else:
            score = 0.2
            severity = 'low'
        
        month = metrics.get('month', 1)
        if month < 6:
            score = min(1.0, score + 0.2)
            severity = 'high' if score > 0.6 else severity
        
        return {
            'score': score,
            'severity': severity,
            'description': f'Operational risk based on business age and risk tolerance'
        }

    def _assess_financial(self, business: Dict, metrics: Dict) -> Dict[str, Any]:
        margin = business.get('profit_margin', 0.15)
        scalability = business.get('scalability', 0.5)
        
        score = 0.5 - margin + (1 - scalability) * 0.3
        score = max(0, min(1, score))
        
        severity = 'high' if score > 0.6 else 'medium' if score > 0.3 else 'low'
        
        return {
            'score': score,
            'severity': severity,
            'description': f'Financial risk based on margin and scalability'
        }

    def _generate_warnings(
        self,
        liquidity: Dict,
        market: Dict,
        operational: Dict,
        financial: Dict
    ) -> List[str]:
        warnings = []
        
        if liquidity['score'] > 0.5:
            warnings.append(f"CRITICAL: Only {liquidity['runway_months']} months cash runway!")
        if market['score'] > 0.6:
            warnings.append(f"HIGH: Strong competition in {market.get('competition_level', 0) * 100:.0f}% market")
        if operational['score'] > 0.5:
            warnings.append("MEDIUM: Early-stage business - high operational uncertainty")
        
        return warnings

    def _suggest_mitigations(self, risk_level: str, score: float) -> List[Dict[str, str]]:
        mitigations = []
        
        if score > 0.5:
            mitigations.append({
                'action': 'Build cash reserves',
                'priority': 'high',
                'impact': 'Improves liquidity risk'
            })
        if risk_level in ['high', 'medium']:
            mitigations.append({
                'action': 'Diversify revenue streams',
                'priority': 'medium',
                'impact': 'Reduces market dependency'
            })
        
        mitigations.append({
            'action': 'Maintain detailed financial tracking',
            'priority': 'low',
            'impact': 'Early warning system'
        })
        
        return mitigations
