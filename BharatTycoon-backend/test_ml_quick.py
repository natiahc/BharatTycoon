#!/usr/bin/env python3
"""
BharatTycoon ML Engine - Quick Test
Tests the fallback mode and shows what's available
"""

import sys
sys.path.insert(0, '/Users/natiahc/sandbox/repo/BharatTycoon/BharatTycoon-backend')

def print_header(text):
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)

def main():
    print_header("BharatTycoon ML Engine Quick Test")
    
    # Test imports
    print_header("1. Testing Imports")
    try:
        from ai.ml_engine import (
            ml_engine, 
            SemanticSearchEngine, 
            NewsIntelligenceEngine,
            SEMANTIC_SEARCH_AVAILABLE,
            TRANSFORMERS_AVAILABLE
        )
        print(f"✅ All imports successful")
        print(f"   Sentence-Transformers: {'Available' if SEMANTIC_SEARCH_AVAILABLE else 'Not Available'}")
        print(f"   Transformers: {'Available' if TRANSFORMERS_AVAILABLE else 'Not Available'}")
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return
    
    # Show ML Status
    print_header("2. ML Engine Status")
    status = ml_engine.get_status()
    print(f"   Initialized: {status['initialized']}")
    print(f"   Semantic Search: {'Ready' if status['semantic_search']['loaded'] else 'Not Loaded'}")
    print(f"   News Intelligence: {'Ready' if status['news_intelligence']['loaded'] else 'Not Loaded'}")
    
    if status['news_intelligence']['available']:
        print("\n   📦 Available Models:")
        for name, model in status['news_intelligence']['models'].items():
            print(f"      {name}: {model}")
    
    # Test keyword fallback search (works without ML)
    print_header("3. Testing Search (Fallback Mode)")
    results = ml_engine.smart_search("delhi", top_k=5)
    print(f"   Search type: {results['type']}")
    print(f"   Results found: {len(results.get('results', []))}")
    for r in results['results'][:3]:
        print(f"      - {r.get('name', r.get('city'))} ({r.get('type')}) - Score: {r.get('score')}%")
    
    # Test ML initialization
    print_header("4. Initializing ML Models")
    print("   This will download models on first run (may take a few minutes)...")
    print("   Models to download:")
    print("      - all-MiniLM-L6-v2 (sentence-transformers) ~22MB")
    print("      - nlptown/bert-base-multilingual-uncased-sentiment ~420MB")
    print("      - dslim/bert-base-NER ~420MB")
    print("      - sshleifer/distilbart-cnn-12-6 ~1.2GB")
    print("      - facebook/bart-large-mnli ~1.6GB")
    
    print("\n   ⚡ Initializing...")
    init_results = ml_engine.initialize_all()
    
    for model, success in init_results.items():
        emoji = "✅" if success else "❌"
        print(f"      {emoji} {model}: {'Loaded' if success else 'Failed'}")
    
    if ml_engine._initialized:
        print("\n   🎉 All ML models loaded successfully!")
    else:
        print("\n   ⚠️ Some models failed. Run the full test later.")
    
    # Test semantic search if available
    if ml_engine.semantic_search._is_initialized:
        print_header("5. Testing Semantic Search")
        test_queries = ["mumbai tech", "bangalore cafe", "delhi restaurant"]
        for q in test_queries:
            results = ml_engine.smart_search(q, top_k=3)
            print(f"\n   🔍 Query: '{q}'")
            for r in results['results'][:3]:
                print(f"      {r.get('name')} ({r.get('type')}) - Score: {r.get('score')}%")
    
    # Test news intelligence if available
    if ml_engine.news_intelligence._is_initialized:
        print_header("6. Testing News Intelligence")
        
        test_news = [
            "Bangalore AI startups raise $5 billion in funding round",
            "Mumbai restaurants struggle with high rent costs"
        ]
        
        for news in test_news:
            print(f"\n   📰: {news[:50]}...")
            
            sentiment = ml_engine.news_intelligence.analyze_sentiment(news)
            print(f"      Sentiment: {sentiment['label']} (score: {sentiment['score']})")
            
            category = ml_engine.news_intelligence.classify_business_category(news)
            print(f"      Category: {category['category']} (confidence: {category['confidence']:.1%})")
    
    print_header("Test Complete!")
    print("\n📚 Next Steps:")
    print("   1. Start the API: python3 main.py")
    print("   2. Try the endpoints:")
    print("      - GET http://localhost:8000/ml/status")
    print("      - GET http://localhost:8000/ml/search?q=mumbai+tech")
    print("      - GET http://localhost:8000/ml/sentiment?text=Great+news+for+startups")

if __name__ == "__main__":
    main()
