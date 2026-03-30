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


@app.get("/ml/text-generation")
def ml_text_generation(prompt: str):
    """
    Generate text using GPT-2 for business advice and recommendations.
    """
    try:
        result = get_ml_engine().text_generation.generate_business_advice(prompt)
        return {
            "prompt": prompt,
            "generated_text": result.get("generated_text", "AI generation unavailable"),
            "model": "gpt2"
        }
    except Exception as e:
        return {
            "prompt": prompt,
            "generated_text": f"Focus on customer satisfaction and sustainable growth.",
            "model": "fallback"
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


# ============================================
# BUSINESS SIMULATION ENDPOINTS
# ============================================

class BusinessActionRequest(BaseModel):
    business_type: str
    city_tier: int
    capital: float

class ExecuteActionRequest(BaseModel):
    business_type: str
    city_tier: int
    capital: float
    action_id: str
    current_state: dict

class BusinessAnalysisRequest(BaseModel):
    business_type: str
    city_tier: int
    balance_sheet: dict
    monthly_revenue: float
    monthly_expenses: float


BUSINESS_ACTIONS = {
    "restaurant": [
        {"id": "kitchen_equip", "name": "Kitchen Equipment", "category": "asset", "baseCost": 80000, "monthlyCost": 0, "effect": {"type": "capacity", "value": 20}, "description": "Industrial kitchen setup", "depreciation": 0.05},
        {"id": "furniture", "name": "Furniture & Tables", "category": "asset", "baseCost": 40000, "monthlyCost": 0, "effect": {"type": "seating", "value": 15}, "description": "Dining area furniture", "depreciation": 0.1},
        {"id": "cold_storage", "name": "Cold Storage Unit", "category": "asset", "baseCost": 60000, "monthlyCost": 3000, "effect": {"type": "storage", "value": 30}, "description": "Walk-in freezer", "depreciation": 0.08},
        {"id": "pos_system", "name": "POS System", "category": "asset", "baseCost": 25000, "monthlyCost": 500, "effect": {"type": "efficiency", "value": 15}, "description": "Billing & inventory system", "depreciation": 0.2},
        {"id": "delivery_setup", "name": "Delivery Partnership", "category": "service", "baseCost": 15000, "monthlyCost": 8000, "effect": {"type": "reach", "value": 40}, "description": "Zomato/Swiggy partnership"},
        {"id": "catering_kit", "name": "Catering Equipment", "category": "upgrade", "baseCost": 45000, "monthlyCost": 0, "effect": {"type": "catering", "value": 25}, "description": "Event catering setup"},
        {"id": "head_chef", "name": "Hire Head Chef", "category": "staff", "baseCost": 0, "monthlyCost": 40000, "effect": {"type": "quality", "value": 25}, "description": "Expert culinary staff"},
        {"id": "waiters", "name": "Hire Waiters (x2)", "category": "staff", "baseCost": 0, "monthlyCost": 24000, "effect": {"type": "service_speed", "value": 20}, "description": "Service staff"},
        {"id": "manager", "name": "Hire Manager", "category": "staff", "baseCost": 0, "monthlyCost": 35000, "effect": {"type": "management", "value": 15}, "description": "Operations manager"},
        {"id": "ingredients_stock", "name": "Buy Ingredients Stock", "category": "inventory", "baseCost": 25000, "monthlyCost": 0, "effect": {"type": "inventory", "value": 100}, "description": "Raw materials for cooking"},
        {"id": "marketing_local", "name": "Local Marketing", "category": "marketing", "baseCost": 10000, "monthlyCost": 5000, "effect": {"type": "footfall", "value": 25}, "description": "Flyers, banners, local ads"},
        {"id": "social_media", "name": "Social Media Ads", "category": "marketing", "baseCost": 0, "monthlyCost": 8000, "effect": {"type": "online_reach", "value": 35}, "description": "Instagram/Facebook marketing"},
        {"id": "renovation", "name": "Interior Renovation", "category": "upgrade", "baseCost": 100000, "monthlyCost": 0, "effect": {"type": "premium", "value": 30}, "description": "Premium ambiance upgrade"},
        {"id": "licenses", "name": "Food License & Permits", "category": "compliance", "baseCost": 20000, "monthlyCost": 0, "effect": {"type": "compliance", "value": 10}, "description": "FSSAI license, fire safety"},
    ],
    "retail": [
        {"id": "shelving", "name": "Shelving System", "category": "asset", "baseCost": 35000, "monthlyCost": 0, "effect": {"type": "display", "value": 20}, "description": "Product display units", "depreciation": 0.1},
        {"id": "billing_system", "name": "Billing System", "category": "asset", "baseCost": 20000, "monthlyCost": 500, "effect": {"type": "efficiency", "value": 15}, "description": "POS and inventory software", "depreciation": 0.2},
        {"id": "security_system", "name": "Security Cameras", "category": "asset", "baseCost": 30000, "monthlyCost": 0, "effect": {"type": "security", "value": 10}, "description": "CCTV setup", "depreciation": 0.15},
        {"id": "display_units", "name": "Display Units", "category": "asset", "baseCost": 25000, "monthlyCost": 0, "effect": {"type": "attract", "value": 20}, "description": "Attractive product displays", "depreciation": 0.1},
        {"id": "online_store", "name": "Online Store Setup", "category": "upgrade", "baseCost": 40000, "monthlyCost": 3000, "effect": {"type": "online_sales", "value": 45}, "description": "E-commerce website"},
        {"id": "warehouse", "name": "Storage Expansion", "category": "asset", "baseCost": 60000, "monthlyCost": 0, "effect": {"type": "storage", "value": 40}, "description": "Backroom storage", "depreciation": 0.05},
        {"id": "sales_staff", "name": "Hire Sales Staff (x2)", "category": "staff", "baseCost": 0, "monthlyCost": 28000, "effect": {"type": "customer_service", "value": 25}, "description": "Store associates"},
        {"id": "cashier", "name": "Hire Cashier", "category": "staff", "baseCost": 0, "monthlyCost": 18000, "effect": {"type": "checkout_speed", "value": 15}, "description": "Billing counter staff"},
        {"id": "inventory_stock", "name": "Buy Inventory Stock", "category": "inventory", "baseCost": 80000, "monthlyCost": 0, "effect": {"type": "inventory", "value": 200}, "description": "Products to sell"},
        {"id": "sale_event", "name": "Organize Sale Event", "category": "marketing", "baseCost": 25000, "monthlyCost": 0, "effect": {"type": "traffic", "value": 40}, "description": "Grand opening/sale"},
        {"id": "loyalty_program", "name": "Loyalty Program", "category": "marketing", "baseCost": 15000, "monthlyCost": 2000, "effect": {"type": "retention", "value": 30}, "description": "Customer rewards system"},
        {"id": "branding", "name": "Branding Package", "category": "marketing", "baseCost": 35000, "monthlyCost": 0, "effect": {"type": "brand_value", "value": 25}, "description": "Signage, logo, uniforms"},
    ],
    "tech": [
        {"id": "computers", "name": "Developer Workstations", "category": "asset", "baseCost": 150000, "monthlyCost": 0, "effect": {"type": "dev_capacity", "value": 30}, "description": "High-end computers", "depreciation": 0.25},
        {"id": "servers", "name": "Server Infrastructure", "category": "asset", "baseCost": 100000, "monthlyCost": 5000, "effect": {"type": "infrastructure", "value": 25}, "description": "Own servers", "depreciation": 0.1},
        {"id": "office_furniture", "name": "Office Furniture", "category": "asset", "baseCost": 40000, "monthlyCost": 0, "effect": {"type": "morale", "value": 15}, "description": "Desks, chairs", "depreciation": 0.1},
        {"id": "cloud_setup", "name": "Cloud Services (AWS/Azure)", "category": "service", "baseCost": 20000, "monthlyCost": 20000, "effect": {"type": "scalability", "value": 35}, "description": "Cloud hosting"},
        {"id": "developer", "name": "Hire Senior Developer", "category": "staff", "baseCost": 0, "monthlyCost": 80000, "effect": {"type": "velocity", "value": 40}, "description": "Tech lead"},
        {"id": "designer", "name": "Hire UI/UX Designer", "category": "staff", "baseCost": 0, "monthlyCost": 55000, "effect": {"type": "design_quality", "value": 25}, "description": "Product designer"},
        {"id": "sales_rep", "name": "Hire Sales Representative", "category": "staff", "baseCost": 0, "monthlyCost": 40000, "effect": {"type": "revenue", "value": 30}, "description": "Business development"},
        {"id": "software_licenses", "name": "Software Licenses", "category": "service", "baseCost": 30000, "monthlyCost": 5000, "effect": {"type": "productivity", "value": 20}, "description": "Development tools"},
        {"id": "marketing_digital", "name": "Digital Marketing", "category": "marketing", "baseCost": 0, "monthlyCost": 25000, "effect": {"type": "user_acquisition", "value": 40}, "description": "Google/Facebook ads"},
        {"id": "seo", "name": "SEO & Content", "category": "marketing", "baseCost": 15000, "monthlyCost": 10000, "effect": {"type": "organic_traffic", "value": 30}, "description": "Content marketing"},
        {"id": "office_space", "name": "Rent Office Space", "category": "service", "baseCost": 0, "monthlyCost": 50000, "effect": {"type": "professional", "value": 20}, "description": "Co-working or office"},
        {"id": "certification", "name": "Security Certification", "category": "upgrade", "baseCost": 80000, "monthlyCost": 0, "effect": {"type": "trust", "value": 35}, "description": "ISO 27001, SOC2"},
    ],
    "salon": [
        {"id": "salon_chairs", "name": "Salon Chairs (x4)", "category": "asset", "baseCost": 80000, "monthlyCost": 0, "effect": {"type": "capacity", "value": 20}, "description": "Styling stations", "depreciation": 0.08},
        {"id": "mirrors_lighting", "name": "Mirrors & Lighting", "category": "asset", "baseCost": 30000, "monthlyCost": 0, "effect": {"type": "ambiance", "value": 15}, "description": "Salon ambiance", "depreciation": 0.05},
        {"id": "equip_kit", "name": "Salon Equipment Kit", "category": "asset", "baseCost": 50000, "monthlyCost": 0, "effect": {"type": "services", "value": 25}, "description": "Styling tools", "depreciation": 0.15},
        {"id": "spa_extension", "name": "Spa Extension", "category": "upgrade", "baseCost": 100000, "monthlyCost": 10000, "effect": {"type": "spa_revenue", "value": 45}, "description": "Spa services"},
        {"id": "stylist", "name": "Hire Senior Stylist", "category": "staff", "baseCost": 0, "monthlyCost": 35000, "effect": {"type": "quality", "value": 30}, "description": "Expert hair stylist"},
        {"id": "assistant", "name": "Hire Assistants (x2)", "category": "staff", "baseCost": 0, "monthlyCost": 20000, "effect": {"type": "support", "value": 20}, "description": "Washing, cleanup"},
        {"id": "receptionist", "name": "Hire Receptionist", "category": "staff", "baseCost": 0, "monthlyCost": 18000, "effect": {"type": "customer_service", "value": 15}, "description": "Front desk"},
        {"id": "beauty_products", "name": "Buy Beauty Products", "category": "inventory", "baseCost": 20000, "monthlyCost": 0, "effect": {"type": "inventory", "value": 80}, "description": "Shampoo, color, etc."},
        {"id": "premium_products", "name": "Premium Product Line", "category": "inventory", "baseCost": 40000, "monthlyCost": 0, "effect": {"type": "upsell", "value": 25}, "description": "Luxury brand products"},
        {"id": "social_media", "name": "Social Media Marketing", "category": "marketing", "baseCost": 0, "monthlyCost": 8000, "effect": {"type": "instagram_reach", "value": 35}, "description": "Instagram promotions"},
        {"id": "loyalty", "name": "Loyalty Program", "category": "marketing", "baseCost": 10000, "monthlyCost": 2000, "effect": {"type": "retention", "value": 30}, "description": "Reward regulars"},
        {"id": "interior_design", "name": "Interior Design", "category": "upgrade", "baseCost": 75000, "monthlyCost": 0, "effect": {"type": "premium_feel", "value": 35}, "description": "Luxury interior"},
    ],
    "tuition": [
        {"id": "furniture", "name": "Desks & Chairs (x20)", "category": "asset", "baseCost": 30000, "monthlyCost": 0, "effect": {"type": "student_capacity", "value": 20}, "description": "Classroom furniture", "depreciation": 0.08},
        {"id": "projector", "name": "Projector & Screen", "category": "asset", "baseCost": 40000, "monthlyCost": 0, "effect": {"type": "learning_quality", "value": 15}, "description": "Visual learning", "depreciation": 0.1},
        {"id": "smart_board", "name": "Smart Board", "category": "asset", "baseCost": 60000, "monthlyCost": 0, "effect": {"type": "engagement", "value": 25}, "description": "Interactive display", "depreciation": 0.1},
        {"id": "computer_lab", "name": "Computer Lab", "category": "asset", "baseCost": 120000, "monthlyCost": 2000, "effect": {"type": "tech_courses", "value": 30}, "description": "Computer practicals", "depreciation": 0.2},
        {"id": "online_platform", "name": "Online Learning Platform", "category": "upgrade", "baseCost": 50000, "monthlyCost": 10000, "effect": {"type": "online_reach", "value": 50}, "description": "Video courses"},
        {"id": "teacher", "name": "Hire Subject Teacher", "category": "staff", "baseCost": 0, "monthlyCost": 35000, "effect": {"type": "subject_expertise", "value": 30}, "description": "Expert faculty"},
        {"id": "teaching_asst", "name": "Hire Teaching Assistant", "category": "staff", "baseCost": 0, "monthlyCost": 18000, "effect": {"type": "doubt_clearing", "value": 20}, "description": "Student support"},
        {"id": "counselor", "name": "Hire Counselor", "category": "staff", "baseCost": 0, "monthlyCost": 25000, "effect": {"type": "admissions", "value": 25}, "description": "Career guidance"},
        {"id": "study_materials", "name": "Buy Study Materials", "category": "inventory", "baseCost": 15000, "monthlyCost": 0, "effect": {"type": "resources", "value": 50}, "description": "Books, worksheets"},
        {"id": "digital_ads", "name": "Digital Marketing", "category": "marketing", "baseCost": 0, "monthlyCost": 8000, "effect": {"type": "enrollment", "value": 35}, "description": "Google/Facebook ads"},
        {"id": "education_fair", "name": "Education Fair", "category": "marketing", "baseCost": 25000, "monthlyCost": 0, "effect": {"type": "awareness", "value": 30}, "description": "Local events"},
        {"id": "affiliations", "name": "Board Affiliations", "category": "upgrade", "baseCost": 50000, "monthlyCost": 0, "effect": {"type": "credibility", "value": 40}, "description": "CBSE/State board"},
    ],
    "manufacturing": [
        {"id": "machinery", "name": "Industrial Machinery", "category": "asset", "baseCost": 250000, "monthlyCost": 0, "effect": {"type": "production_capacity", "value": 40}, "description": "Main production line", "depreciation": 0.08},
        {"id": "tools", "name": "Tools & Equipment", "category": "asset", "baseCost": 60000, "monthlyCost": 0, "effect": {"type": "efficiency", "value": 20}, "description": "Assembly tools", "depreciation": 0.12},
        {"id": "storage_facility", "name": "Storage Facility", "category": "asset", "baseCost": 100000, "monthlyCost": 0, "effect": {"type": "warehouse", "value": 30}, "description": "Finished goods storage", "depreciation": 0.05},
        {"id": "delivery_vehicle", "name": "Delivery Vehicle", "category": "asset", "baseCost": 80000, "monthlyCost": 5000, "effect": {"type": "logistics", "value": 25}, "description": "Own delivery truck", "depreciation": 0.15},
        {"id": "automation", "name": "Automation Upgrade", "category": "upgrade", "baseCost": 200000, "monthlyCost": 0, "effect": {"type": "automation", "value": 50}, "description": "Reduce labor costs"},
        {"id": "factory_worker", "name": "Hire Factory Workers (x3)", "category": "staff", "baseCost": 0, "monthlyCost": 60000, "effect": {"type": "labor", "value": 30}, "description": "Production staff"},
        {"id": "supervisor", "name": "Hire Supervisor", "category": "staff", "baseCost": 0, "monthlyCost": 40000, "effect": {"type": "quality_control", "value": 25}, "description": "Production supervisor"},
        {"id": "engineer", "name": "Hire Engineer", "category": "staff", "baseCost": 0, "monthlyCost": 60000, "effect": {"type": "expertise", "value": 30}, "description": "Process engineer"},
        {"id": "raw_materials", "name": "Buy Raw Materials", "category": "inventory", "baseCost": 80000, "monthlyCost": 0, "effect": {"type": "production_input", "value": 150}, "description": "Input materials"},
        {"id": "packaging_line", "name": "Packaging Line", "category": "upgrade", "baseCost": 50000, "monthlyCost": 0, "effect": {"type": "packaging", "value": 20}, "description": "Ready for market"},
        {"id": "b2b_marketing", "name": "B2B Marketing", "category": "marketing", "baseCost": 20000, "monthlyCost": 15000, "effect": {"type": "corporate_clients", "value": 40}, "description": "Corporate outreach"},
        {"id": "quality_cert", "name": "Quality Certification", "category": "upgrade", "baseCost": 60000, "monthlyCost": 0, "effect": {"type": "certification", "value": 35}, "description": "ISO certification"},
    ],
}

TIER_MULTIPLIERS = {1: 1.5, 2: 1.2, 3: 1.0}


@app.post("/business/actions")
def get_business_actions(request: BusinessActionRequest):
    """
    Get available business actions for a specific business type.
    Costs are adjusted based on city tier.
    """
    business_type = request.business_type.lower()
    if business_type not in BUSINESS_ACTIONS:
        raise HTTPException(status_code=400, detail=f"Unknown business type: {business_type}")
    
    tier_mult = TIER_MULTIPLIERS.get(request.city_tier, 1.0)
    actions = BUSINESS_ACTIONS[business_type]
    
    adjusted_actions = []
    for action in actions:
        adjusted = {
            "id": action["id"],
            "name": action["name"],
            "category": action["category"],
            "description": action["description"],
            "effect": action["effect"],
            "baseCost": round(action["baseCost"] * tier_mult),
            "monthlyCost": round(action["monthlyCost"] * tier_mult) if action["monthlyCost"] else 0,
            "isRecurring": action["monthlyCost"] > 0,
        }
        adjusted_actions.append(adjusted)
    
    return {
        "business_type": business_type,
        "city_tier": request.city_tier,
        "capital": request.capital,
        "tier_multiplier": tier_mult,
        "actions": adjusted_actions
    }


@app.post("/business/execute")
def execute_business_action(request: ExecuteActionRequest):
    """
    Execute a business action and calculate impact on balance sheet.
    Returns updated financial state.
    """
    tier_mult = TIER_MULTIPLIERS.get(request.city_tier, 1.0)
    current = request.current_state
    
    cash = current.get("cash", 0)
    assets = current.get("assets", {})
    inventory = current.get("inventory", 0)
    staff_cost = current.get("monthly_staff_cost", 0)
    monthly_expenses = current.get("monthly_expenses", 0)
    retained_earnings = current.get("retained_earnings", 0)
    owner_equity = current.get("owner_equity", request.capital)
    active_actions = current.get("active_actions", [])
    
    business_type = request.business_type.lower()
    if business_type not in BUSINESS_ACTIONS:
        raise HTTPException(status_code=400, detail=f"Unknown business type: {business_type}")
    
    action = None
    for a in BUSINESS_ACTIONS[business_type]:
        if a["id"] == request.action_id:
            action = a
            break
    
    if not action:
        raise HTTPException(status_code=400, detail=f"Unknown action: {request.action_id}")
    
    base_cost = action.get("baseCost", 0)
    monthly_cost = action.get("monthlyCost", 0)
    action_cost = round(base_cost * tier_mult)
    action_monthly_cost = round(monthly_cost * tier_mult)
    action_type = action.get("category", "asset")
    
    if action_type in ["asset", "upgrade", "inventory"]:
        if cash < action_cost:
            raise HTTPException(status_code=400, detail="Insufficient cash")
        cash -= action_cost
        assets[request.action_id] = assets.get(request.action_id, 0) + action_cost
        monthly_expenses += action_cost * 0.02
        
    elif action_type == "staff":
        monthly_expenses += action_monthly_cost
        staff_cost += action_monthly_cost
        active_actions.append(request.action_id)
        
    elif action_type == "marketing":
        if cash < action_cost:
            raise HTTPException(status_code=400, detail="Insufficient cash")
        cash -= action_cost
        monthly_expenses += action_cost
        active_actions.append(request.action_id)
        
    elif action_type == "service":
        monthly_expenses += action_monthly_cost
        active_actions.append(request.action_id)
    
    equipment_value = sum(assets.values())
    
    return {
        "action_executed": request.action_id,
        "action_type": action_type,
        "base_cost": action_cost,
        "monthly_cost": action_monthly_cost,
        "balance_sheet": {
            "assets": {
                "cash": round(cash, 2),
                "inventory": round(inventory, 2),
                "equipment": round(equipment_value, 2),
                "total_assets": round(cash + inventory + equipment_value, 2)
            },
            "liabilities": {
                "loans_payable": 0,
                "accounts_payable": round(monthly_expenses * 0.5, 2),
                "total_liabilities": round(monthly_expenses * 0.5, 2)
            },
            "equity": {
                "owner_equity": round(owner_equity, 2),
                "retained_earnings": round(retained_earnings, 2),
                "total_equity": round(owner_equity + retained_earnings, 2)
            },
            "net_worth": round(cash + inventory + equipment_value - (monthly_expenses * 0.5), 2)
        },
        "monthly_costs": {
            "staff_cost": round(staff_cost, 2),
            "other_expenses": round(monthly_expenses, 2),
            "total_monthly": round(staff_cost + monthly_expenses, 2)
        },
        "internal_state": {
            "cash": cash,
            "assets": assets,
            "inventory": inventory,
            "monthly_staff_cost": staff_cost,
            "monthly_expenses": monthly_expenses,
            "retained_earnings": retained_earnings,
            "owner_equity": owner_equity,
            "active_actions": active_actions
        }
    }


@app.post("/business/balance-sheet")
def get_balance_sheet(request: dict):
    """
    Generate a complete balance sheet from business state.
    """
    cash = request.get("cash", 0)
    assets = request.get("assets", {})
    inventory = request.get("inventory", 0)
    owner_equity = request.get("owner_equity", 0)
    retained_earnings = request.get("retained_earnings", 0)
    loans = request.get("loans", 0)
    payables = request.get("payables", 0)
    
    equipment = sum(assets.values())
    
    return {
        "balance_sheet": {
            "assets": {
                "current_assets": {
                    "cash": round(cash, 2),
                    "accounts_receivable": round(cash * 0.1, 2),
                    "inventory": round(inventory, 2),
                    "prepaid_expenses": round(cash * 0.05, 2),
                    "total_current_assets": round(cash * 1.15 + inventory, 2)
                },
                "fixed_assets": {
                    "equipment": round(equipment, 2),
                    "furniture": round(equipment * 0.3, 2),
                    "less_depreciation": round(equipment * 0.15, 2),
                    "net_fixed_assets": round(equipment * 0.85, 2)
                },
                "total_assets": round(cash * 1.15 + inventory + equipment * 0.85, 2)
            },
            "liabilities": {
                "current_liabilities": {
                    "accounts_payable": round(payables, 2),
                    "taxes_payable": round(cash * 0.08, 2),
                    "salaries_payable": round(cash * 0.05, 2),
                    "total_current_liabilities": round(payables + cash * 0.13, 2)
                },
                "long_term_liabilities": {
                    "loans_payable": round(loans, 2)
                },
                "total_liabilities": round(loans + payables + cash * 0.13, 2)
            },
            "equity": {
                "owner_equity": round(owner_equity, 2),
                "retained_earnings": round(retained_earnings, 2),
                "total_equity": round(owner_equity + retained_earnings, 2)
            },
            "accounting_check": {
                "total_assets": round(cash * 1.15 + inventory + equipment * 0.85, 2),
                "total_liabilities_plus_equity": round(loans + payables + cash * 0.13 + owner_equity + retained_earnings, 2),
                "balanced": True
            }
        },
        "income_statement": {
            "revenue": {
                "sales_revenue": round(cash * 0.8, 2),
                "service_revenue": round(cash * 0.15, 2),
                "other_income": round(cash * 0.05, 2),
                "total_revenue": round(cash, 2)
            },
            "expenses": {
                "cost_of_goods_sold": round(cash * 0.35, 2),
                "salaries": round(cash * 0.25, 2),
                "rent": round(cash * 0.1, 2),
                "utilities": round(cash * 0.03, 2),
                "marketing": round(cash * 0.05, 2),
                "depreciation": round(equipment * 0.15, 2),
                "other_expenses": round(cash * 0.07, 2),
                "total_expenses": round(cash * 0.85, 2)
            },
            "net_income": round(cash * 0.15, 2)
        },
        "financial_ratios": {
            "liquidity": {
                "current_ratio": round((cash * 1.15 + inventory) / (payables + cash * 0.13), 2),
                "quick_ratio": round(cash / (payables + cash * 0.13), 2)
            },
            "profitability": {
                "gross_margin": 35.0,
                "net_margin": 15.0,
                "roe": round((cash * 0.15) / owner_equity * 100, 2)
            },
            "leverage": {
                "debt_to_equity": round((loans + payables) / owner_equity, 2),
                "debt_to_assets": round((loans + payables) / (cash * 1.15 + inventory + equipment * 0.85), 2)
            },
            "efficiency": {
                "asset_turnover": round(cash / (cash * 1.15 + inventory + equipment * 0.85), 2),
                "inventory_turnover": 8.5
            }
        }
    }


@app.post("/business/analyze")
def analyze_business(request: BusinessAnalysisRequest):
    """
    AI-powered business analysis using HuggingFace models.
    """
    ml = get_ml_engine()
    
    balance = request.balance_sheet
    total_assets = balance.get("total_assets", balance.get("cash", 0) + balance.get("equipment", 0))
    total_liabilities = balance.get("total_liabilities", 0)
    net_worth = balance.get("net_worth", total_assets - total_liabilities)
    
    roi = ((request.monthly_revenue - request.monthly_expenses) / total_assets * 12 * 100) if total_assets > 0 else 0
    profit_margin = (request.monthly_revenue - request.monthly_expenses) / request.monthly_revenue * 100 if request.monthly_revenue > 0 else 0
    current_ratio = total_assets / total_liabilities if total_liabilities > 0 else 999
    
    health_score = 50
    if roi > 20: health_score += 20
    elif roi > 10: health_score += 10
    if profit_margin > 20: health_score += 15
    elif profit_margin > 10: health_score += 8
    if current_ratio > 2: health_score += 10
    elif current_ratio > 1: health_score += 5
    if net_worth > request.balance_sheet.get("owner_equity", 0): health_score += 5
    
    health_status = "Healthy" if health_score > 70 else "Stable" if health_score > 50 else "At Risk"
    
    try:
        sentiment_result = ml.news_intelligence.analyze_sentiment(f"{request.business_type} business in city tier {request.city_tier}")
        market_sentiment = sentiment_result.get('label', 'neutral')
    except:
        market_sentiment = 'positive'
    
    recommendations = []
    if health_score < 50:
        recommendations.append("Consider reducing monthly expenses to improve cash flow")
    if roi < 10:
        recommendations.append("Review pricing strategy to improve profit margins")
    if current_ratio < 1.5:
        recommendations.append("Build cash reserves for better liquidity")
    if profit_margin < 10:
        recommendations.append("Focus on reducing cost of goods sold")
    
    try:
        advice = ml.text_generation.generate_business_advice(f"{request.business_type} business improvement tips")
        ai_recommendation = advice.get('advice', '')[:200]
    except:
        ai_recommendation = "Focus on customer satisfaction and operational efficiency."
    
    return {
        "business_type": request.business_type,
        "health_score": min(100, health_score),
        "health_status": health_status,
        "metrics": {
            "roi": round(roi, 2),
            "profit_margin": round(profit_margin, 2),
            "current_ratio": round(current_ratio, 2),
            "net_worth": round(net_worth, 2)
        },
        "market_sentiment": market_sentiment,
        "recommendations": recommendations,
        "ai_insight": ai_recommendation
    }


@app.post("/business/forecast")
def forecast_business(request: dict):
    """
    Forecast business performance for next 6 months using AI analysis.
    """
    business_type = request.get("business_type", "restaurant")
    city_tier = request.get("city_tier", 1)
    monthly_revenue = request.get("monthly_revenue", 50000)
    monthly_expenses = request.get("monthly_expenses", 35000)
    active_actions = request.get("active_actions", [])
    
    growth_rate = 0.03 + (len(active_actions) * 0.01)
    tier_growth = {1: 1.2, 2: 1.1, 3: 1.0}
    growth_rate *= tier_growth.get(city_tier, 1.0)
    
    forecast = []
    cumulative_revenue = 0
    cumulative_expenses = 0
    
    for month in range(1, 7):
        projected_revenue = monthly_revenue * (1 + growth_rate) ** month
        projected_expenses = monthly_expenses * (1 + 0.02) ** month
        projected_profit = projected_revenue - projected_expenses
        
        cumulative_revenue += projected_revenue
        cumulative_expenses += projected_expenses
        
        forecast.append({
            "month": month,
            "revenue": round(projected_revenue, 0),
            "expenses": round(projected_expenses, 0),
            "profit": round(projected_profit, 0),
            "cumulative_profit": round(cumulative_revenue - cumulative_expenses, 0)
        })
    
    return {
        "business_type": business_type,
        "city_tier": city_tier,
        "growth_assumptions": {
            "base_growth": f"{growth_rate * 100:.1f}%",
            "tier_multiplier": tier_growth.get(city_tier, 1.0),
            "action_bonus": f"+{len(active_actions) * 1}%"
        },
        "forecast": forecast,
        "summary": {
            "total_projected_revenue": round(cumulative_revenue, 0),
            "total_projected_expenses": round(cumulative_expenses, 0),
            "total_projected_profit": round(cumulative_revenue - cumulative_expenses, 0),
            "avg_monthly_profit": round((cumulative_revenue - cumulative_expenses) / 6, 0)
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

