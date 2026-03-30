"""
BharatTycoon AI ML Engine
Powered by HuggingFace Transformers for:
- Semantic Search (sentence-transformers)
- News Sentiment Analysis (transformers)
- Named Entity Recognition (transformers)
- Text Summarization (transformers)
- Embedding-based similarity
"""

import os
import time
import hashlib
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from functools import lru_cache
import numpy as np

import requests
import xml.etree.ElementTree as ET

try:
    from sentence_transformers import SentenceTransformer, util
    SEMANTIC_SEARCH_AVAILABLE = True
except ImportError:
    SEMANTIC_SEARCH_AVAILABLE = False
    print("⚠️ sentence-transformers not installed. Run: pip install sentence-transformers")

TRANSFORMERS_AVAILABLE = None  # Will be set lazily

def _check_transformers():
    global TRANSFORMERS_AVAILABLE
    if TRANSFORMERS_AVAILABLE is None:
        try:
            from transformers import pipeline
            import torch
            TRANSFORMERS_AVAILABLE = True
        except ImportError:
            TRANSFORMERS_AVAILABLE = False
            print("⚠️ transformers not installed. Run: pip install transformers torch")
    return TRANSFORMERS_AVAILABLE

from ai.live_trends import INDIAN_STATES_DATA


@dataclass
class MLResult:
    """Standard ML result container"""
    success: bool
    data: Any
    confidence: float
    model_used: str
    processing_time_ms: float
    metadata: Dict[str, Any]


