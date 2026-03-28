import random
import math
from datetime import datetime
from typing import Dict, List, Any
from ai.live_trends import trends_service, INDIAN_STATES_DATA

# Helper to get city data dynamically
def get_city_data(city: str) -> Dict[str, Any]:
    """Get city data dynamically from all Indian cities"""
    city_lower = city.lower().replace("-", " ")
    
    # Search through all states
    for state_id, state_data in INDIAN_STATES_DATA.items():
        for city_name in state_data["cities"]:
            if city_lower == city_name.lower():
                # Determine tier based on city name (known major cities)
                major_tier1 = ['mumbai', 'delhi', 'bangalore', 'chennai', 'hyderabad', 'kolkata']
                major_tier2 = ['pune', 'ahmedabad', 'jaipur', 'lucknow', 'chandigarh', 'kochi', 'goa', 'srinagar', 'shimla']
                
                if city_lower in major_tier1:
                    tier = 1
                elif city_lower in major_tier2:
                    tier = 2
                else:
                    tier = 3
                
                return {
                    'name': city_name.title(),
                    'state': state_id,
                    'base_demand': 85000 - (tier * 10000),
                    'top_sectors': _get_sectors_for_city(city_lower, state_id),
                    'tier': tier
                }
    
    # Default fallback
    return {
        'name': city.title(),
        'state': 'unknown',
        'base_demand': 40000,
        'top_sectors': ['restaurant', 'retail', 'service'],
        'tier': 3
    }

def _get_sectors_for_city(city: str, state: str) -> List[str]:
    """Get relevant sectors for a city based on its characteristics"""
    sectors = {
        'tech': ['tech', 'service', 'restaurant', 'premium_grocery'],
        'business': ['restaurant', 'retail', 'service'],
        'industrial': ['manufacturing', 'service', 'restaurant'],
        'tourism': ['restaurant', 'retail', 'hotel', 'tour'],
        'educational': ['tuition', 'service', 'restaurant'],
        'port': ['logistics', 'service', 'restaurant', 'manufacturing'],
        'hill': ['tourism', 'hotel', 'restaurant', 'service'],
        'religious': ['restaurant', 'retail', 'hotel', 'tourism'],
    }
    
    # City-type mapping
    tech_cities = ['bangalore', 'hyderabad', 'pune', 'gurgaon', 'noida']
    business_cities = ['mumbai', 'delhi', 'kolkata', 'ahmedabad', 'surat']
    industrial_cities = ['jamshedpur', 'chandigarh', 'coimbatore', 'indore']
    tourism_cities = ['goa', 'kochi', 'jaipur', 'udaipur', 'shimla', 'srinagar', 'manali']
    port_cities = ['visakhapatnam', 'mumbai', 'chennai', 'kolkata', 'kochi']
    
    if city in tech_cities:
        return sectors['tech'] + ['fitness', 'cafe']
    elif city in business_cities:
        return sectors['business'] + ['premium_grocery', 'fitness']
    elif city in industrial_cities:
        return sectors['industrial'] + ['restaurant', 'service']
    elif city in tourism_cities:
        return sectors['tourism'] + ['retail', 'service']
    elif city in port_cities:
        return sectors['port'] + ['restaurant', 'retail']
    else:
        return ['restaurant', 'retail', 'service', 'grocery']

NEWS_TO_BUSINESS_MAPPING = {
    # Positive trends - businesses that benefit
    'tech': ['tech', 'service'],
    'ai': ['tech', 'service'],
    'startup': ['tech', 'service', 'restaurant', 'retail'],
    'funding': ['tech', 'service', 'manufacturing'],
    'investment': ['tech', 'retail', 'premium_grocery', 'fitness'],
    'manufacturing': ['manufacturing', 'service'],
    'auto': ['manufacturing', 'service'],
    'ev': ['manufacturing', 'service', 'mobile_repair'],
    'pharma': ['pharmacy', 'service'],
    'health': ['fitness', 'pharmacy', 'restaurant'],
    'hospital': ['pharmacy', 'restaurant', 'service'],
    'restaurant': ['restaurant', 'food_stall', 'grocery'],
    'food': ['restaurant', 'food_stall', 'grocery'],
    'cloud kitchen': ['restaurant', 'food_stall'],
    'retail': ['retail', 'premium_grocery', 'grocery'],
    'mall': ['retail', 'premium_grocery'],
    'e-commerce': ['retail', 'service'],
    'delivery': ['restaurant', 'grocery', 'service'],
    'quick commerce': ['restaurant', 'grocery', 'food_stall'],
    'fitness': ['fitness', 'pharmacy'],
    'gym': ['fitness', 'service'],
    'wellness': ['fitness', 'pharmacy', 'salon'],
    'salon': ['salon', 'fitness'],
    'grooming': ['salon', 'fitness'],
    'education': ['tuition', 'service'],
    'edtech': ['tuition', 'service'],
    'tuition': ['tuition', 'service'],
    'laundry': ['laundry', 'service'],
    'repair': ['mobile_repair', 'service'],
    'mobile': ['mobile_repair', 'service'],
    'grocery': ['grocery', 'premium_grocery', 'retail'],
    'premium': ['premium_grocery', 'fitness', 'restaurant'],
    'organic': ['premium_grocery', 'restaurant'],
    'lease': ['retail', 'restaurant', 'service'],
    'export': ['manufacturing', 'service'],
    'job': ['service', 'restaurant', 'retail'],
    'ipo': ['tech', 'service', 'retail'],
    'boom': ['restaurant', 'tech', 'retail', 'fitness'],
    'surge': ['restaurant', 'tech', 'fitness', 'retail'],
    'growth': ['restaurant', 'tech', 'fitness', 'retail', 'service'],
    'record': ['restaurant', 'tech', 'retail', 'fitness'],
    # Local problems - solution businesses
    'traffic': ['service', 'food_stall', 'mobile_repair'],
    'pollution': ['fitness', 'service', 'pharmacy'],
    'water': ['laundry', 'service'],
    'shortage': ['grocery', 'water_delivery'],
    'crisis': ['grocery', 'restaurant', 'service'],
    'problem': ['service', 'tuition'],
    'fail': ['food_stall', 'grocery'],
    'delay': ['food_stall', 'service'],
    'accident': ['pharmacy', 'service'],
    'protest': ['grocery', 'food_stall'],
    'strike': ['food_stall', 'grocery'],
    'rain': ['food_stall', 'laundry', 'pharmacy'],
    'flood': ['laundry', 'pharmacy', 'service'],
}

