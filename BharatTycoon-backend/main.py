from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(title="BharatTycoon AI API - Powered by HuggingFace Transformers")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy import to avoid blocking startup
recommendation_engine = None
risk_analyzer = None
advisor = None
ml_engine_instance = None

def get_recommendation_engine():
    global recommendation_engine
    if recommendation_engine is None:
        from ai.unified_engine import UnifiedRecommendationEngine
        recommendation_engine = UnifiedRecommendationEngine()
    return recommendation_engine

def get_risk_analyzer():
    global risk_analyzer
    if risk_analyzer is None:
        from ai.unified_risk import MultiFactorRiskAnalyzer
        risk_analyzer = MultiFactorRiskAnalyzer()
    return risk_analyzer

def get_advisor():
    global advisor
    if advisor is None:
        from ai.unified_advisor import MultiFactorAdvisor
        advisor = MultiFactorAdvisor()
    return advisor

def get_ml_engine():
    global ml_engine_instance
    if ml_engine_instance is None:
        from ai.ml_engine import BharatTycoonMLEngine
        ml_engine_instance = BharatTycoonMLEngine()
    return ml_engine_instance

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
    engine = get_recommendation_engine()
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
    result = get_recommendation_engine().generate_dynamic_recommendations(
        capital=request.user.capital,
        risk_appetite=request.user.risk_appetite,
        city=request.city.city,
        user_interests=request.user.interests
    )
    return result

@app.post("/unified/simulate")
def run_simulation(request: SimulationRequest):
    result = get_recommendation_engine().simulate_journey(
        request.user.dict(),
        request.city.dict(),
        request.initial_cash,
        request.months,
        request.decisions or []
    )
    return result

@app.post("/unified/risk")
def analyze_risk(request: RiskRequest):
    result = get_risk_analyzer().analyze(
        request.user.dict(),
        request.city.dict(),
        request.business.dict(),
        request.current_metrics
    )
    return result