class SemanticSearchEngine:
    """
    Semantic search for Indian cities and states using sentence-transformers.
    Enables intelligent fuzzy matching like "delhi cafe" -> "Delhi restaurants"
    Falls back to keyword search if model fails to load.
    """
    
    def __init__(self):
        self.model = None
        self.embeddings_cache = {}
        self._is_initialized = False
        self._fallback_index = []
        
    def initialize(self):
        """Lazy load the model only when needed"""
        if self._is_initialized:
            return True
            
        if not SEMANTIC_SEARCH_AVAILABLE:
            print("⚠️ Semantic search disabled - sentence-transformers not available")
            self._build_fallback_index()
            return False
            
        try:
            print("🔄 Loading sentence-transformers model (all-MiniLM-L6-v2)...")
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            self._build_embeddings_index()
            self._is_initialized = True
            print("✅ Semantic search ready!")
            return True
        except Exception as e:
            print(f"⚠️ Failed to load semantic model, using keyword fallback: {e}")
            self._build_fallback_index()
            return False
    
    def _build_fallback_index(self):
        """Build a simple keyword index for fallback search"""
        self._fallback_index = []
        for state_id, state_data in INDIAN_STATES_DATA.items():
            self._fallback_index.append({
                'type': 'state',
                'id': state_id,
                'name': state_data['name'],
                'keywords': f"{state_data['name']} {state_data['name'].lower()}".split()
            })
            for city in state_data['cities'][:10]:
                self._fallback_index.append({
                    'type': 'city',
                    'id': city.lower().replace(" ", "-"),
                    'name': city.title(),
                    'state': state_data['name'],
                    'state_id': state_id,
                    'keywords': f"{city} {city.lower()} {state_data['name']}".split()
                })
    
    def _keyword_search(self, query: str, top_k: int = 5):
        """Simple keyword-based fallback search"""
        query_words = query.lower().split()
        results = []
        for item in self._fallback_index:
            score = 0
            name_lower = item['name'].lower()
            for word in query_words:
                if word in name_lower:
                    score += 50
                if word in item.get('keywords', []):
                    score += 25
                if item['type'] == 'state' and 'state' in word:
                    score += 30
            if score > 0:
                results.append({**item, 'score': min(score, 100), 'match_type': 'keyword'})
        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:top_k]
    
    def _build_embeddings_index(self):
        """Pre-compute embeddings for all states and cities"""
        texts = []
        metadata = []
        
        for state_id, state_data in INDIAN_STATES_DATA.items():
            # Add state name
            texts.append(f"{state_data['name']} state in India")
            metadata.append({'type': 'state', 'id': state_id, 'name': state_data['name']})
            
            # Add cities
            for city in state_data['cities'][:10]:  # Limit to first 10 cities per state
                texts.append(f"{city.title()} city in {state_data['name']} India")
                metadata.append({
                    'type': 'city', 
                    'id': city.lower().replace(" ", "-"),
                    'name': city.title(),
                    'state': state_data['name'],
                    'state_id': state_id
                })
        
        if self.model and texts:
            print(f"📊 Computing embeddings for {len(texts)} locations...")
            self.embeddings = self.model.encode(texts, convert_to_tensor=True)
            self.metadata = metadata
            print(f"✅ Indexed {len(texts)} locations with semantic embeddings")
    
    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Semantic search for locations (falls back to keyword search)"""
        start = time.time()
        
        if not self.initialize() or not self.model:
            results = self._keyword_search(query, top_k)
            return {
                'query': query,
                'results': results,
                'total': len(results),
                'processing_time_ms': round((time.time() - start) * 1000, 2),
                'model': 'keyword_fallback'
            }
        
        query_embedding = self.model.encode(query.lower(), convert_to_tensor=True)
        scores = util.cos_sim(query_embedding, self.embeddings)[0]
        
        top_indices = scores.argsort(descending=True)[:top_k]
        
        results = []
        for idx in top_indices:
            i = idx.item()
            score = scores[i].item()
            meta = self.metadata[i]
            results.append({
                **meta,
                'score': round(score * 100, 1),
                'match_type': 'semantic' if score < 0.95 else 'exact' if score > 0.98 else 'fuzzy'
            })
        
        processing_time = (time.time() - start) * 1000
        
        return {
            'query': query,
            'results': results,
            'total': len(results),
            'processing_time_ms': round(processing_time, 2),
            'model': 'all-MiniLM-L6-v2'
        }


class NewsIntelligenceEngine:
    """
    AI-powered news analysis using HuggingFace Inference API (cloud-hosted).
    No model downloads needed - uses HuggingFace's free inference endpoints.
    """
    
    HF_INFERENCE_API = "https://api-inference.huggingface.co/pipeline"
    
    def __init__(self):
        self._is_initialized = False
        self._client = None
        
    def initialize(self):
        """Initialize the inference client"""
        if self._is_initialized:
            return True
            
        try:
            from huggingface_hub import InferenceClient
            token = os.environ.get('HF_TOKEN', None)
            self._client = InferenceClient(token=token)
            self._is_initialized = True
            print("✅ HuggingFace Inference API ready!")
            if not token:
                print("⚠️ Note: Set HF_TOKEN env var for full access (free at hf.co/settings/tokens)")
            return True
        except ImportError:
            print("⚠️ huggingface_hub not installed. Run: pip install huggingface_hub")
            return False
        except Exception as e:
            print(f"❌ Failed to initialize Inference client: {e}")
            return False
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment using HuggingFace Inference API"""
        if not self.initialize():
            return {'label': 'neutral', 'score': 0.5, 'confidence': 0.5}
        
        try:
            result = self._client.text_classification(
                text=text[:512],
                model="distilbert/distilbert-base-uncased-finetuned-sst-2-english"
            )
            
            label = result[0]['label'].lower()
            score = result[0]['score']
            
            if 'positive' in label:
                if score >= 0.8:
                    sentiment = 'very_positive'
                else:
                    sentiment = 'positive'
            else:
                if score >= 0.8:
                    sentiment = 'very_negative'
                else:
                    sentiment = 'negative'
            
            return {
                'label': sentiment,
                'score': round(score, 3),
                'confidence': round(score, 3),
                'model': 'distilbert-base-uncased-finetuned-sst-2-english'
            }
        except Exception as e:
            return {'label': 'neutral', 'score': 0.5, 'confidence': 0.5, 'error': str(e)}
    
    def extract_entities(self, text: str) -> Dict[str, Any]:
        """Extract named entities using HuggingFace Inference API"""
        if not self.initialize():
            return {'entities': [], 'business_entities': []}
        
        try:
            entities = self._client.token_classification(
                text=text[:512],
                model="dslim/bert-base-NER"
            )
            
            grouped = {}
            for ent in entities:
                ent_type = ent['entity_group']
                if ent_type not in grouped:
                    grouped[ent_type] = []
                if ent['word'] not in [e['text'] for e in grouped[ent_type]]:
                    grouped[ent_type].append({
                        'text': ent['word'],
                        'confidence': round(ent['score'], 3)
                    })
            
            business_keywords = ['restaurant', 'shop', 'store', 'service', 'company', 
                               'startup', 'tech', 'food', 'retail', 'cafe', 'hotel']
            
            business_entities = []
            for ent_list in grouped.values():
                for ent in ent_list:
                    if any(kw in ent['text'].lower() for kw in business_keywords):
                        business_entities.append(ent)
            
            return {
                'entities': grouped,
                'business_entities': business_entities,
                'total_entities': sum(len(v) for v in grouped.values()),
                'model': 'dslim/bert-base-NER'
            }
        except Exception as e:
            return {'entities': [], 'business_entities': [], 'error': str(e)}
    
    def summarize_text(self, text: str, max_length: int = 50) -> Dict[str, Any]:
        """Generate summary using HuggingFace Inference API"""
        if not self.initialize():
            return {'summary': text[:200] + '...', 'model': 'fallback'}
        
        try:
            input_length = len(text.split())
            
            result = self._client.summarization(
                text=text[:1024],
                model="sshleifer/distilbart-cnn-12-6"
            )
            
            return {
                'summary': result['summary_text'],
                'original_length': input_length,
                'summary_length': len(result['summary_text'].split()),
                'compression_ratio': round(len(result['summary_text'].split()) / max(1, input_length), 2),
                'model': 'sshleifer/distilbart-cnn-12-6'
            }
        except Exception as e:
            return {'summary': text[:200] + '...', 'error': str(e), 'model': 'fallback'}
    
    def classify_business_category(self, text: str) -> Dict[str, Any]:
        """Zero-shot classification using HuggingFace Inference API"""
        if not self.initialize():
            return {'category': 'general', 'confidence': 0.5}
        
        candidate_labels = [
            "restaurant and food business",
            "retail and grocery store",
            "tech and IT services",
            "health and fitness",
            "education and tuition",
            "manufacturing and production",
            "beauty and salon services",
            "transportation and logistics",
            "real estate and property",
            "entertainment and recreation"
        ]
        
        try:
            result = self._client.zero_shot_classification(
                text=text[:512],
                candidate_labels=candidate_labels
            )
            
            return {
                'category': result['labels'][0],
                'confidence': round(result['scores'][0], 3),
                'all_categories': [
                    {'category': cat, 'score': round(score, 3)}
                    for cat, score in zip(result['labels'][:3], result['scores'][:3])
                ],
                'model': 'facebook/bart-large-mnli'
            }
        except Exception as e:
            return {'category': 'general', 'confidence': 0.5, 'error': str(e)}
    
    def analyze_news_article(self, title: str, description: str = "") -> Dict[str, Any]:
        """Complete AI analysis of a news article"""
        text = f"{title}. {description}"
        
        sentiment = self.analyze_sentiment(text)
        entities = self.extract_entities(text)
        summary = self.summarize_text(text)
        category = self.classify_business_category(text)
        
        # Generate impact score based on sentiment
        impact_score = sentiment['score'] * 0.4 + category['confidence'] * 0.3
        
        return {
            'title': title,
            'ai_analysis': {
                'sentiment': sentiment,
                'entities': entities,
                'summary': summary,
                'category': category,
                'impact_score': round(impact_score, 3),
                'business_opportunity_score': round(impact_score * 100, 1)
            },
            'timestamp': time.time()
        }


