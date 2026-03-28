import random
from typing import Dict, List, Any

class UnifiedRecommendationEngine:
    def __init__(self):
        self.city_data = {
            'mumbai': {
                'base_demand': 85000,
                'growth_rate': 0.08,
                'competition': 0.7,
                'purchasing_power': 0.85
            },
            'delhi': {
                'base_demand': 78000,
                'growth_rate': 0.09,
                'competition': 0.65,
                'purchasing_power': 0.8
            },
            'bangalore': {
                'base_demand': 90000,
                'growth_rate': 0.12,
                'competition': 0.6,
                'purchasing_power': 0.9
            },
            'chennai': {
                'base_demand': 65000,
                'growth_rate': 0.07,
                'competition': 0.4,
                'purchasing_power': 0.75
            },
            'hyderabad': {
                'base_demand': 60000,
                'growth_rate': 0.1,
                'competition': 0.35,
                'purchasing_power': 0.72
            },
            'kolkata': {
                'base_demand': 55000,
                'growth_rate': 0.06,
                'competition': 0.45,
                'purchasing_power': 0.65
            }
        }

    def combine_all_factors(
        self,
        user: Dict,
        city: Dict,
        market: Dict,
        business: Dict
    ) -> float:
        user_score = self._score_user(user)
        city_score = self._score_city(city)
        market_score = self._score_market(market)
        business_score = self._score_business(business)

        weights = {'user': 0.25, 'city': 0.35, 'market': 0.15, 'business': 0.25}
        
        combined = (
            user_score * weights['user'] +
            city_score * weights['city'] +
            market_score * weights['market'] +
            business_score * weights['business']
        )
        return combined

    def _score_user(self, user: Dict) -> float:
        score = 0.5
        if user.get('risk_appetite') == 'high':
            score += 0.2
        elif user.get('risk_appetite') == 'low':
            score -= 0.1
        
        if user.get('experience') == 'expert':
            score += 0.2
        elif user.get('experience') == 'beginner':
            score -= 0.1
        
        capital = user.get('capital', 100000)
        score += min(0.3, capital / 1000000)
        
        return max(0, min(1, score))

    def _score_city(self, city: Dict) -> float:
        city_name = city.get('city', 'mumbai').lower()
        city_info = self.city_data.get(city_name, self.city_data['mumbai'])
        
        score = city_info['growth_rate'] * 5
        score += (1 - city_info['competition']) * 0.3
        score += city_info['purchasing_power'] * 0.2
        
        business_type = city.get('business_type', '').lower()
        if 'tech' in business_type and city_name == 'bangalore':
            score += 0.2
        elif 'restaurant' in business_type and city_name == 'mumbai':
            score += 0.15
        
        return max(0, min(1, score))

    def _score_market(self, market: Dict) -> float:
        if not market:
            return 0.5
        
        score = 0.5
        inflation = market.get('inflation_rate', 0.05)
        score -= inflation * 2
        
        sentiment = market.get('economic_sentiment', 'neutral')
        if sentiment == 'positive':
            score += 0.2
        elif sentiment == 'negative':
            score -= 0.2
        
        return max(0, min(1, score))

    def _score_business(self, business: Dict) -> float:
        if not business:
            return 0.5
        
        score = 0.5
        margin = business.get('profit_margin', 0.15)
        score += margin * 2
        
        scalability = business.get('scalability', 0.5)
        score += scalability * 0.3
        
        failure_rate = business.get('failure_rate', 0.3)
        score -= failure_rate * 0.5
        
        return max(0, min(1, score))

    def generate_recommendations(
        self,
        user: Dict,
        city: Dict,
        market: Dict,
        business: Dict
    ) -> Dict[str, Any]:
        combined_score = self.combine_all_factors(user, city, market, business)
        
        business_type = city.get('business_type', 'service')
        
        recommendations = []
        
        if combined_score > 0.7:
            recommendations.extend([
                {
                    'id': 'expand',
                    'title': 'Aggressive Expansion',
                    'description': 'Market conditions favor rapid growth',
                    'priority': 'high'
                },
                {
                    'id': 'invest',
                    'title': 'Investment Mode',
                    'description': 'Consider scaling operations',
                    'priority': 'medium'
                }
            ])
        elif combined_score > 0.5:
            recommendations.extend([
                {
                    'id': 'steady',
                    'title': 'Steady Growth',
                    'description': 'Maintain current trajectory',
                    'priority': 'medium'
                },
                {
                    'id': 'optimize',
                    'title': 'Optimize Operations',
                    'description': 'Focus on efficiency',
                    'priority': 'low'
                }
            ])
        else:
            recommendations.extend([
                {
                    'id': 'cautious',
                    'title': 'Cautious Approach',
                    'description': 'Focus on survival and stability',
                    'priority': 'high'
                },
                {
                    'id': 'reduce_costs',
                    'title': 'Cost Reduction',
                    'description': 'Reduce expenses to preserve cash',
                    'priority': 'high'
                }
            ])
        
        return {
            'combined_score': round(combined_score, 3),
            'score_breakdown': {
                'user': round(self._score_user(user), 3),
                'city': round(self._score_city(city), 3),
                'market': round(self._score_market(market), 3),
                'business': round(self._score_business(business), 3)
            },
            'recommendations': recommendations,
            'business_type': business_type,
            'estimated_success_rate': round(combined_score * 100, 1)
        }

    def simulate_journey(
        self,
        user: Dict,
        city: Dict,
        initial_cash: float,
        months: int,
        decisions: List[str]
    ) -> Dict[str, Any]:
        cash = initial_cash
        revenue = 0
        costs = initial_cash * 0.15
        monthly_states = []
        
        for month in range(1, months + 1):
            revenue = initial_cash * 0.3 * (1 + month * 0.05)
            costs = initial_cash * 0.2
            
            if month <= len(decisions):
                decision = decisions[month - 1]
                if decision == 'expand':
                    costs += 50000
                    revenue *= 1.3
                elif decision == 'invest':
                    costs += 30000
                    revenue *= 1.15
            
            profit = revenue - costs
            cash += profit
            
            monthly_states.append({
                'month': month,
                'revenue': round(revenue),
                'costs': round(costs),
                'profit': round(profit),
                'cash': round(cash)
            })
        
        final_state = monthly_states[-1] if monthly_states else {}
        
        return {
            'initial_cash': initial_cash,
            'final_cash': round(cash),
            'total_revenue': sum(s['revenue'] for s in monthly_states),
            'total_profit': sum(s['profit'] for s in monthly_states),
            'monthly_states': monthly_states,
            'outcome': 'success' if cash > initial_cash else 'failure'
        }
