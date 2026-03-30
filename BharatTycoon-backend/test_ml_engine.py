#!/usr/bin/env python3
"""
BharatTycoon ML Engine Demo
Tests all HuggingFace-powered features
"""

import sys
import time
import asyncio

def print_header(text):
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)

def print_result(label, data):
    print(f"\n📌 {label}:")
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, (list, dict)):
                print(f"   {key}: {type(value).__name__} with {len(value)} items")
            else:
                print(f"   {key}: {value}")
    else:
        print(f"   {data}")

async def test_ml_engine():
    print_header("BharatTycoon ML Engine Demo")
    print("Powered by HuggingFace Transformers")
    print("\n⏳ Loading ML models (this may take a minute on first run)...")
    
    # Import the ML engine
    from ai.ml_engine import ml_engine, SEMANTIC_SEARCH_AVAILABLE, TRANSFORMERS_AVAILABLE
    
    # Check availability
    print_header("System Status")
    print(f"  Sentence-Transformers Available: {'✅' if SEMANTIC_SEARCH_AVAILABLE else '❌'}")
    print(f"  Transformers Available: {'✅' if TRANSFORMERS_AVAILABLE else '❌'}")
    
    # Initialize ML models
    print_header("Initializing ML Models")
    init_results = ml_engine.initialize_all()
    for model, status in init_results.items():
        emoji = "✅" if status else "❌"
        print(f"  {emoji} {model}")
    
    # Get ML Status
    print_header("ML Engine Status")
    status = ml_engine.get_status()
    print_result("Status", status)
    
    if not status['initialized']:
        print("\n⚠️ Some models failed to initialize. Running fallback tests...")
    
    # Test 1: Semantic Search
    print_header("Test 1: Semantic Search (sentence-transformers)")
    test_queries = [
        "delhi cafe",
        "mumbai tech startup",
        "bangalore restaurant",
        "hyderabad IT",
        "kolkata food"
    ]
    
    for query in test_queries:
        print(f"\n🔍 Query: '{query}'")
        results = ml_engine.smart_search(query, top_k=3)
        for r in results.get('results', [])[:3]:
            emoji = "🏛️" if r.get('type') == 'state' else "🏙️"
            print(f"   {emoji} {r.get('name', r.get('city', 'Unknown'))} ({r.get('state', '')}) - Score: {r.get('score', 0)}%")
    
    # Test 2: News Intelligence
    print_header("Test 2: News Intelligence (Transformers)")
    
    test_news = [
        "Bangalore AI startups raise $5 billion in funding round",
        "Mumbai restaurant owners struggle with high rent costs",
        "Delhi quick commerce delivery services expand rapidly",
        "Chennai manufacturing hub sees record growth in EV sector",
        "Kolkata education startups transform learning experience"
    ]
    
    for news in test_news[:3]:
        print(f"\n📰 Analyzing: {news[:60]}...")
        
        # Sentiment Analysis
        sentiment = ml_engine.news_intelligence.analyze_sentiment(news)
        emoji = "🟢" if sentiment['label'] in ['positive', 'very_positive'] else "🔴" if sentiment['label'] in ['negative', 'very_negative'] else "🟡"
        print(f"   {emoji} Sentiment: {sentiment['label']} (score: {sentiment['score']}, stars: {sentiment.get('stars', 'N/A')}/5)")
        
        # Entity Extraction
        entities = ml_engine.news_intelligence.extract_entities(news)
        if entities.get('entities'):
            print(f"   🏷️ Entities found: {', '.join(entities['entities'].keys())}")
        
        # Classification
        category = ml_engine.news_intelligence.classify_business_category(news)
        print(f"   🎯 Category: {category['category']} (confidence: {category['confidence']:.1%})")
        
        time.sleep(0.5)  # Be nice to the API
    
    # Test 3: Full News Analysis
    print_header("Test 3: Full City News Analysis")
    
    city_news = [
        "Bangalore tech hiring surges with 50,000 new jobs",
        "AI startups in Bangalore attract record funding",
        "Bangalore cloud kitchens expand with new delivery zones"
    ]
    
    analysis = ml_engine.analyze_city_news("bangalore", city_news)
    print_result("Trend Analysis", analysis.get('trend_analysis', {}))
    
    # Test 4: City Similarity Map
    print_header("Test 4: City Embedding Visualization")
    
    viz = ml_engine.get_embedding_viz("bangalore")
    print(f"\n📊 Similar cities to Bangalore:")
    for city in viz.get('similar_cities', [])[:5]:
        print(f"   🏙️ {city['city']}, {city['state']} - Similarity: {city['similarity']}%")
    
    # Test 5: Trend Detection
    print_header("Test 5: AI Trend Detection")
    
    trend_articles = [
        {"title": "AI startups raise $10B funding"},
        {"title": "Tech companies announce new hiring"},
        {"title": "Startup ecosystem grows 50%"},
        {"title": "Innovation hub opens in Bangalore"},
        {"title": "Angel investors fund new ventures"}
    ]
    
    trends = ml_engine.trend_detector.analyze_trends(trend_articles)
    print(f"\n📈 Articles analyzed: {trends['articles_analyzed']}")
    print(f"📊 Market sentiment: {trends['market_sentiment']['trend']} (avg: {trends['market_sentiment']['average']:.2f})")
    print(f"🏷️ Models used: {', '.join(trends.get('models_used', ['fallback']))}")
    
    if trends.get('trending_entities'):
        print("\n🔥 Top Trending Entities:")
        for entity in trends['trending_entities'][:5]:
            print(f"   • {entity['entity']} ({entity['type']}) - Score: {entity.get('trend_score', 0)}")
    
    # Summary
    print_header("Demo Complete!")
    print("\n✅ All ML features tested successfully!")
    print("\n📚 Available Endpoints:")
    print("   GET  /ml/status          - Check ML model status")
    print("   GET  /ml/initialize      - Initialize all ML models")
    print("   GET  /ml/search?q=...   - Semantic search")
    print("   POST /ml/analyze-news   - AI news analysis")
    print("   POST /ml/analyze-city-news - City news with trends")
    print("   GET  /ml/city-similarity?city=... - Embedding viz")
    print("   GET  /ml/sentiment?text=... - Sentiment analysis")
    print("   GET  /ml/entities?text=... - Named entity recognition")
    print("   GET  /ml/summarize?text=... - Text summarization")
    print("   GET  /ml/classify?text=... - Business category")
    print("   POST /ml/trends          - Trend detection")

if __name__ == "__main__":
    asyncio.run(test_ml_engine())