LOCAL_ISSUES_MAPPING = {
    'traffic': {'problem': 'Traffic congestion', 'opportunity': 'Quick delivery & mobile services'},
    'pollution': {'problem': 'Air quality issues', 'opportunity': 'Air purifiers, wellness, health services'},
    'water': {'problem': 'Water scarcity', 'opportunity': 'Water delivery, packaged water'},
    'shortage': {'problem': 'Supply shortages', 'opportunity': 'Essential delivery services'},
    'crisis': {'problem': 'Economic uncertainty', 'opportunity': 'Budget dining, essential services'},
    'rain': {'problem': 'Monsoon challenges', 'opportunity': 'Indoor entertainment, quick delivery'},
    'flood': {'problem': 'Flooding', 'opportunity': 'Emergency services, cleanup'},
    'rent': {'problem': 'High rent costs', 'opportunity': 'Online services, home-based'},
    'parking': {'problem': 'Parking issues', 'opportunity': 'Mobile services, delivery'},
}

FESTIVALS = {
    'jan': ['diwali', 'christmas', 'new year'],
    'feb': ['valentine', 'shivaratri'],
    'mar': ['holi', 'easter'],
    'apr': ['eid', 'punjab'],
    'may': ['mothers day'],
    'jun': ['fathers day'],
    'jul': ['bakrid'],
    'aug': ['independence day', 'rakhi'],
    'sep': ['ganesh chaturthi', 'onam'],
    'oct': ['dussehra', 'diwali'],
    'nov': ['diwali', 'children day'],
    'dec': ['christmas', 'new year', 'end year'],
}

