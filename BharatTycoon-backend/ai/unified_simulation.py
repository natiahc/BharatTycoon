from typing import Dict, List, Any
import random

class MultiFactorSimulator:
    def __init__(self):
        self.phase_configs = {
            'founder': {'duration': 3, 'risk_multiplier': 1.2, 'growth_factor': 0.6},
            'seed': {'duration': 5, 'risk_multiplier': 1.0, 'growth_factor': 1.0},
            'growth': {'duration': 6, 'risk_multiplier': 0.9, 'growth_factor': 1.5},
            'scale': {'duration': 4, 'risk_multiplier': 0.8, 'growth_factor': 2.0}
        }
        
    def get_phase(self, month: int) -> str:
        if month <= 3:
            return 'founder'
        elif month <= 8:
            return 'seed'
        elif month <= 14:
            return 'growth'
        return 'scale'

    def calculate_impact(
        self,
        decision: str,
        month: int,
        user: Dict,
        city: Dict
    ) -> Dict[str, float]:
        phase = self.get_phase(month)
        config = self.phase_configs[phase]
        
        base_impacts = {
            'hire': {'revenue': 15000, 'costs': 25000, 'risk': 0.1},
            'marketing': {'revenue': 30000, 'costs': 20000, 'risk': 0.05},
            'expand': {'revenue': 50000, 'costs': 100000, 'risk': 0.3},
            'upgrade': {'revenue': 20000, 'costs': 50000, 'risk': 0.15},
            'partner': {'revenue': 25000, 'costs': 5000, 'risk': 0.08}
        }
        
        impact = base_impacts.get(decision, {'revenue': 0, 'costs': 0, 'risk': 0})
        
        risk_appetite = user.get('risk_appetite', 'medium')
        if risk_appetite == 'high':
            impact['revenue'] *= 1.2
            impact['risk'] *= 1.1
        elif risk_appetite == 'low':
            impact['revenue'] *= 0.9
            impact['risk'] *= 0.8
        
        impact['revenue'] *= config['growth_factor']
        impact['risk'] *= config['risk_multiplier']
        
        return impact

    def simulate_month(
        self,
        current_state: Dict,
        decision: str,
        user: Dict,
        city: Dict
    ) -> Dict[str, Any]:
        month = current_state.get('month', 1)
        
        impact = {'revenue': 0, 'costs': 0, 'cash': 0, 'risk': 0}
        if decision:
            impact = self.calculate_impact(decision, month, user, city)
        
        base_revenue = current_state.get('revenue', current_state.get('cash', 100000) * 0.3)
        base_costs = current_state.get('costs', current_state.get('cash', 100000) * 0.2)
        
        new_revenue = int(base_revenue * (1 + impact['revenue'] / max(base_revenue, 1)))
        new_costs = int(base_costs + impact['costs'])
        new_cash = max(0, current_state.get('cash', 0) + impact['cash'] + (new_revenue - new_costs) * 0.3)
        
        return {
            'month': month + 1,
            'revenue': new_revenue,
            'costs': new_costs,
            'cash': new_cash,
            'profit': new_revenue - new_costs,
            'phase': self.get_phase(month + 1)
        }

    def simulate_journey(
        self,
        user: Dict,
        city: Dict,
        initial_cash: float,
        months: int,
        decisions: List[str]
    ) -> Dict[str, Any]:
        state = {
            'month': 0,
            'cash': initial_cash,
            'revenue': 0,
            'costs': initial_cash * 0.15,
            'profit': -initial_cash * 0.15
        }
        
        history = [state.copy()]
        
        for i in range(months):
            decision = decisions[i] if i < len(decisions) else 'none'
            state = self.simulate_month(state, decision, user, city)
            history.append(state.copy())
        
        return {
            'history': history,
            'final_state': state,
            'outcome': 'success' if state['cash'] > initial_cash else 'failure',
            'months_survived': months
        }