class EmbeddingVisualizer:
    """
    Create embedding-based visualizations for cities and trends.
    Returns data for frontend to render similarity maps.
    """
    
    def __init__(self, semantic_engine: SemanticSearchEngine):
        self.semantic = semantic_engine
        
    def get_city_similarity_map(self, query_city: str) -> Dict[str, Any]:
        """Get similarity scores between query city and all others"""
        if not self.semantic.initialize():
            return {'error': 'Semantic search not available'}
        
        # Find the city in our index
        query_lower = query_city.lower()
        target_idx = None
        
        for i, meta in enumerate(self.semantic.metadata):
            if meta.get('type') == 'city' and meta['name'].lower() == query_lower:
                target_idx = i
                break
        
        if target_idx is None:
            return {'error': f'City "{query_city}" not found'}
        
        target_embedding = self.semantic.embeddings[target_idx]
        
        # Calculate similarities
        similarities = util.cos_sim(target_embedding, self.semantic.embeddings)[0]
        
        # Get top similar cities (excluding self)
        results = []
        for i, score in enumerate(similarities):
            meta = self.semantic.metadata[i]
            if meta['type'] == 'city' and i != target_idx:
                results.append({
                    'city': meta['name'],
                    'state': meta['state'],
                    'similarity': round(score.item() * 100, 1)
                })
        
        results.sort(key=lambda x: x['similarity'], reverse=True)
        
        return {
            'query_city': query_city,
            'similar_cities': results[:10],
            'visualization_data': {
                'nodes': [
                    {'id': query_city, 'group': 'query', 'size': 20}
                ] + [
                    {'id': r['city'], 'group': r['state'], 'size': r['similarity'] / 10}
                    for r in results[:8]
                ],
                'links': [
                    {'source': query_city, 'target': r['city'], 'value': r['similarity']}
                    for r in results[:8]
                ]
            }
        }


