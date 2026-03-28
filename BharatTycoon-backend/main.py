from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, List
from ai.unified_engine import UnifiedRecommendationEngine
from ai.unified_simulation import MultiFactorSimulator
from ai.unified_risk import MultiFactorRiskAnalyzer
from ai.unified_advisor import MultiFactorAdvisor

app = FastAPI(title="BharatTycoon AI API")

recommendation_engine = UnifiedRecommendationEngine()
risk_analyzer = MultiFactorRiskAnalyzer()
advisor = MultiFactorAdvisor()

class UserFactors(BaseModel):
    capital: float
    risk_appetite: str
    experience: str
    time_commitment: str
    interests: List[str]

class CityFactors(BaseModel):
    city: str
    business_type: str
    purchasing_power: float
    competition_level: float
    seasonality: List[float]

class MarketFactors(BaseModel):
    inflation_rate: float
    economic_sentiment: str
    industry_trends: List[str]

class BusinessFactors(BaseModel):
    capex: float
    working_capital: float
    profit_margin: float
    scalability: float
    failure_rate: float

class UnifiedRequest(BaseModel):
    user: UserFactors
    city: CityFactors
    market: Optional[MarketFactors] = None
    business: Optional[BusinessFactors] = None
    context: Optional[dict] = None

class SimulationRequest(BaseModel):
    user: UserFactors
    city: CityFactors
    initial_cash: float
    months: int
    decisions: Optional[List[str]] = None

class RiskRequest(BaseModel):
    user: UserFactors
    city: CityFactors
    business: BusinessFactors
    current_metrics: dict

class AdvisorRequest(BaseModel):
    user: UserFactors
    city: CityFactors
    current_state: dict

@app.get("/")
def root():
    return {"message": "BharatTycoon AI API - Business Simulation Engine"}

@app.post("/unified/recommendations")
def get_recommendations(request: UnifiedRequest):
    result = recommendation_engine.generate_recommendations(
        request.user.dict(),
        request.city.dict(),
        request.market.dict() if request.market else {},
        request.business.dict() if request.business else {}
    )
    return result

@app.post("/unified/simulate")
def run_simulation(request: SimulationRequest):
    result = recommendation_engine.simulate_journey(
        request.user.dict(),
        request.city.dict(),
        request.initial_cash,
        request.months,
        request.decisions or []
    )
    return result

@app.post("/unified/risk")
def analyze_risk(request: RiskRequest):
    result = risk_analyzer.analyze(
        request.user.dict(),
        request.city.dict(),
        request.business.dict(),
        request.current_metrics
    )
    return result

@app.post("/unified/advisor")
def get_advisor(request: AdvisorRequest):
    result = advisor.get_recommendations(
        request.user.dict(),
        request.city.dict(),
        request.current_state
    )
    return result

@app.post("/ai/profile-user")
def profile_user(data: dict):
    return {"profile": "completed", "insights": ["Risk-tolerant", "Growth-focused"]}

@app.post("/ai/match-businesses")
def match_businesses(data: dict):
    return {"matches": [{"type": "restaurant", "score": 0.92}, {"type": "retail", "score": 0.85}]}

@app.post("/ai/predict-demand")
def predict_demand(data: dict):
    return {"demand": 75000, "confidence": 0.82, "trend": "rising"}

@app.post("/ai/generate-decisions")
def generate_decisions(data: dict):
    return {"decisions": [{"id": "hire", "title": "Hire Employee"}, {"id": "market", "title": "Marketing Campaign"}]}

@app.post("/ai/legacy-analyze-risk")
def legacy_analyze_risk(data: dict):
    return {"risk_level": "medium", "score": 35, "factors": ["Low cash runway", "High competition"]}

@app.post("/ai/legacy-get-advisor")
def legacy_get_advisor(data: dict):
    return {"recommendations": [{"title": "Focus on profitability", "priority": "high"}]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