@app.post("/unified/advisor")
def get_advisor_advice(request: AdvisorRequest):
    result = get_advisor().get_recommendations(
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

@app.post("/user/feedback")
def submit_feedback(data: dict):
    """Store user feedback/suggestions"""
    import json
    from datetime import datetime
    
    feedback = {
        "timestamp": datetime.now().isoformat(),
        "data": data
    }
    
    # Store in memory (in production, use a database)
    if not hasattr(app, 'feedbacks'):
        app.feedbacks = []
    
    app.feedbacks.append(feedback)
    
    # Also append to file for persistence
    try:
        with open("feedback.json", "a") as f:
            f.write(json.dumps(feedback) + "\n")
    except:
        pass
    
    return {"status": "saved", "total": len(app.feedbacks)}

@app.get("/user/feedback")
def get_feedback():
    """Get all feedback (admin only)"""
    return {"feedbacks": getattr(app, 'feedbacks', [])}


# ============================================
# HUGGINGFACE ML ENDPOINTS
# ============================================

@app.get("/ml/status")
def get_ml_status():
    """Get status of all ML models"""
    status = get_ml_engine().get_status()
    return {
        "ml_engine": "BharatTycoon ML Engine",
        "powered_by": "HuggingFace Transformers",
        "status": status,
        "message": "All ML models are ready!" if status['initialized'] else "ML models loading on first use..."
    }


@app.get("/ml/initialize")
def initialize_ml_models():
    """Initialize all ML models (loads them into memory)"""
    results = get_ml_engine().initialize_all()
    return {
        "initialized": results,
        "total_models": len(results),
        "ready": all(results.values()) if results else False,
        "message": "All ML models initialized successfully!" if all(results.values()) else "Some models failed to load. Check logs."
    }


@app.get("/ml/search")
def ml_smart_search(q: str, top_k: int = 5):
    """
    Semantic search using sentence-transformers.
    Example: "delhi cafe" will find Delhi restaurants
    """
    results = get_ml_engine().smart_search(q, top_k)
    return {
        "query": results['query'],
        "search_type": results['type'],
        "results": results['results'],
        "processing_time_ms": results.get('processing_time_ms', 0),
        "models_used": ["all-MiniLM-L6-v2"] if results['type'] == 'semantic' else []
    }


@app.post("/ml/analyze-news")
def ml_analyze_news(news: List[str]):
    """
    AI-powered news analysis using multiple HuggingFace models.
    - Sentiment Analysis (nlptown/bert-base-multilingual-uncased-sentiment)
    - Named Entity Recognition (dslim/bert-base-NER)
    - Text Summarization (sshleifer/distilbart-cnn-12-6)
    - Zero-shot Classification (facebook/bart-large-mnli)
    """
    if not news:
        raise HTTPException(status_code=400, detail="No news articles provided")
    
    results = get_ml_engine().news_intelligence.analyze_news_article(news[0])
    
    return {
        "total_articles": len(news),
        "first_article_analysis": results,
        "models_used": [
            "nlptown/bert-base-multilingual-uncased-sentiment",
            "dslim/bert-base-NER",
            "sshleifer/distilbart-cnn-12-6",
            "facebook/bart-large-mnli"
        ]
    }


@app.post("/ml/analyze-city-news")
def ml_analyze_city_news(city: str, news: List[str]):
    """
    Full AI analysis of city news including trend detection.
    """
    results = get_ml_engine().analyze_city_news(city, news)
    return results


@app.get("/ml/city-similarity")
def ml_city_similarity(city: str):
    """
    Get embedding-based similarity between cities.
    Uses sentence-transformers to find semantically similar cities.
    """
    viz_data = get_ml_engine().get_embedding_viz(city)
    return viz_data


@app.get("/ml/sentiment")
def ml_sentiment(text: str):
    """
    Analyze sentiment of text using BERT-based model.
    """
    result = get_ml_engine().news_intelligence.analyze_sentiment(text)
    return {
        "text": text[:200],
        "sentiment": result,
        "model": "nlptown/bert-base-multilingual-uncased-sentiment"
    }


@app.get("/ml/entities")
def ml_entities(text: str):
    """
    Extract named entities using BERT NER.
    """
    result = get_ml_engine().news_intelligence.extract_entities(text)
    return {
        "text": text[:200],
        "entities": result,
        "model": "dslim/bert-base-NER"
    }


@app.get("/ml/summarize")
def ml_summarize(text: str, max_length: int = 50):
    """
    Summarize text using DistilBART.
    """
    result = get_ml_engine().news_intelligence.summarize_text(text, max_length)
    return {
        "original_text": text[:500],
        "summary": result,
        "model": "sshleifer/distilbart-cnn-12-6"
    }


@app.get("/ml/classify")
def ml_classify(text: str):
    """
    Zero-shot classify text into business categories.
    """
    result = get_ml_engine().news_intelligence.classify_business_category(text)
    return {
        "text": text[:200],
        "classification": result,
        "model": "facebook/bart-large-mnli"
    }


# ============================================
# FINANCIAL SYSTEM ENDPOINTS
# ============================================

class FinancialReportRequest(BaseModel):
    business_type: str  # restaurant, retail, tech, salon, tuition, manufacturing, transport, healthcare
    city_tier: int  # 1 = Tier 1 (Mumbai, Delhi), 2 = Tier 2, 3 = Tier 3
    initial_capital: float
    months: int = 12


class FinancialCompareRequest(BaseModel):
    business_types: List[str]
    city_tier: int
    initial_capital: float


@app.get("/financial/status")
def get_financial_status():
    """Check financial system status"""
    return {
        "financial_system": "Active",
        "available_business_types": ["restaurant", "retail", "tech", "salon", "tuition", "manufacturing", "transport", "healthcare"],
        "city_tiers": {
            "1": "Tier 1 (Mumbai, Delhi, Bangalore, etc.)",
            "2": "Tier 2 (Jaipur, Lucknow, etc.)",
            "3": "Tier 3 (Smaller cities)"
        }
    }


@app.post("/financial/report")
def generate_financial_report(request: FinancialReportRequest):
    """
    Generate complete financial report for a business.
    Returns balance sheet, income statement, cash flow, and financial ratios.
    """
    from ai.financial_system import generate_financial_report as gen_report
    
    result = gen_report(
        business_type=request.business_type,
        city_tier=request.city_tier,
        initial_capital=request.initial_capital,
        months=request.months
    )
    
    return {
        "report_type": "Financial Report",
        "business_type": request.business_type,
        "city_tier": request.city_tier,
        "initial_capital": request.initial_capital,
        **result
    }


@app.post("/financial/compare")
def compare_businesses(request: FinancialCompareRequest):
    """
    Compare financial projections across multiple business types.
    """
    from ai.financial_system import BusinessFinancials
    
    comparisons = []
    
    for biz_type in request.business_types:
        try:
            bf = BusinessFinancials(biz_type, request.city_tier, request.initial_capital)
            monthly = bf.calculate_monthly(12, growth_rate=0.05)
            comparisons.append({
                "business_type": biz_type,
                "month_12": {
                    "revenue": monthly["summary"]["revenue"],
                    "net_profit": monthly["summary"]["net_profit"],
                    "profit_margin": monthly["summary"]["profit_margin"],
                    "net_worth": monthly["summary"]["net_worth"],
                    "cash_on_hand": monthly["summary"]["cash_on_hand"]
                },
                "ratios": monthly["financial_ratios"],
                "roi": round((monthly["summary"]["net_profit"] / request.initial_capital) * 100, 2)
            })
        except Exception as e:
            comparisons.append({
                "business_type": biz_type,
                "error": str(e)
            })
    
    # Sort by ROI
    valid_comparisons = [c for c in comparisons if "error" not in c]
    if valid_comparisons:
        valid_comparisons.sort(key=lambda x: x.get("roi", 0), reverse=True)
    
    return {
        "city_tier": request.city_tier,
        "initial_capital": request.initial_capital,
        "comparisons": comparisons,
        "recommendation": valid_comparisons[0] if valid_comparisons else None
    }


@app.get("/financial/breakdown/{business_type}")
def get_financial_breakdown(business_type: str, city_tier: int = 1, capital: float = 100000):
    """
    Get monthly financial breakdown for a business type.
    """
    from ai.financial_system import BusinessFinancials
    
    try:
        bf = BusinessFinancials(business_type, city_tier, capital)
        monthly_data = []
        
        for month in range(1, 13):
            growth = 0.03 if month <= 6 else 0.05
            report = bf.calculate_monthly(month, growth_rate=growth)
            monthly_data.append({
                "month": month,
                "revenue": report["summary"]["revenue"],
                "expenses": report["summary"]["expenses"],
                "net_profit": report["summary"]["net_profit"],
                "profit_margin": report["summary"]["profit_margin"],
                "net_worth": report["summary"]["net_worth"],
                "cash": report["summary"]["cash_on_hand"]
            })
        
        return {
            "business_type": business_type,
            "city_tier": city_tier,
            "initial_capital": capital,
            "monthly_data": monthly_data,
            "annual_summary": {
                "total_revenue": sum(m["revenue"] for m in monthly_data),
                "total_expenses": sum(m["expenses"] for m in monthly_data),
                "total_profit": sum(m["net_profit"] for m in monthly_data),
                "ending_net_worth": monthly_data[-1]["net_worth"],
                "overall_roi": round((monthly_data[-1]["net_worth"] - capital) / capital * 100, 2)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/financial/profit-loss")
def get_profit_loss(data: dict):
    """
    Calculate profit/loss based on custom revenue and expenses.
    """
    revenue = data.get("revenue", 0)
    expenses = data.get("expenses", {})
    
    total_expenses = sum(expenses.values())
    net_profit = revenue - total_expenses
    
    return {
        "revenue": revenue,
        "expenses": expenses,
        "total_expenses": total_expenses,
        "net_profit": round(net_profit, 2),
        "profit_margin": round((net_profit / revenue * 100) if revenue > 0 else 0, 2),
        "status": "profitable" if net_profit > 0 else "loss" if net_profit < 0 else "break_even"
    }


# ============================================
# AI TEXT GENERATION ENDPOINTS
# ============================================

@app.get("/ai/generate-advice")
def ai_generate_advice(context: str):
    """
    Generate AI-powered business advice using GPT-2.
    Example: "starting a restaurant in Mumbai" or "franchise opportunity"
    """
    result = get_ml_engine().text_generation.generate_business_advice(context)
    return {
        "context": context,
        "advice": result.get('advice', 'AI unavailable'),
        "model": result.get('model', 'unknown')
    }


@app.get("/ai/marketing-copy")
def ai_marketing_copy(product: str, tone: str = "professional"):
    """
    Generate marketing copy using AI.
    Tone options: professional, friendly, urgent, premium
    """
    result = get_ml_engine().text_generation.generate_marketing_copy(product, tone)
    return {
        "product": product,
        "tone": tone,
        "tagline": result.get('tagline', 'AI unavailable'),
        "description": result.get('description', ''),
        "model": result.get('model', 'unknown')
    }


@app.get("/ai/business-names")
def ai_business_names(business_type: str, keywords: str = ""):
    """
    Generate creative business names using AI.
    Example: business_type="restaurant", keywords="modern,authentic"
    """
    kw_list = [k.strip() for k in keywords.split(',')] if keywords else None
    result = get_ml_engine().text_generation.generate_business_name(business_type, kw_list)
    return {
        "business_type": business_type,
        "keywords": kw_list,
        "suggested_names": result.get('names', []),
        "model": result.get('model', 'unknown')
    }


# ============================================
# AI TRANSLATION ENDPOINTS
# ============================================

@app.get("/ai/translate")
def ai_translate(text: str, target: str = "hi"):
    """
    Translate text to Hindi or other languages.
    Supported: hi (Hindi), bn (Bengali), ta (Tamil), te (Telugu), mr (Marathi)
    """
    lang_map = {"hi": "Hindi", "bn": "Bengali", "ta": "Tamil", "te": "Telugu", 
                "mr": "Marathi", "gu": "Gujarati", "kn": "Kannada"}
    result = get_ml_engine().translation.translate(text, 'en', target)
    return {
        "original": result.get('original', text),
        "translated": result.get('translated', 'AI unavailable'),
        "target_language": lang_map.get(target, target),
        "model": result.get('model', 'unknown')
    }


@app.get("/ai/translate-to-hindi")
def ai_translate_hindi(text: str):
    """Quick endpoint to translate English to Hindi"""
    result = get_ml_engine().translation.translate_to_hindi(text)
    return {
        "original": result.get('original', text),
        "hindi": result.get('translated', 'AI unavailable'),
        "model": result.get('model', 'unknown')
    }


@app.get("/ai/languages")
def ai_supported_languages():
    """Get list of supported translation languages"""
    from ai.ml_engine import TranslationEngine
    return {
        "languages": TranslationEngine.LANGUAGES
    }


# ============================================
# AI Q&A ENDPOINTS
# ============================================

@app.get("/ai/answer-question")
def ai_answer_question(question: str, topic: str = ""):
    """
    Get AI answers to business-related questions.
    Topics: restaurant, retail, tech, salon, tuition, manufacturing
    """
    result = get_ml_engine().qa.answer_question(question, topic or None)
    return {
        "question": result.get('question', question),
        "answer": result.get('answer', 'AI unavailable'),
        "confidence": result.get('confidence', 0),
        "topic": result.get('topic', topic),
        "model": result.get('model', 'unknown')
    }


@app.get("/ai/business-faq")
def ai_business_faq(topic: str):
    """
    Get pre-loaded FAQ answers for business topics.
    """
    engine = get_ml_engine()
    if not engine.qa.initialize():
        return {"error": "AI unavailable"}
    
    context = engine.qa._context_cache.get(topic.lower(), 
        "Topic not available. Try: restaurant, retail, tech, salon, tuition, manufacturing")
    
    return {
        "topic": topic,
        "context": context,
        "questions_to_ask": [
            f"What are the profit margins for {topic}?",
            f"How much to invest in {topic}?",
            f"What are the risks of {topic} business?"
        ]
    }


# ============================================
# ML TRENDS ENDPOINT
# ============================================

@app.post("/ml/trends")
def ml_detect_trends(news: List[dict]):
    """
    Detect emerging trends from news articles using AI.
    """
    articles = [n.get('title', '') for n in news if n.get('title')]
    if not articles:
        raise HTTPException(status_code=400, detail="No news titles provided")
    
    trend_results = get_ml_engine().trend_detector.analyze_trends([{'title': t} for t in articles])
    return {
        "articles_analyzed": len(articles),
        "trends": trend_results
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