class TrendDetector:
    """
    Detect emerging trends from news using ML clustering and pattern recognition.
    """
    
    def __init__(self, news_engine: NewsIntelligenceEngine):
        self.news_engine = news_engine
        self.trend_history = []
        
    def analyze_trends(self, news_articles: List[Dict]) -> Dict[str, Any]:
        """Analyze a batch of news to detect trends"""
        if not self.news_engine.initialize():
            return self._fallback_analysis(news_articles)
        
        analyzed = []
        all_entities = []
        sentiment_scores = []
        
        for article in news_articles:
            title = article.get('title', '')
            if not title:
                continue
                
            analysis = self.news_engine.analyze_news_article(title)
            analyzed.append(analysis)
            
            # Aggregate entities
            entities = analysis['ai_analysis']['entities'].get('entities', {})
            for ent_type, ent_list in entities.items():
                for ent in ent_list:
                    all_entities.append({
                        'text': ent['text'],
                        'type': ent_type,
                        'confidence': ent['confidence']
                    })
            
            sentiment_scores.append(analysis['ai_analysis']['sentiment']['score'])
        
        # Find trending entities
        entity_counts = {}
        for ent in all_entities:
            key = f"{ent['text']}_{ent['type']}"
            if key not in entity_counts:
                entity_counts[key] = {'text': ent['text'], 'type': ent['type'], 'count': 0, 'total_confidence': 0}
            entity_counts[key]['count'] += 1
            entity_counts[key]['total_confidence'] += ent['confidence']
        
        trending_entities = sorted(entity_counts.values(), key=lambda x: x['count'] * x['total_confidence'], reverse=True)
        
        # Calculate trend momentum
        avg_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0.5
        sentiment_trend = 'bullish' if avg_sentiment > 0.6 else 'bearish' if avg_sentiment < 0.4 else 'neutral'
        
        return {
            'articles_analyzed': len(analyzed),
            'trending_entities': [
                {
                    'entity': e['text'],
                    'type': e['type'],
                    'mentions': e['count'],
                    'confidence': round(e['total_confidence'] / e['count'], 2),
                    'trend_score': round(e['count'] * (e['total_confidence'] / e['count']), 1)
                }
                for e in trending_entities[:10]
            ],
            'market_sentiment': {
                'average': round(avg_sentiment, 3),
                'trend': sentiment_trend,
                'confidence': round(abs(avg_sentiment - 0.5) * 2, 2)
            },
            'ai_insights': self._generate_insights(analyzed, trending_entities, avg_sentiment),
            'models_used': ['dslim/bert-base-NER', 'nlptown/bert-base-multilingual-uncased-sentiment']
        }
    
    def _fallback_analysis(self, news_articles: List[Dict]) -> Dict[str, Any]:
        """Fallback analysis without ML"""
        keywords = ['ai', 'tech', 'startup', 'growth', 'funding', 'investment', 'boom', 'surge']
        
        entity_counts = {}
        sentiment_scores = []
        
        for article in news_articles:
            title = article.get('title', '').lower()
            sentiment = article.get('sentiment', 'neutral')
            sentiment_scores.append(1 if sentiment == 'positive' else 0.5 if sentiment == 'neutral' else 0)
            
            for kw in keywords:
                if kw in title:
                    entity_counts[kw] = entity_counts.get(kw, 0) + 1
        
        avg_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0.5
        
        return {
            'articles_analyzed': len(news_articles),
            'trending_entities': [
                {'entity': k, 'type': 'keyword', 'mentions': v, 'trend_score': v * 10}
                for k, v in sorted(entity_counts.items(), key=lambda x: x[1], reverse=True)[:10]
            ],
            'market_sentiment': {
                'average': round(avg_sentiment, 3),
                'trend': 'bullish' if avg_sentiment > 0.6 else 'bearish' if avg_sentiment < 0.4 else 'neutral'
            },
            'ai_insights': [],
            'models_used': []
        }
    
    def _generate_insights(self, analyzed: List[Dict], trending: List, sentiment: float) -> List[str]:
        """Generate AI-powered insights"""
        insights = []
        
        if len(analyzed) >= 5:
            insights.append(f"📊 Analyzed {len(analyzed)} articles using AI")
        
        if sentiment > 0.7:
            insights.append("🟢 Market sentiment is strongly positive")
        elif sentiment > 0.5:
            insights.append("🟡 Market sentiment is moderately positive")
        elif sentiment < 0.3:
            insights.append("🔴 Market sentiment is negative - caution advised")
        
        # Find most mentioned entity types
        entity_types = {}
        for e in trending:
            t = e.get('type', 'UNKNOWN')
            entity_types[t] = entity_types.get(t, 0) + e.get('mentions', 0)
        
        if entity_types:
            top_type = max(entity_types.items(), key=lambda x: x[1])
            type_labels = {
                'ORG': 'companies', 'LOC': 'locations', 'PER': 'people',
                'MISC': 'topics', 'keyword': 'keywords'
            }
            insights.append(f"📰 Most discussed: {type_labels.get(top_type[0], top_type[0])}")
        
        return insights[:5]