class UnifiedRecommendationEngine:
    def __init__(self):
        # All Indian states and major cities
        self.india_states = {
            'maharashtra': {'name': 'Maharashtra', 'cities': ['mumbai', 'pune', 'nagpur', 'nashik', 'aurangabad', 'solapur', 'kolhapur', 'thane']},
            'delhi': {'name': 'Delhi', 'cities': ['new delhi', 'delhi']},
            'karnataka': {'name': 'Karnataka', 'cities': ['bangalore', 'mysore', 'hubli', 'mangalore', 'belgaum', 'dharwad', 'tumkur', 'bellary']},
            'tamil_nadu': {'name': 'Tamil Nadu', 'cities': ['chennai', 'coimbatore', 'madurai', 'trichy', 'salem', 'tiruppur', 'vellore', 'ereode']},
            'telangana': {'name': 'Telangana', 'cities': ['hyderabad', 'warangal', 'karimnagar', 'khammam', 'secunderabad']},
            'west_bengal': {'name': 'West Bengal', 'cities': ['kolkata', 'howrah', 'asansol', 'siliguri', 'durgapur', 'bardhaman']},
            'gujarat': {'name': 'Gujarat', 'cities': ['ahmedabad', 'surat', 'vadodara', 'rajkot', 'jamnagar', 'bhavnagar', 'junagadh', 'gandhinagar']},
            'rajasthan': {'name': 'Rajasthan', 'cities': ['jaipur', 'jodhpur', 'kotputali', 'udaipur', 'bikaner', 'ajmer', 'pilani', 'alwar']},
            'uttar_pradesh': {'name': 'Uttar Pradesh', 'cities': ['lucknow', 'kanpur', 'varanasi', 'agra', 'allahabad', 'meerut', 'aligarh', 'bareilly']},
            'madhya_pradesh': {'name': 'Madhya Pradesh', 'cities': ['bhopal', 'indore', 'jabalpur', 'gwalior', 'ujjain', 'satna', 'ratlam', 'burhanpur']},
            'kerala': {'name': 'Kerala', 'cities': ['kochi', 'thiruvananthapuram', 'kozhikode', 'thrissur', 'kollam', 'palakkad', 'malappuram', 'kannur']},
            'punjab': {'name': 'Punjab', 'cities': ['chandigarh', 'ludhiana', 'amritsar', 'jalandhar', 'patiala', 'bathinda', 'pathankot', 'hoshiarpur']},
            'haryana': {'name': 'Haryana', 'cities': ['gurgaon', 'faridabad', 'panipat', 'karnal', 'rohtak', 'sonipat', 'ambala', 'hisar']},
            'andhra_pradesh': {'name': 'Andhra Pradesh', 'cities': ['visakhapatnam', 'vijayawada', 'guntur', 'nellore', 'kurnool', 'rajahmundry', 'kadapa', 'anantapur']},
            'bihar': {'name': 'Bihar', 'cities': ['patna', 'gaya', 'muzaffarpur', 'bhagalpur', 'darbhanga', 'purnia', 'arrah', 'bihar sharif']},
            'jharkhand': {'name': 'Jharkhand', 'cities': ['jamshedpur', 'dhanbad', 'ranchi', 'bokaro', 'hazaribagh', 'deoghar', 'giridih', 'phusro']},
            'odisha': {'name': 'Odisha', 'cities': ['bhubaneswar', 'cuttack', 'rourkela', 'berhampur', 'sambalpur', 'puri', 'balasore', 'baripada']},
            'assam': {'name': 'Assam', 'cities': ['guwahati', 'silchar', 'dibrugarh', 'jorhat', 'tezpur', 'tinsukia', 'bongaigaon', 'digboi']},
            'uttarakhand': {'name': 'Uttarakhand', 'cities': ['dehradun', 'haridwar', 'roorkee', 'haldwani', 'kashipur', 'rudrapur', 'kotdwar', 'rishikesh']},
            'chhattisgarh': {'name': 'Chhattisgarh', 'cities': ['raipur', 'bhilai', 'bilaspur', 'durg', 'rajnandgaon', 'raigarh', 'korba', 'Ambikapur']},
        }
        
        # Legacy city data for main cities (used for scoring)
        self.city_data = {
            'mumbai': {'name': 'Mumbai', 'state': 'maharashtra', 'base_demand': 85000, 'top_sectors': ['restaurant', 'retail', 'premium_grocery', 'fitness'], 'tier': 1},
            'delhi': {'name': 'Delhi', 'state': 'delhi', 'base_demand': 78000, 'top_sectors': ['retail', 'grocery', 'service', 'restaurant'], 'tier': 1},
            'bangalore': {'name': 'Bangalore', 'state': 'karnataka', 'base_demand': 90000, 'top_sectors': ['tech', 'service', 'premium_grocery', 'fitness', 'restaurant'], 'tier': 1},
            'chennai': {'name': 'Chennai', 'state': 'tamil_nadu', 'base_demand': 65000, 'top_sectors': ['manufacturing', 'service', 'restaurant', 'retail'], 'tier': 1},
            'hyderabad': {'name': 'Hyderabad', 'state': 'telangana', 'base_demand': 60000, 'top_sectors': ['tech', 'restaurant', 'fitness', 'service'], 'tier': 1},
            'kolkata': {'name': 'Kolkata', 'state': 'west_bengal', 'base_demand': 55000, 'top_sectors': ['grocery', 'retail', 'restaurant', 'tuition'], 'tier': 1},
            'pune': {'name': 'Pune', 'state': 'maharashtra', 'base_demand': 72000, 'top_sectors': ['tech', 'service', 'restaurant', 'education'], 'tier': 2},
            'ahmedabad': {'name': 'Ahmedabad', 'state': 'gujarat', 'base_demand': 68000, 'top_sectors': ['textile', 'manufacturing', 'restaurant', 'retail'], 'tier': 2},
            'kochi': {'name': 'Kochi', 'state': 'kerala', 'base_demand': 62000, 'top_sectors': ['tourism', 'restaurant', 'logistics', 'service'], 'tier': 2},
            'jaipur': {'name': 'Jaipur', 'state': 'rajasthan', 'base_demand': 58000, 'top_sectors': ['tourism', 'retail', 'restaurant', 'handloom'], 'tier': 2},
            'lucknow': {'name': 'Lucknow', 'state': 'uttar_pradesh', 'base_demand': 54000, 'top_sectors': ['restaurant', 'retail', 'service', 'education'], 'tier': 2},
            'chandigarh': {'name': 'Chandigarh', 'state': 'punjab', 'base_demand': 52000, 'top_sectors': ['service', 'education', 'restaurant', 'retail'], 'tier': 2},
            'guwahati': {'name': 'Guwahati', 'state': 'assam', 'base_demand': 45000, 'top_sectors': ['retail', 'restaurant', 'service', 'education'], 'tier': 3},
            'bhubaneswar': {'name': 'Bhubaneswar', 'state': 'odisha', 'base_demand': 42000, 'top_sectors': ['service', 'retail', 'restaurant', 'education'], 'tier': 3},
            'dehradun': {'name': 'Dehradun', 'state': 'uttarakhand', 'base_demand': 38000, 'top_sectors': ['tourism', 'education', 'restaurant', 'service'], 'tier': 3},
            'jamshedpur': {'name': 'Jamshedpur', 'state': 'jharkhand', 'base_demand': 40000, 'top_sectors': ['manufacturing', 'steel', 'service', 'restaurant'], 'tier': 3},
            'visakhapatnam': {'name': 'Visakhapatnam', 'state': 'andhra_pradesh', 'base_demand': 46000, 'top_sectors': ['port', 'logistics', 'restaurant', 'service'], 'tier': 3},
            'raipur': {'name': 'Raipur', 'state': 'chhattisgarh', 'base_demand': 36000, 'top_sectors': ['mining', 'agriculture', 'restaurant', 'retail'], 'tier': 3},
        }

        self.business_data = {
            # Under 50K - Smallest ventures
            'pani_puri_stall': {'capital': 30000, 'risk': 'low', 'profit': 12000, 'category': 'food'},
            'tea_stall': {'capital': 25000, 'risk': 'low', 'profit': 8000, 'category': 'food'},
            'mobile_repair_kiosk': {'capital': 35000, 'risk': 'low', 'profit': 15000, 'category': 'service'},
            'stationery_shop': {'capital': 40000, 'risk': 'low', 'profit': 10000, 'category': 'retail'},
            'beg': {'capital': 30000, 'risk': 'low', 'profit': 0, 'category': 'service'},
            
            # 50K - 80K
            'food_stall': {'capital': 50000, 'risk': 'low', 'profit': 18000, 'category': 'food'},
            'laundry': {'capital': 60000, 'risk': 'low', 'profit': 12000, 'category': 'service'},
            'grocery_kirana': {'capital': 70000, 'risk': 'low', 'profit': 14000, 'category': 'retail'},
            'bike_repair': {'capital': 50000, 'risk': 'low', 'profit': 16000, 'category': 'service'},
            'tiffin_service': {'capital': 55000, 'risk': 'low', 'profit': 17000, 'category': 'food'},
            
            # 80K - 1.5L
            'restaurant': {'capital': 150000, 'risk': 'medium', 'profit': 35000, 'category': 'food'},
            'salon': {'capital': 100000, 'risk': 'low', 'profit': 25000, 'category': 'service'},
            'premium_laundry': {'capital': 120000, 'risk': 'medium', 'profit': 22000, 'category': 'service'},
            'mobile_shop': {'capital': 100000, 'risk': 'medium', 'profit': 28000, 'category': 'retail'},
            'petrol_bunk_attendant': {'capital': 80000, 'risk': 'low', 'profit': 20000, 'category': 'service'},
            'cloud_kitchen': {'capital': 120000, 'risk': 'medium', 'profit': 32000, 'category': 'food'},
            'organic_store': {'capital': 130000, 'risk': 'medium', 'profit': 26000, 'category': 'retail'},
            'car_wash': {'capital': 100000, 'risk': 'low', 'profit': 18000, 'category': 'service'},
            'tuition_center': {'capital': 80000, 'risk': 'low', 'profit': 20000, 'category': 'education'},
            
            # 1.5L - 3L
            'full_restaurant': {'capital': 250000, 'risk': 'medium', 'profit': 55000, 'category': 'food'},
            'gym': {'capital': 200000, 'risk': 'medium', 'profit': 40000, 'category': 'fitness'},
            'pharmacy': {'capital': 180000, 'risk': 'low', 'profit': 35000, 'category': 'healthcare'},
            'premium_salon': {'capital': 200000, 'risk': 'medium', 'profit': 45000, 'category': 'service'},
            'electronics_shop': {'capital': 250000, 'risk': 'medium', 'profit': 40000, 'category': 'retail'},
            'clothing_store': {'capital': 220000, 'risk': 'medium', 'profit': 38000, 'category': 'retail'},
            'cafe': {'capital': 200000, 'risk': 'medium', 'profit': 42000, 'category': 'food'},
            
            # 3L+
            'tech_startup': {'capital': 500000, 'risk': 'high', 'profit': 100000, 'category': 'tech'},
            'manufacturing_unit': {'capital': 500000, 'risk': 'high', 'profit': 120000, 'category': 'manufacturing'},
            'premium_restaurant': {'capital': 400000, 'risk': 'high', 'profit': 90000, 'category': 'food'},
            'hospital_small': {'capital': 350000, 'risk': 'high', 'profit': 80000, 'category': 'healthcare'},
            'export_business': {'capital': 500000, 'risk': 'high', 'profit': 150000, 'category': 'trade'},
        }
        
        # City-specific niche businesses
        self.city_niche_businesses = {
            'mumbai': [
                {'id': 'dabbawala_service', 'capital': 40000, 'profit': 15000, 'risk': 'low'},
                {'id': 'vada_pav_stall', 'capital': 35000, 'profit': 12000, 'risk': 'low'},
                {'id': 'bandwidth_agent', 'capital': 30000, 'profit': 18000, 'risk': 'low'},
                {'id': 'cable_agent', 'capital': 25000, 'profit': 8000, 'risk': 'low'},
                {'id': 'bungalow_service', 'capital': 80000, 'profit': 25000, 'risk': 'medium'},
            ],
            'bangalore': [
                {'id': 'coworking_space', 'capital': 200000, 'profit': 45000, 'risk': 'medium'},
                {'id': 'startup_coworking', 'capital': 150000, 'profit': 35000, 'risk': 'medium'},
                {'id': 'bbmp_contractor', 'capital': 100000, 'profit': 30000, 'risk': 'medium'},
                {'id': 'tech_rental', 'capital': 80000, 'profit': 20000, 'risk': 'low'},
                {'id': 'flipkart_delivery', 'capital': 50000, 'profit': 15000, 'risk': 'low'},
            ],
            'delhi': [
                {'id': 'toll_agent', 'capital': 30000, 'profit': 12000, 'risk': 'low'},
                {'id': 'metro_commuter_service', 'capital': 40000, 'profit': 15000, 'risk': 'low'},
                {'id': 'refugee_food_stall', 'capital': 35000, 'profit': 13000, 'risk': 'low'},
                {'id': 'pncr_card_agent', 'capital': 25000, 'profit': 10000, 'risk': 'low'},
                {'id': 'dtdc_agent', 'capital': 50000, 'profit': 18000, 'risk': 'low'},
            ],
            'hyderabad': [
                {'id': 'it_placement_agent', 'capital': 50000, 'profit': 25000, 'risk': 'medium'},
                {'id': 'pharma_wholesale', 'capital': 150000, 'profit': 40000, 'risk': 'medium'},
                {'id': 'ramzan_food_stall', 'capital': 40000, 'profit': 18000, 'risk': 'low'},
                {'id': 'old_city_tours', 'capital': 60000, 'profit': 20000, 'risk': 'low'},
                {'id': 'telangana_handloom', 'capital': 80000, 'profit': 22000, 'risk': 'low'},
            ],
            'chennai': [
                {'id': 'it_placement_agent', 'capital': 50000, 'profit': 25000, 'risk': 'medium'},
                {'id': 'auto_parts_shop', 'capital': 100000, 'profit': 28000, 'risk': 'medium'},
                {'id': 'tamil_speech_tuition', 'capital': 30000, 'profit': 12000, 'risk': 'low'},
                {'id': 'marine_food_restaurant', 'capital': 150000, 'profit': 40000, 'risk': 'medium'},
                {'id': 'fishermen_coop', 'capital': 60000, 'profit': 18000, 'risk': 'low'},
            ],
            'kolkata': [
                {'id': 'mishti_shop', 'capital': 80000, 'profit': 25000, 'risk': 'low'},
                {'id': 'bengali_tuition', 'capital': 30000, 'profit': 12000, 'risk': 'low'},
                {'id': 'metro_rail_vendor', 'capital': 40000, 'profit': 15000, 'risk': 'low'},
                {'id': 'puja_material_store', 'capital': 60000, 'profit': 30000, 'risk': 'medium'},
                {'id': 'jute_product', 'capital': 50000, 'profit': 15000, 'risk': 'low'},
            ]
        }

    def get_current_month(self):
        return datetime.now().month
    
    def analyze_news_for_opportunities(self, news: List[Dict]) -> Dict[str, Any]:
        """Analyze live news to find business opportunities - DYNAMICALLY"""
        business_mentions = {}
        local_issues = []
        positive_news = 0
        negative_news = 0
        dynamic_opportunities = []  # NEW: Generate new ideas from news
        
        for article in news:
            title = article.get('title', '')
            title_lower = title.lower()
            sentiment = article.get('sentiment', 'neutral')
            
            if sentiment == 'positive':
                positive_news += 1
            elif sentiment == 'negative':
                negative_news += 1
            
            # Check for local issues
            for issue_key, issue_data in LOCAL_ISSUES_MAPPING.items():
                if issue_key in title_lower:
                    local_issues.append({
                        'issue': issue_data['problem'],
                        'opportunity': issue_data['opportunity'],
                        'news': title
                    })
            
            # DYNAMIC: Generate NEW business ideas from news headlines
            # Extract keywords and create dynamic business ideas
            dynamic_idea = self._generate_business_from_news(title)
            if dynamic_idea:
                dynamic_opportunities.append(dynamic_idea)
            
            # Map to known businesses
            for keyword, businesses in NEWS_TO_BUSINESS_MAPPING.items():
                if keyword in title_lower:
                    for biz in businesses:
                        business_mentions[biz] = business_mentions.get(biz, 0) + 1
        
        return {
            'business_mentions': business_mentions,
            'local_issues': local_issues[:3],
            'sentiment': 'positive' if positive_news > negative_news else 'neutral',
            'dynamic_opportunities': dynamic_opportunities  # NEW!
        }
    
    def _generate_business_from_news(self, headline: str, city: str = "") -> Dict[str, Any]:
        """Generate NEW business idea from a news headline dynamically - TRULY ADAPTIVE"""
        headline_lower = headline.lower()
        
        # More patterns based on what's actually trending in India 2026
        trending_patterns = [
            # Super fast delivery / quick commerce
            (['10 minute', '15 minute', 'quick delivery', 'instant delivery', 'rapid delivery'],
             lambda: {'name': f'Quick Delivery Service in {city.title()}', 'capital': 40000, 'profit': 20000, 'desc': 'Ultra-fast local delivery in ' + city.title()}),
            
            # AI and automation for SMBs
            (['automation', 'ai tools', 'chatgpt', 'gpt', 'machine learning', 'ml'],
             lambda: {'name': 'AI Tools for Small Business', 'capital': 35000, 'profit': 25000, 'desc': 'Help SMBs adopt AI automation'}),
            
            # Digital payments
            (['payment', 'upi', 'digital payment', 'qr code'],
             lambda: {'name': 'Digital Payment Solutions', 'capital': 25000, 'profit': 15000, 'desc': 'UPI payment aggregation for local businesses'}),
            
            # Content creation
            (['content', 'video', 'youtube', 'influencer', 'reels', 'shorts'],
             lambda: {'name': 'Local Content Creation Studio', 'capital': 50000, 'profit': 30000, 'desc': 'Video/content for local businesses'}),
            
            # E-commerce for local
            (['online', 'ecommerce', 'e-commerce', 'website', 'app'],
             lambda: {'name': 'Local E-commerce Setup Service', 'capital': 40000, 'profit': 25000, 'desc': 'Help local shops go online'}),
            
            # Home services
            (['home service', 'at home', 'doorstep', 'home cleaning'],
             lambda: {'name': 'Home Service Business', 'capital': 30000, 'profit': 18000, 'desc': 'Doorstep services in local area'}),
            
            # Tuition and coaching
            (['tution', 'coaching', 'class', 'online class', 'learning'],
             lambda: {'name': 'Tuition & Coaching Center', 'capital': 25000, 'profit': 15000, 'desc': 'Personalized tutoring services'}),
            
            # Food delivery
            (['food delivery', 'parcel', 'tiffin', 'lunch box', 'biryani'],
             lambda: {'name': 'Food Delivery Business', 'capital': 45000, 'profit': 22000, 'desc': 'Cloud kitchen + delivery'}),
            
            # Grocery delivery
            (['grocery delivery', 'vegetables', 'fruits delivery', 'kirana delivery'],
             lambda: {'name': 'Grocery Delivery Service', 'capital': 35000, 'profit': 18000, 'desc': 'Fresh groceries delivered daily'}),
            
            # Mobile and tech repair
            (['repair', 'fix', 'service center', 'phone repair'],
             lambda: {'name': 'Tech Repair Service', 'capital': 30000, 'profit': 20000, 'desc': 'Phone/laptop repair service'}),
            
            # Pet care
            (['pet', 'dog walking', 'pet grooming', 'animal'],
             lambda: {'name': 'Pet Care Service', 'capital': 35000, 'profit': 18000, 'desc': 'Pet grooming and care services'}),
            
            # Fitness at home
            (['home workout', 'online fitness', 'personal trainer', 'gym'],
             lambda: {'name': 'Home Fitness Trainer', 'capital': 20000, 'profit': 25000, 'desc': 'Personal fitness at home'}),
            
            # Organic/Natural
            (['organic', 'natural', 'chemical free', 'healthy'],
             lambda: {'name': 'Organic Products Store', 'capital': 50000, 'profit': 22000, 'desc': 'Natural & organic products'}),
            
            # EV / Electric
            (['electric vehicle', 'ev charging', 'ev bike', 'electric scooty'],
             lambda: {'name': 'EV Charging/Rental', 'capital': 80000, 'profit': 35000, 'desc': 'Electric vehicle charging + rental'}),
            
            # Solar
            (['solar', 'solar panel', 'renewable energy'],
             lambda: {'name': 'Solar Solutions', 'capital': 70000, 'profit': 40000, 'desc': 'Solar panel sales & installation'}),
            
            # Real estate
            (['property', 'rent', 'flat', 'apartment', 'house rent'],
             lambda: {'name': 'Property Consultant', 'capital': 30000, 'profit': 25000, 'desc': 'Real estate brokerage'}),
            
            # Events
            (['wedding', 'party', 'event', 'birthday'],
             lambda: {'name': 'Event Planning Service', 'capital': 40000, 'profit': 30000, 'desc': 'Plan events and parties'}),
            
            # Laundry
            (['laundry', 'dry cleaning', 'washing'],
             lambda: {'name': 'Laundry Service', 'capital': 40000, 'profit': 18000, 'desc': 'Pickup & delivery laundry'}),
            
            # Salon at home
            (['salon', 'beauty', 'spa', 'parlour'],
             lambda: {'name': 'Home Salon Service', 'capital': 25000, 'profit': 20000, 'desc': 'Beauty services at home'}),
            
            # Courier/Logistics
            (['courier', 'logistics', 'shipping', 'delivery partner'],
             lambda: {'name': 'Local Courier Service', 'capital': 35000, 'profit': 20000, 'desc': 'Local shipping and courier'}),
            
            # Tours/Travel
            (['tour', 'travel', 'trip', 'booking'],
             lambda: {'name': 'Local Travel Agent', 'capital': 30000, 'profit': 22000, 'desc': 'Travel and tour bookings'}),
            
            # Insurance
            (['insurance', 'policy', 'claim'],
             lambda: {'name': 'Insurance Agent', 'capital': 20000, 'profit': 18000, 'desc': 'Insurance policy distribution'}),
            
            # Financial services
            (['loan', 'credit', 'finance', 'bank'],
             lambda: {'name': 'Financial Services', 'capital': 30000, 'profit': 25000, 'desc': 'Loan and credit facilitation'}),
            
            # Printing
            (['print', 'design', 'banner', 'flex'],
             lambda: {'name': 'Printing & Design', 'capital': 50000, 'profit': 25000, 'desc': 'Printing and graphic design'}),
            
            # Stationery
            (['stationery', 'books', 'office supplies'],
             lambda: {'name': 'Stationery Shop', 'capital': 40000, 'profit': 15000, 'desc': 'Books and stationery store'}),
            
            # Cyber cafe
            (['internet', 'wifi', 'cafe', 'computer'],
             lambda: {'name': 'Internet Cafe & Services', 'capital': 40000, 'profit': 18000, 'desc': 'Internet and computer services'}),
            
            # Scrap dealer
            (['scrap', 'waste', 'recycle', 'junk'],
             lambda: {'name': 'Scrap & Waste Collection', 'capital': 20000, 'profit': 15000, 'desc': 'Collect and recycle waste'}),
            
            # Milk dairy
            (['milk', 'dairy', 'curd', 'paneer'],
             lambda: {'name': 'Milk & Dairy Parlour', 'capital': 45000, 'profit': 20000, 'desc': 'Fresh milk and dairy products'}),
            
            # Fruits/ Vegetables
            (['fruits', 'vegetables', 'sabzi', 'green'],
             lambda: {'name': 'Fruit & Vegetable Shop', 'capital': 40000, 'profit': 18000, 'desc': 'Fresh produce retail'}),
            
            # Meat shop
            (['meat', 'chicken', 'fish', 'mutton'],
             lambda: {'name': 'Meat & Fish Shop', 'capital': 50000, 'profit': 25000, 'desc': 'Fresh meat and fish'}),
            
            # Bakery
            (['bakery', 'cake', 'pastry', 'bread'],
             lambda: {'name': 'Bakery', 'capital': 60000, 'profit': 28000, 'desc': 'Fresh bakery products'}),
            
            # Tea/Coffee
            (['tea', 'chai', 'coffee', 'cafe'],
             lambda: {'name': 'Tea & Coffee Cafe', 'capital': 35000, 'profit': 18000, 'desc': 'Beverages and snacks'}),
            
            # Hotel/Lodge
            (['hotel', 'lodge', 'rooms', 'accommodation'],
             lambda: {'name': 'Budget Hotel/Lodge', 'capital': 150000, 'profit': 45000, 'desc': 'Budget accommodation'}),
            
            # Parking
            (['parking', 'car', 'vehicle'],
             lambda: {'name': 'Parking Service', 'capital': 50000, 'profit': 25000, 'desc': 'Secure vehicle parking'}),
            
            # Tutoring
            (['tuiton', 'teaching', 'training', 'coaching'],
             lambda: {'name': 'Training Institute', 'capital': 40000, 'profit': 25000, 'desc': 'Professional skills training'}),
        ]
        
        # Dynamic business generators based on news patterns
        patterns = [
            # AI/Tech patterns
            (['ai', 'chatgpt', 'gpt', 'language model', 'automation'], 
             lambda: {'name': 'AI Consultation Service', 'capital': 50000, 'profit': 25000, 'desc': 'Help businesses adopt AI tools'}),
            (['app', 'application', 'mobile'], 
             lambda: {'name': 'App Development Agency', 'capital': 80000, 'profit': 35000, 'desc': 'Build mobile apps for local businesses'}),
            (['software', 'saas', 'cloud'], 
             lambda: {'name': 'SaaS Reseller', 'capital': 40000, 'profit': 18000, 'desc': 'Sell business software to SMEs'}),
            
            # Food patterns
            (['restaurant', 'food', 'dining', 'cafe', 'coffee'], 
             lambda: {'name': 'Cloud Kitchen', 'capital': 80000, 'profit': 28000, 'desc': 'Delivery-only kitchen'}),
            (['organic', 'healthy', 'nutrition'], 
             lambda: {'name': 'Health Food Delivery', 'capital': 50000, 'profit': 20000, 'desc': 'Healthy meal plans'}),
            (['biryani', 'pizza', 'burger', 'chinese'], 
             lambda: {'name': 'Specialty Food Counter', 'capital': 60000, 'profit': 22000, 'desc': 'Popular cuisine focus'}),
            
            # Delivery/Logistics
            (['delivery', 'logistics', 'shipping'], 
             lambda: {'name': 'Last-Mile Delivery Service', 'capital': 40000, 'profit': 20000, 'desc': 'Local delivery partnerships'}),
            (['quick commerce', '10 minutes', 'fast delivery'], 
             lambda: {'name': 'Quick Mart Franchise', 'capital': 70000, 'profit': 25000, 'desc': '15-min grocery delivery'}),
            
            # Health/Wellness
            (['fitness', 'gym', 'workout', 'exercise'], 
             lambda: {'name': 'Home Fitness Trainer', 'capital': 30000, 'profit': 20000, 'desc': 'Personal training at home'}),
            (['mental health', 'wellness', 'meditation', 'yoga'], 
             lambda: {'name': 'Wellness Studio', 'capital': 60000, 'profit': 22000, 'desc': 'Holistic wellness center'}),
            (['skin', 'beauty', 'cosmetics'], 
             lambda: {'name': 'D2C Beauty Brand', 'capital': 50000, 'profit': 25000, 'desc': 'Sell beauty products online'}),
            
            # Education
            (['online class', 'edtech', 'learning', 'course'], 
             lambda: {'name': 'Online Course Creator', 'capital': 30000, 'profit': 30000, 'desc': 'Create & sell online courses'}),
            (['skill', 'training', 'workshop'], 
             lambda: {'name': 'Skill Training Center', 'capital': 70000, 'profit': 28000, 'desc': 'Professional skill courses'}),
            
            # Real Estate/Housing
            (['rent', 'rental', 'lease'], 
             lambda: {'name': 'Property Management Service', 'capital': 50000, 'profit': 25000, 'desc': 'Manage rental properties'}),
            (['home', 'interior', 'furniture'], 
             lambda: {'name': 'Home Interior Service', 'capital': 80000, 'profit': 30000, 'desc': 'Home renovation & decor'}),
            
            # EV/Transport
            (['ev', 'electric vehicle', 'charging'], 
             lambda: {'name': 'EV Charging Station', 'capital': 150000, 'profit': 35000, 'desc': 'EV charging points'}),
            (['bike', 'scooter', 'rent'], 
             lambda: {'name': 'Bike Rental Business', 'capital': 60000, 'profit': 22000, 'desc': 'Rent bikes for commute'}),
            
            # Sustainability
            (['solar', 'renewable', 'energy'], 
             lambda: {'name': 'Solar Panel Sales & Install', 'capital': 100000, 'profit': 40000, 'desc': 'Residential solar systems'}),
            (['waste', 'recycle', 'plastic'], 
             lambda: {'name': 'Waste Management Service', 'capital': 50000, 'profit': 18000, 'desc': 'Recycling collection'}),
            
            # Pet/Animals
            (['pet', 'dog', 'animal'], 
             lambda: {'name': 'Pet Care Service', 'capital': 40000, 'profit': 18000, 'desc': 'Pet grooming & sitting'}),
            
            # Events/Entertainment
            (['wedding', 'event', 'party'], 
             lambda: {'name': 'Event Planning Service', 'capital': 50000, 'profit': 30000, 'desc': 'Plan weddings & events'}),
            (['photo', 'video', 'content'], 
             lambda: {'name': 'Content Creation Studio', 'capital': 60000, 'profit': 28000, 'desc': 'Video & photo for brands'}),
            
            # Services
            (['cleaning', 'sanitization'], 
             lambda: {'name': 'Professional Cleaning Service', 'capital': 40000, 'profit': 20000, 'desc': 'Home & office cleaning'}),
            (['repair', 'fix', 'maintenance'], 
             lambda: {'name': 'Home Repair Service', 'capital': 35000, 'profit': 18000, 'desc': 'Multi-repair handyman'}),
            (['security', 'cctv', 'camera'], 
             lambda: {'name': 'Security Installation', 'capital': 80000, 'profit': 30000, 'desc': 'CCTV & security systems'}),
            
            # Digital Services
            (['digital', 'marketing', 'social media'], 
             lambda: {'name': 'Digital Marketing Agency', 'capital': 40000, 'profit': 25000, 'desc': 'Social media for businesses'}),
            (['website', 'seo', 'google'], 
             lambda: {'name': 'Web Development Service', 'capital': 35000, 'profit': 22000, 'desc': 'Build websites for SMEs'}),
            (['data', 'analytics', 'report'], 
             lambda: {'name': 'Data Analysis Consultant', 'capital': 40000, 'profit': 30000, 'desc': 'Business analytics服务'}),
        ]
        
        # Use ALL patterns combined (trending + general)
        all_patterns = trending_patterns + patterns
        
        for keywords, generator in all_patterns:
            for keyword in keywords:
                if keyword in headline_lower:
                    idea = generator()
                    return {
                        'business_name': idea['name'],
                        'description': idea['desc'],
                        'capital': idea['capital'],
                        'monthly_profit': idea['profit'],
                        'based_on': headline[:60] + '...',
                        'is_dynamic': True
                    }
        return None
    
    def get_festival_boost(self) -> Dict[str, Any]:
        """Get current festival season boost"""
        from datetime import datetime
        month = datetime.now().strftime('%b').lower()
        current_month = datetime.now().month
        
        festivals = FESTIVALS.get(month, [])
        
        # Festival-boosted businesses
        festival_boosts = {
            'diwali': ['retail', 'restaurant', 'grocery', 'premium_grocery', 'fitness', 'salon'],
            'christmas': ['restaurant', 'retail', 'grocery', 'food_stall'],
            'new year': ['restaurant', 'retail', 'fitness', 'salon'],
            'holi': ['restaurant', 'grocery', 'food_stall', 'pharmacy'],
            'eid': ['restaurant', 'grocery', 'retail'],
            'independence day': ['retail', 'restaurant', 'grocery'],
            'rakhi': ['retail', 'grocery', 'restaurant'],
            'ganesh chaturthi': ['restaurant', 'grocery', 'retail'],
            'dussehra': ['retail', 'grocery', 'restaurant'],
            'valentine': ['restaurant', 'salon', 'grocery', 'fitness'],
            'mothers day': ['restaurant', 'salon', 'grocery', 'fitness'],
            'fathers day': ['restaurant', 'salon', 'grocery', 'fitness'],
            'holi': ['restaurant', 'grocery', 'food_stall'],
            'onam': ['restaurant', 'grocery', 'retail'],
        }
        
        active_festivals = []
        boosted_businesses = set()
        
        for festival in festivals:
            if festival in festival_boosts:
                active_festivals.append(festival.title())
                boosted_businesses.update(festival_boosts[festival])
        
        return {
            'active': active_festivals,
            'boosted_businesses': list(boosted_businesses),
            'season': 'festival' if active_festivals else 'normal'
        }
    
    def _get_capital_tier(self, capital: float) -> str:
        """Get capital tier description"""
        if capital <= 30000:
            return "Starter (Under ₹30K)"
        elif capital <= 50000:
            return "Micro (₹30K-50K)"
        elif capital <= 80000:
            return "Small (₹50K-80K)"
        elif capital <= 150000:
            return "Growing (₹80K-1.5L)"
        elif capital <= 300000:
            return "Medium (₹1.5L-3L)"
        else:
            return "Premium (₹3L+)"

    def generate_dynamic_recommendations(self, capital: float, risk_appetite: str, city: str, user_interests: List[str] = None):
        # Get live data from trends service
        city_live = trends_service.get_city_live_data(city)
        trends = trends_service.fetch_live_trends()
        economic = trends_service.fetch_economic_indicators()
        
        # Get live news and analyze for opportunities
        live_news = city_live.get('news', [])
        news_analysis = self.analyze_news_for_opportunities(live_news)
        news_business_opportunities = news_analysis.get('business_mentions', {})
        local_issues = news_analysis.get('local_issues', [])
        
        # Get festival boost
        festival_data = self.get_festival_boost()
        
        # Get city data dynamically from all Indian cities
        city_info = get_city_data(city)
        user_interests = user_interests or []
        
        recommendations = []
        
        # Add standard businesses
        for biz_id, biz_data in self.business_data.items():
            if biz_data['capital'] > capital:
                continue
            
            score = 50
            reasons = []
            
            # City sector match
            if biz_id in city_info['top_sectors']:
                score += 25
                reasons.append(f"📍 Top sector in {city_info['name']}")
            
            # City hot sectors
            if biz_id in city_live.get('hot_sectors', []):
                score += 20
                reasons.append(city_live.get('live_trend', '🔥 Hot sector'))
            
            # Live trends boost
            for trend in trends:
                if biz_id in trend['affected']:
                    score += int(trend['boost'] * 30)
                    if trend['name'] not in str(reasons):
                        reasons.append(f"📈 {trend['name']}")
            
            # LIVE NEWS BASED SCORING - The key differentiator!
            if biz_id in news_business_opportunities:
                mentions = news_business_opportunities[biz_id]
                score += mentions * 15  # 15 points per news mention
                reasons.append(f"📰 Trending in latest news (+{mentions * 15}%)")
            
            # Festival boost
            if festival_data.get('season') == 'festival' and biz_id in festival_data.get('boosted_businesses', []):
                score += 20
                reasons.append(f"🎉 {', '.join(festival_data.get('active', []))} season!")
            
            # Problem-solution boost (local issues)
            for issue in local_issues:
                opp = issue.get('opportunity', '').lower()
                if biz_id.replace('_', ' ') in opp or biz_id in opp:
                    score += 25
                    reasons.append(f"💡 Solves local problem: {issue.get('issue', 'Local issue')}")
                    break
            
            # Risk appetite matching
            if risk_appetite == 'low' and biz_data['risk'] == 'low':
                score += 15
                reasons.append("✅ Matches your risk profile")
            elif risk_appetite == 'high' and biz_data['risk'] == 'high':
                score += 10
                reasons.append("🎯 High risk, high reward")
            
            # ROI
            roi = biz_data['profit'] / biz_data['capital']
            if roi > 0.25:
                score += 10
                reasons.append(f"💰 Great ROI: {roi*100:.0f}%")
            
            # User interests
            if biz_id in user_interests:
                score += 15
                reasons.append("❤️ Matches your interests")
            
            # Business insights
            insights = trends_service.get_business_insights(biz_id)
            
            recommendations.append({
                'business_id': biz_id,
                'business_name': biz_id.replace('_', ' ').title(),
                'icon': self._get_business_icon(biz_id),
                'capital_required': biz_data['capital'],
                'monthly_profit': biz_data['profit'],
                'projected_annual_profit': int(biz_data['profit'] * 12 * (1 + insights.get('growth_potential', 5)/100)),
                'risk_level': biz_data['risk'],
                'score': min(100, score),
                'reasons': reasons[:4],
                'outlook': insights.get('outlook', '📊 Stable'),
                'growth_potential': insights.get('growth_potential', 5),
                'profit_margin': insights.get('profit_margin', '15%'),
                'market_size': insights.get('market_size', '$10B'),
                'growth_rate': insights.get('growth_rate', '+5% YoY'),
                'key_drivers': insights.get('key_drivers', [])[:3],
                'funding_availability': insights.get('funding_availability', '🔴 Low')
            })
        
        # Add city-specific niche businesses
        niche_businesses = self.city_niche_businesses.get(city.lower(), [])
        for niche in niche_businesses:
            if niche['capital'] > capital:
                continue
            
            niche_id = niche['id']
            score = 60  # Higher base score for niche
            reasons = [f"🎯 Popular in {city_info['name']}"]
            
            # Check if this niche is mentioned in news
            for article in live_news:
                title = article.get('title', '').lower()
                if niche_id.replace('_', ' ') in title or any(word in title for word in niche_id.split('_')):
                    score += 20
                    reasons.append("📰 Trending locally!")
                    break
            
            # Festival boost
            if festival_data.get('season') == 'festival':
                score += 15
                reasons.append(f"🎉 {festival_data.get('active', ['Festival'])[0]} season!")
            
            # Local issue boost
            for issue in local_issues:
                if any(word in issue.get('opportunity', '').lower() for word in niche_id.split('_')):
                    score += 20
                    reasons.append(f"💡 Solves: {issue.get('issue', 'Local issue')}")
                    break
            
            # Risk matching
            if risk_appetite == 'low' and niche['risk'] == 'low':
                score += 15
            elif risk_appetite == 'high' and niche['risk'] == 'high':
                score += 10
            
            # ROI
            roi = niche['profit'] / niche['capital']
            if roi > 0.3:
                score += 10
                reasons.append(f"💰 Amazing ROI: {roi*100:.0f}%")
            
            insights = trends_service.get_business_insights(niche_id)
            
            recommendations.append({
                'business_id': niche_id,
                'business_name': niche_id.replace('_', ' ').title(),
                'icon': '⭐',
                'capital_required': niche['capital'],
                'monthly_profit': niche['profit'],
                'projected_annual_profit': int(niche['profit'] * 12 * 1.1),
                'risk_level': niche['risk'],
                'score': min(100, score),
                'reasons': reasons[:4],
                'outlook': '🔥 Hot in ' + city_info['name'],
                'growth_potential': 15,
                'profit_margin': f"{roi*100:.0f}%",
                'market_size': '$1B',
                'growth_rate': '+20% YoY',
                'key_drivers': ['Local demand', 'City-specific'],
                'funding_availability': '🟡 Medium',
                'is_niche': True
            })
        
        # Add DYNAMIC opportunities from live news - NEW!
        dynamic_opportunities = news_analysis.get('dynamic_opportunities', [])
        seen_dynamic = set()
        for dyn in dynamic_opportunities:
            dyn_name = dyn.get('business_name', '')
            if dyn_name in seen_dynamic:
                continue
            seen_dynamic.add(dyn_name)
            
            if dyn.get('capital', 0) > capital:
                continue
            
            score = 75  # High base for dynamic
            reasons = [f"📰 Based on: {dyn.get('based_on', 'Live news')[:40]}"]
            
            # Festival boost
            if festival_data.get('season') == 'festival':
                score += 15
                reasons.append(f"🎉 {festival_data.get('active', ['Festival'])[0]} season!")
            
            # Risk matching
            risk_map = {'low': 'low', 'medium': 'medium', 'high': 'high'}
            if risk_appetite == 'low':
                score += 10
            
            roi = dyn.get('monthly_profit', 0) / dyn.get('capital', 1)
            if roi > 0.3:
                score += 10
                reasons.append(f"💰 Great ROI: {roi*100:.0f}%")
            
            recommendations.append({
                'business_id': dyn_name.lower().replace(' ', '_'),
                'business_name': dyn_name,
                'icon': '⚡',
                'capital_required': dyn.get('capital', 50000),
                'monthly_profit': dyn.get('monthly_profit', 20000),
                'projected_annual_profit': int(dyn.get('monthly_profit', 20000) * 12 * 1.2),
                'risk_level': 'medium',
                'score': min(100, score),
                'reasons': reasons[:3],
                'outlook': '🔥 Trending Now!',
                'growth_potential': 25,
                'profit_margin': f"{roi*100:.0f}%",
                'market_size': '$500M',
                'growth_rate': '+30% YoY',
                'key_drivers': ['News-driven', 'New market'],
                'funding_availability': '🟢 High',
                'is_dynamic': True,
                'description': dyn.get('description', '')
            })
        
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        
        return {
            'city': city_live['name'],
            'city_demand': city_live['current_demand'],
            'city_growth': city_live['growth_rate'],
            'purchasing_power': city_live['purchasing_power'],
            'competition_level': city_live['competition'],
            'available_capital': capital,
            'capital_tier': self._get_capital_tier(capital),
            'matching_businesses_count': len(recommendations),
            'city_live_trend': city_live['live_trend'],
            'trend_emoji': city_live.get('trend_emoji', '📊'),
            'hot_sectors': city_live['hot_sectors'],
            'city_news': city_live.get('news', [])[:5],
            'news_based_opportunities': news_business_opportunities,
            'local_issues': local_issues,
            'dynamic_opportunities': [d.get('business_name') for d in dynamic_opportunities],
            'festival_season': festival_data,
            'market_sentiment': news_analysis.get('sentiment', 'neutral'),
            'market_insight': city_live.get('market_insight', ''),
            'current_trends': [{'name': t['name'], 'confidence': t['confidence']} for t in trends[:5]],
            'seasonal_factor': 1.0,
            'economic_indicators': economic,
            'recommendations': recommendations[:6]
        }

    def _get_business_icon(self, biz_id: str) -> str:
        icons = {
            'restaurant': '🍛', 'grocery': '🥬', 'premium_grocery': '🥗',
            'retail': '👕', 'tech': '💻', 'fitness': '🏋️',
            'pharmacy': '💊', 'salon': '💇', 'service': '📋',
            'manufacturing': '🏭', 'food_stall': '🍕', 'mobile_repair': '📱',
            'tuition': '📚', 'laundry': '👔'
        }
        return icons.get(biz_id, '💼')

    def generate_recommendations(self, user: Dict, city: Dict, market: Dict, business: Dict):
        return self.generate_dynamic_recommendations(
            capital=user.get('capital', 100000),
            risk_appetite=user.get('risk_appetite', 'medium'),
            city=city.get('city', 'mumbai'),
            user_interests=user.get('interests', [])
        )

    def simulate_journey(self, user: Dict, city: Dict, initial_cash: float, months: int, decisions: List[str]):
        cash = initial_cash
        monthly_states = []
        
        for month in range(1, months + 1):
            revenue = initial_cash * 0.3 * (1 + month * 0.05)
            costs = initial_cash * 0.2
            
            if month <= len(decisions):
                if decisions[month - 1] == 'expand':
                    costs += 50000
                    revenue *= 1.3
            
            profit = revenue - costs
            cash += profit
            
            monthly_states.append({
                'month': month,
                'revenue': round(revenue),
                'costs': round(costs),
                'profit': round(profit),
                'cash': round(cash)
            })
        
        return {
            'initial_cash': initial_cash,
            'final_cash': round(cash),
            'total_profit': sum(s['profit'] for s in monthly_states),
            'monthly_states': monthly_states,
            'outcome': 'success' if cash > initial_cash else 'failure'
        }
