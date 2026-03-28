from typing import Dict, List, Any

class MultiFactorAdvisor:
    def __init__(self):
        self.phase_strategies = {
            'founder': [
                {'title': 'Focus on PMF', 'description': 'Validate product-market fit first', 'priority': 'high'},
                {'title': 'Minimize costs', 'description': 'Keep fixed costs low', 'priority': 'high'},
                {'title': 'Get first customers', 'description': 'Acquire 10 paying customers', 'priority': 'medium'}
            ],
            'seed': [
                {'title': 'Build team', 'description': 'Hire first key employees', 'priority': 'high'},
                {'title': 'Establish processes', 'description': 'Create repeatable workflows', 'priority': 'medium'},
                {'title': 'Scale sales', 'description': 'Build sales pipeline', 'priority': 'medium'}
            ],
            'growth': [
                {'title': 'Aggressive marketing', 'description': 'Invest in customer acquisition', 'priority': 'high'},
                {'title': 'Expand operations', 'description': 'Scale infrastructure', 'priority': 'high'},
                {'title': 'Hire senior leadership', 'description': 'Build management team', 'priority': 'medium'}
            ],
            'scale': [
                {'title': 'Prepare for exit', 'description': 'Consider IPO or M&A', 'priority': 'medium'},
                {'title': 'Expand geography', 'description': 'Enter new markets', 'priority': 'high'},
                {'title': 'Optimize efficiency', 'description': 'Maximize unit economics', 'priority': 'medium'}
            ]
        }

    def get_recommendations(
        self,
        user: Dict,
        city: Dict,
        current_state: Dict
    ) -> Dict[str, Any]:
        phase = self._determine_phase(current_state)
        city_name = city.get('city', 'mumbai').lower()
        
        strategies = self.phase_strategies.get(phase, self.phase_strategies['founder'])
        
        context_recommendations = self._get_context_recommendations(user, city, current_state)
        
        all_recommendations = strategies + context_recommendations
        
        prioritized = sorted(all_recommendations, key=lambda x: {'high': 0, 'medium': 1, 'low': 2}.get(x.get('priority', 'low'), 2))
        
        return {
            'phase': phase,
            'city': city_name,
            'recommendations': prioritized[:5],
            'context_insights': self._generate_insights(user, city, current_state),
            'next_milestone': self._get_next_milestone(phase, current_state)
        }

    def _determine_phase(self, state: Dict) -> str:
        month = state.get('month', 1)
        if month <= 3:
            return 'founder'
        elif month <= 8:
            return 'seed'
        elif month <= 14:
            return 'growth'
        return 'scale'

    def _get_context_recommendations(
        self,
        user: Dict,
        city: Dict,
        state: Dict
    ) -> List[Dict[str, str]]:
        recommendations = []
        
        cash = state.get('cash', 0)
        costs = state.get('costs', 1)
        runway = cash / max(costs, 1)
        
        if runway < 3:
            recommendations.append({
                'title': 'Emergency cash boost',
                'description': 'Focus on immediate revenue or cost reduction',
                'priority': 'high'
            })
        
        risk = user.get('risk_appetite', 'medium')
        if risk == 'low':
            recommendations.append({
                'title': 'Conservative growth',
                'description': 'Prioritize stability over expansion',
                'priority': 'medium'
            })
        
        city_name = city.get('city', '').lower()
        if city_name == 'bangalore':
            recommendations.append({
                'title': 'Tech ecosystem leverage',
                'description': 'Connect with local startup community',
                'priority': 'medium'
            })
        
        return recommendations

    def _generate_insights(
        self,
        user: Dict,
        city: Dict,
        state: Dict
    ) -> List[str]:
        insights = []
        
        capital = user.get('capital', 100000)
        if capital > 300000:
            insights.append('Strong capital position allows for aggressive growth strategies')
        
        city_name = city.get('city', '').lower()
        city_advantages = {
            'bangalore': 'Tech talent pool and startup ecosystem',
            'mumbai': 'Large consumer market and financial services',
            'delhi': 'Large market with diverse customer base',
            'chennai': 'Manufacturing hub with skilled workforce',
            'hyderabad': 'Growing IT sector with lower costs'
        }
        
        if city_name in city_advantages:
            insights.append(f"Advantage: {city_advantages[city_name]}")
        
        month = state.get('month', 1)
        if month >= 6:
            insights.append('Business has proven viability - focus on scaling')
        
        return insights

    def _get_next_milestone(self, phase: str, state: Dict) -> Dict[str, Any]:
        milestones = {
            'founder': {'milestone': 'Product-Market Fit', 'target': '3 months'},
            'seed': {'milestone': 'Repeatable Sales', 'target': '8 months'},
            'growth': {'milestone': 'Market Leadership', 'target': '14 months'},
            'scale': {'milestone': 'IPO Ready', 'target': '18 months'}
        }
        
        return milestones.get(phase, milestones['founder'])