class TextGenerationEngine:
    """
    AI text generation using HuggingFace Inference API.
    For business advice, marketing copy, and content generation.
    """
    
    def __init__(self):
        self._client = None
        self._is_initialized = False
    
    def initialize(self):
        if self._is_initialized:
            return True
        try:
            from huggingface_hub import InferenceClient
            self._client = InferenceClient(token=os.environ.get('HF_TOKEN'))
            self._is_initialized = True
            return True
        except:
            return False
    
    def generate_business_advice(self, context: str, max_length: int = 150) -> Dict[str, Any]:
        """Generate AI-powered business advice"""
        if not self.initialize():
            return {'advice': 'AI unavailable', 'model': 'fallback'}
        
        prompt = f"""As a business advisor for Indian entrepreneurs, give advice for: {context}
        
Advice:"""
        
        try:
            result = self._client.text_generation(
                prompt,
                model="gpt2",  # Free, fast model
                max_new_tokens=max_length,
                temperature=0.7
            )
            return {
                'advice': result.replace(prompt, '').strip(),
                'context': context,
                'model': 'gpt2'
            }
        except Exception as e:
            return {'advice': 'AI unavailable', 'error': str(e)}
    
    def generate_marketing_copy(self, product: str, tone: str = "professional") -> Dict[str, Any]:
        """Generate marketing copy for a business/product"""
        if not self.initialize():
            return {'copy': 'AI unavailable', 'model': 'fallback'}
        
        prompt = f"""Write a {tone} marketing tagline and description for: {product}

Tagline:"""
        
        try:
            result = self._client.text_generation(
                prompt,
                model="gpt2",
                max_new_tokens=100,
                temperature=0.8
            )
            return {
                'tagline': result.split('\n')[0] if '\n' in result else result[:100],
                'description': result.replace(prompt, '').strip(),
                'tone': tone,
                'model': 'gpt2'
            }
        except Exception as e:
            return {'copy': 'AI unavailable', 'error': str(e)}
    
    def generate_business_name(self, business_type: str, keywords: List[str] = None) -> Dict[str, Any]:
        """Generate creative business names"""
        if not self.initialize():
            return {'names': ['Business Name AI unavailable'], 'model': 'fallback'}
        
        kw_str = ', '.join(keywords) if keywords else 'modern'
        prompt = f"""Generate 5 creative Indian business names for a {business_type} with {kw_str} vibes.

1."""
        
        try:
            result = self._client.text_generation(
                prompt,
                model="gpt2",
                max_new_tokens=80,
                temperature=0.9
            )
            names = [n.strip() for n in result.split('\n') if n.strip() and len(n.strip()) > 3][:5]
            if not names:
                names = [result.replace(prompt, '').strip().split('.')[0][:50]]
            return {
                'names': names,
                'business_type': business_type,
                'model': 'gpt2'
            }
        except Exception as e:
            return {'names': [], 'error': str(e)}


