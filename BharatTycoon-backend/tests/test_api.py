"""
BharatTycoon Backend Tests
Run with: pytest tests/ -v
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

client = TestClient(app)


class TestIndiaEndpoints:
    """Test India geography endpoints"""

    def test_root(self):
        response = client.get("/")
        assert response.status_code == 200
        assert "message" in response.json()

    def test_get_states(self):
        response = client.get("/india/states")
        assert response.status_code == 200
        data = response.json()
        assert "states" in data
        assert len(data["states"]) > 0

    def test_search_states(self):
        response = client.get("/india/search?q=delhi")
        assert response.status_code == 200
        data = response.json()
        assert "states" in data or "cities" in data

    def test_get_cities(self):
        response = client.get("/india/cities")
        assert response.status_code == 200
        data = response.json()
        assert "cities" in data


class TestFinancialEndpoints:
    """Test financial system endpoints"""

    def test_financial_status(self):
        response = client.get("/financial/status")
        assert response.status_code == 200
        data = response.json()
        assert data["financial_system"] == "Active"
        assert "available_business_types" in data

    def test_financial_report(self):
        response = client.post("/financial/report", json={
            "business_type": "restaurant",
            "city_tier": 1,
            "initial_capital": 500000,
            "months": 12
        })
        assert response.status_code == 200
        data = response.json()
        assert "annual_summary" in data
        assert data["business_type"] == "restaurant"

    def test_financial_compare(self):
        response = client.post("/financial/compare", json={
            "business_types": ["restaurant", "tech"],
            "city_tier": 1,
            "initial_capital": 500000
        })
        assert response.status_code == 200
        data = response.json()
        assert "comparisons" in data
        assert len(data["comparisons"]) == 2

    def test_financial_breakdown(self):
        response = client.get("/financial/breakdown/restaurant?city_tier=1&capital=500000")
        assert response.status_code == 200
        data = response.json()
        assert "monthly_data" in data
        assert len(data["monthly_data"]) == 12

    def test_profit_loss(self):
        response = client.post("/financial/profit-loss", json={
            "revenue": 100000,
            "expenses": {"rent": 20000, "salaries": 30000}
        })
        assert response.status_code == 200
        data = response.json()
        assert data["net_profit"] == 50000
        assert data["status"] == "profitable"


class TestFinancialSystem:
    """Test financial system module directly"""

    def test_balance_sheet_calculation(self):
        from ai.financial_system import BalanceSheet
        
        bs = BalanceSheet(
            cash=100000,
            inventory=50000,
            equipment=200000,
            loans_payable=100000
        )
        
        assert bs.total_assets() == 350000
        assert bs.total_liabilities() == 100000
        assert bs.net_worth() == 250000

    def test_income_statement_calculation(self):
        from ai.financial_system import IncomeStatement
        
        income = IncomeStatement(
            sales_revenue=500000,
            cost_of_goods_sold=200000,
            rent_expense=50000,
            salaries_expense=100000
        )
        
        assert income.gross_profit() == 300000
        assert income.total_revenue() == 500000

    def test_business_financials(self):
        from ai.financial_system import BusinessFinancials
        
        bf = BusinessFinancials("restaurant", 1, 500000)
        monthly = bf.calculate_monthly(1)
        
        assert "summary" in monthly
        assert monthly["summary"]["revenue"] > 0

    def test_generate_financial_report(self):
        from ai.financial_system import generate_financial_report
        
        report = generate_financial_report("tech", 1, 1000000, 3)
        
        assert "annual_summary" in report
        assert report["period"] == "Year 1 - Month 1 to Month 3"


class TestMLEndpoints:
    """Test ML endpoints"""

    def test_ml_status(self):
        response = client.get("/ml/status")
        assert response.status_code == 200
        data = response.json()
        assert "ml_engine" in data
        assert "powered_by" in data

    def test_ml_sentiment(self):
        response = client.get("/ml/sentiment?text=I love this business opportunity")
        assert response.status_code == 200
        data = response.json()
        assert "sentiment" in data

    def test_ml_entities(self):
        response = client.get("/ml/entities?text=Mumbai restaurant opening")
        assert response.status_code == 200
        data = response.json()
        assert "entities" in data

    def test_ml_summarize(self):
        response = client.get("/ml/summarize?text=This is a long text about business opportunities in India. The market is growing rapidly and there are many chances for entrepreneurs to succeed.")
        assert response.status_code == 200
        data = response.json()
        assert "summary" in data

    def test_ml_classify(self):
        response = client.get("/ml/classify?text=Restaurant with Indian food")
        assert response.status_code == 200
        data = response.json()
        assert "classification" in data


class TestAIEndpoints:
    """Test AI text generation endpoints"""

    def test_ai_advice(self):
        response = client.get("/ai/generate-advice?context=starting a restaurant")
        assert response.status_code == 200
        data = response.json()
        assert "advice" in data

    def test_ai_marketing_copy(self):
        response = client.get("/ai/marketing-copy?product=restaurant&tone=professional")
        assert response.status_code == 200
        data = response.json()
        assert "tagline" in data or "description" in data

    def test_ai_business_names(self):
        response = client.get("/ai/business-names?business_type=restaurant")
        assert response.status_code == 200
        data = response.json()
        assert "suggested_names" in data

    def test_ai_translate_hindi(self):
        response = client.get("/ai/translate-to-hindi?text=Welcome to business")
        assert response.status_code == 200
        data = response.json()
        assert "hindi" in data

    def test_ai_languages(self):
        response = client.get("/ai/languages")
        assert response.status_code == 200
        data = response.json()
        assert "languages" in data

    def test_ai_answer_question(self):
        response = client.get("/ai/answer-question?question=What are the risks?&topic=restaurant")
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data

    def test_ai_business_faq(self):
        response = client.get("/ai/business-faq?topic=restaurant")
        assert response.status_code == 200
        data = response.json()
        assert "topic" in data


class TestUnifiedEndpoints:
    """Test unified recommendation endpoints"""

    def test_recommendations(self):
        response = client.post("/unified/recommendations", json={
            "user": {
                "capital": 500000,
                "risk_appetite": "medium",
                "experience": "intermediate",
                "time_commitment": "moderate",
                "interests": ["restaurant", "retail"]
            },
            "city": {
                "city": "mumbai",
                "business_type": "restaurant",
                "purchasing_power": 0.8,
                "competition_level": 0.6,
                "seasonality": [1,1,1,1,1,1,1,1,1,1,1,1]
            }
        })
        assert response.status_code == 200
        data = response.json()
        assert "recommendations" in data or "top_recommendations" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
