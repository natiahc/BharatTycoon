from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from ai.unified_engine import UnifiedRecommendationEngine
from ai.unified_simulation import MultiFactorSimulator
from ai.unified_risk import MultiFactorRiskAnalyzer
from ai.unified_advisor import MultiFactorAdvisor

app = FastAPI(title="BharatTycoon AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/india/states")
def get_india_states():
    """Get all Indian states (lightweight - just names)"""
    from ai.live_trends import INDIAN_STATES_DATA
    return {
        "states": [
            {"id": state_id, "name": state_data["name"], "city_count": len(state_data["cities"])}
            for state_id, state_data in INDIAN_STATES_DATA.items()
        ]
    }

@app.get("/india/states/{state_id}")
def get_state_cities(state_id: str):
    """Get cities for a specific state"""
    from ai.live_trends import INDIAN_STATES_DATA
    state_data = INDIAN_STATES_DATA.get(state_id.lower().replace(" ", "_"))
    if not state_data:
        return {"error": "State not found"}, 404
    return {
        "state": state_data["name"],
        "cities": [{"id": city.lower().replace(" ", "-"), "name": city.title()} for city in state_data["cities"]]
    }

@app.get("/india/search")
def search_locations(q: str):
    """Search states/cities dynamically"""
    from ai.live_trends import INDIAN_STATES_DATA
    q = q.lower()
    results = {"states": [], "cities": []}
    
    # Search states
    for state_id, state_data in INDIAN_STATES_DATA.items():
        if q in state_data["name"].lower():
            results["states"].append({"id": state_id, "name": state_data["name"]})
        
        # Search cities in each state
        for city in state_data["cities"]:
            if q in city.lower():
                results["cities"].append({
                    "id": city.lower().replace(" ", "-"),
                    "name": city.title(),
                    "state": state_data["name"]
                })
    
    return results

@app.get("/india/cities")
def get_all_cities():
    """Get all cities"""
    engine = UnifiedRecommendationEngine()
    return {
        "cities": [
            {
                "id": city_id,
                "name": city_data["name"],
                "state": city_data.get("state", ""),
                "tier": city_data.get("tier", 3)
            }
            for city_id, city_data in engine.city_data.items()
        ]
    }

@app.get("/news/{city}")
def get_city_news(city: str):
    from ai.live_trends import trends_service
    city_data = trends_service.get_city_live_data(city)
    trends = trends_service.fetch_live_trends()
    return {
        "city": city,
        "headlines": city_data.get("news", []),
        "trends": trends[:3],
        "timestamp": str(datetime.now())
    }

@app.get("/economic/indicators")
def get_economic_indicators():
    from ai.live_trends import trends_service
    return trends_service.fetch_economic_indicators()

@app.post("/unified/recommendations")
def get_recommendations(request: UnifiedRequest):
    result = recommendation_engine.generate_dynamic_recommendations(
        capital=request.user.capital,
        risk_appetite=request.user.risk_appetite,
        city=request.city.city,
        user_interests=request.user.interests
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