class TranslationEngine:
    """
    Multi-language translation using HuggingFace.
    Support for Hindi, regional Indian languages.
    """
    
    LANGUAGES = {
        'en': 'English', 'hi': 'Hindi', 'bn': 'Bengali', 'ta': 'Tamil',
        'te': 'Telugu', 'mr': 'Marathi', 'gu': 'Gujarati', 'kn': 'Kannada',
        'ml': 'Malayalam', 'pa': 'Punjabi'
    }
    
    def __init__(self):
        self._client = None
        self._is_initialized = False
    
    def initialize(self):
        if self._is_initialized:
            return True
        try:
            from huggingface_hub import InferenceClient
            self._client = InferenceClient(token=os.environ.get('HF_TOKEN'))
            self._is_initialized = True
            return True
        except:
            return False
    
    def translate_to_hindi(self, text: str) -> Dict[str, Any]:
        """Translate English text to Hindi"""
        return self.translate(text, 'en', 'hi')
    
    def translate(self, text: str, source: str = 'en', target: str = 'hi') -> Dict[str, Any]:
        """Translate between supported languages"""
        if not self.initialize():
            return {'original': text[:100], 'translated': 'AI unavailable'}
        
        if source == 'en' and target == 'hi':
            model = "Helsinki-NLP/opus-mt-en-hi"
        elif source == 'hi' and target == 'en':
            model = "Helsinki-NLP/opus-mt-hi-en"
        else:
            model = "facebook/mbart-large-50-many-to-many-mmt"
        
        try:
            result = self._client.translation(
                text=text[:500],
                model=model
            )
            return {
                'original': text[:200],
                'translated': result['translation_text'],
                'source': source,
                'target': target,
                'model': model
            }
        except Exception as e:
            return {'original': text[:100], 'translated': 'Translation unavailable', 'error': str(e)}


class QAEngine:
    """
    Question Answering using HuggingFace for FAQ and business queries.
    """
    
    def __init__(self):
        self._client = None
        self._is_initialized = False
        self._context_cache = {}
    
    def initialize(self):
        if self._is_initialized:
            return True
        try:
            from huggingface_hub import InferenceClient
            self._client = InferenceClient(token=os.environ.get('HF_TOKEN'))
            self._is_initialized = True
            self._load_business_context()
            return True
        except:
            return False
    
    def _load_business_context(self):
        """Load business-related context for QA"""
        self._context_cache = {
            'restaurant': "Restaurants in India typically have profit margins of 6-10%. Key success factors include location, food quality, hygiene, and customer service. Average initial investment ranges from 5-50 lakhs depending on scale.",
            'retail': "Retail businesses in India have profit margins of 10-25%. Success depends on inventory management, location, and pricing strategy. E-commerce competition has impacted traditional retail.",
            'tech': "Tech startups can have profit margins of 20-40% once established. Key costs are talent acquisition and infrastructure. Government schemes like Startup India provide benefits.",
            'salon': "Beauty salons typically achieve 15-30% profit margins. Success factors include skilled staff, quality products, and customer experience. Initial investment ranges from 2-10 lakhs.",
            'tuition': "Education and tuition centers have stable margins of 30-50%. Success depends on faculty quality and results. Growing demand for competitive exam coaching.",
            'manufacturing': "Manufacturing businesses have lower margins (10-15%) but higher volumes. Success factors include supply chain, quality control, and regulatory compliance."
        }
    
    def answer_question(self, question: str, topic: str = None) -> Dict[str, Any]:
        """Answer business-related questions"""
        if not self.initialize():
            return {'answer': 'AI unavailable', 'confidence': 0}
        
        context = self._context_cache.get(topic.lower() if topic else '', 
            "Indian business landscape varies by sector. Key factors for success include market research, financial planning, location, and execution.")
        
        try:
            result = self._client.question_answering(
                question=question[:200],
                context=context[:500]
            )
            return {
                'question': question,
                'answer': result['answer'],
                'confidence': round(result['score'], 3),
                'topic': topic,
                'model': 'deepset/roberta-base-squad2'
            }
        except Exception as e:
            return {'question': question, 'answer': 'AI unavailable', 'error': str(e)}


class BharatTycoonMLEngine:
    """
    Main ML Engine combining all HuggingFace capabilities.
    Use this as the primary interface for ML features.
    """
    
    def __init__(self):
        self.semantic_search = SemanticSearchEngine()
        self.news_intelligence = NewsIntelligenceEngine()
        self.embedding_viz = EmbeddingVisualizer(self.semantic_search)
        self.trend_detector = TrendDetector(self.news_intelligence)
        self.text_generation = TextGenerationEngine()
        self.translation = TranslationEngine()
        self.qa = QAEngine()
        self._initialized = False
        
    def initialize_all(self) -> Dict[str, bool]:
        """Initialize all ML models"""
        results = {
            'semantic_search': self.semantic_search.initialize(),
            'news_intelligence': self.news_intelligence.initialize(),
            'text_generation': self.text_generation.initialize(),
            'translation': self.translation.initialize(),
            'qa': self.qa.initialize()
        }
        self._initialized = all(results.values())
        return results
    
    def get_status(self) -> Dict[str, Any]:
        """Get status of all ML components"""
        return {
            'initialized': self._initialized,
            'semantic_search': {
                'available': SEMANTIC_SEARCH_AVAILABLE,
                'loaded': self.semantic_search._is_initialized,
                'model': 'sentence-transformers/all-MiniLM-L6-v2'
            },
            'news_intelligence': {
                'available': TRANSFORMERS_AVAILABLE,
                'loaded': self.news_intelligence._is_initialized,
                'models': {
                    'sentiment': 'nlptown/bert-base-multilingual-uncased-sentiment',
                    'ner': 'dslim/bert-base-NER',
                    'summarization': 'sshleifer/distilbart-cnn-12-6',
                    'classification': 'facebook/bart-large-mnli'
                }
            },
            'text_generation': {
                'available': True,
                'model': 'gpt2',
                'uses': ['business_advice', 'marketing_copy', 'business_names']
            },
            'translation': {
                'available': True,
                'languages': TranslationEngine.LANGUAGES,
                'model': 'Helsinki-NLP/opus-mt-en-hi'
            },
            'qa': {
                'available': True,
                'model': 'deepset/roberta-base-squad2',
                'topics': list(self.qa._context_cache.keys())
            }
        }
    
    def smart_search(self, query: str, top_k: int = 5) -> Dict[str, Any]:
        """
        Enhanced search combining semantic and keyword search.
        Falls back to keyword search if semantic search fails.
        """
        start = time.time()
        
        # Try semantic search first
        semantic_results = self.semantic_search.search(query, top_k)
        
        if semantic_results.get('results'):
            return {
                'type': 'semantic',
                'query': query,
                'results': semantic_results['results'],
                'processing_time_ms': round((time.time() - start) * 1000, 2)
            }
        
        # Fallback to keyword search
        query_lower = query.lower()
        results = []
        
        for state_id, state_data in INDIAN_STATES_DATA.items():
            # Check state name
            if query_lower in state_data['name'].lower():
                results.append({
                    'type': 'state',
                    'id': state_id,
                    'name': state_data['name'],
                    'city_count': len(state_data['cities']),
                    'score': 100
                })
            
            # Check cities
            for city in state_data['cities']:
                if query_lower in city.lower():
                    results.append({
                        'type': 'city',
                        'id': city.lower().replace(" ", "-"),
                        'name': city.title(),
                        'state': state_data['name'],
                        'score': 95 if query_lower == city.lower() else 80
                    })
        
        return {
            'type': 'keyword',
            'query': query,
            'results': sorted(results, key=lambda x: x['score'], reverse=True)[:top_k],
            'processing_time_ms': round((time.time() - start) * 1000, 2)
        }
    
    def analyze_city_news(self, city: str, news_titles: List[str]) -> Dict[str, Any]:
        """Full AI analysis of city news"""
        articles = [{'title': t} for t in news_titles]
        trend_analysis = self.trend_detector.analyze_trends(articles)
        
        # Individual article analysis
        analyzed_articles = []
        for title in news_titles[:5]:
            analysis = self.news_intelligence.analyze_news_article(title)
            analyzed_articles.append(analysis)
        
        return {
            'city': city,
            'trend_analysis': trend_analysis,
            'articles': analyzed_articles,
            'summary': self._summarize_city_analysis(city, trend_analysis)
        }
    
    def _summarize_city_analysis(self, city: str, trends: Dict) -> str:
        """Generate human-readable summary"""
        sentiment = trends.get('market_sentiment', {})
        sentiment_label = sentiment.get('trend', 'neutral')
        
        top_entities = trends.get('trending_entities', [])[:3]
        if top_entities:
            top_words = ', '.join([e['entity'] for e in top_entities])
        else:
            top_words = 'various topics'
        
        return f"{city} news analysis complete. Market is {sentiment_label} with focus on {top_words}."
    
    def get_embedding_viz(self, city: str) -> Dict[str, Any]:
        """Get embedding visualization for a city"""
        return self.embedding_viz.get_city_similarity_map(city)


# Global instance
ml_engine = BharatTycoonMLEngine()
