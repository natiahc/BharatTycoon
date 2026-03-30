"""
BharatTycoon Financial System
Generates Balance Sheets, Income Statements, and Financial Ratios based on game state
"""

import random
from typing import Dict, List, Any, Optional
from datetime import datetime
from dataclasses import dataclass, field
from enum import Enum


class BusinessType(Enum):
    RESTAURANT = "restaurant"
    RETAIL = "retail"
    TECH = "tech"
    SALON = "salon"
    TUITION = "tuition"
    MANUFACTURING = "manufacturing"
    TRANSPORT = "transport"
    HEALTHCARE = "healthcare"


@dataclass
class BalanceSheet:
    """Balance Sheet showing Assets, Liabilities, and Equity"""
    
    # Assets
    cash: float = 0.0
    accounts_receivable: float = 0.0  # Money owed to you
    inventory: float = 0.0  # Stock value
    equipment: float = 0.0  # Machinery, furniture
    property_value: float = 0.0  # Owned property
    
    # Liabilities
    loans_payable: float = 0.0  # Bank loans
    accounts_payable: float = 0.0  # Money you owe
    taxes_payable: float = 0.0  # Pending taxes
    
    # Equity
    owner_equity: float = 0.0  # Your investment
    retained_earnings: float = 0.0  # Accumulated profits
    
    def total_assets(self) -> float:
        return self.cash + self.accounts_receivable + self.inventory + self.equipment + self.property_value
    
    def total_liabilities(self) -> float:
        return self.loans_payable + self.accounts_payable + self.taxes_payable
    
    def net_worth(self) -> float:
        return self.total_assets() - self.total_liabilities()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "assets": {
                "cash": round(self.cash, 2),
                "accounts_receivable": round(self.accounts_receivable, 2),
                "inventory": round(self.inventory, 2),
                "equipment": round(self.equipment, 2),
                "property_value": round(self.property_value, 2),
                "total_assets": round(self.total_assets(), 2)
            },
            "liabilities": {
                "loans_payable": round(self.loans_payable, 2),
                "accounts_payable": round(self.accounts_payable, 2),
                "taxes_payable": round(self.taxes_payable, 2),
                "total_liabilities": round(self.total_liabilities(), 2)
            },
            "equity": {
                "owner_equity": round(self.owner_equity, 2),
                "retained_earnings": round(self.retained_earnings, 2),
                "total_equity": round(self.owner_equity + self.retained_earnings, 2)
            },
            "net_worth": round(self.net_worth(), 2),
            "balance_check": round(self.total_assets() - self.total_liabilities() - self.owner_equity - self.retained_earnings, 2)
        }


@dataclass
class IncomeStatement:
    """Income Statement showing Revenue, Expenses, and Profit/Loss"""
    
    # Revenue
    sales_revenue: float = 0.0
    service_revenue: float = 0.0
    other_income: float = 0.0
    
    # Operating Expenses
    cost_of_goods_sold: float = 0.0  # COGS
    rent_expense: float = 0.0
    salaries_expense: float = 0.0
    utilities_expense: float = 0.0
    marketing_expense: float = 0.0
    supplies_expense: float = 0.0
    maintenance_expense: float = 0.0
    insurance_expense: float = 0.0
    depreciation_expense: float = 0.0
    other_expenses: float = 0.0
    
    # Other
    interest_expense: float = 0.0
    taxes_expense: float = 0.0
    
    def gross_profit(self) -> float:
        return self.sales_revenue + self.service_revenue - self.cost_of_goods_sold
    
    def operating_profit(self) -> float:
        return self.gross_profit() - self.total_operating_expenses()
    
    def net_profit(self) -> float:
        return self.operating_profit() - self.interest_expense - self.taxes_expense
    
    def total_revenue(self) -> float:
        return self.sales_revenue + self.service_revenue + self.other_income
    
    def total_operating_expenses(self) -> float:
        return (self.rent_expense + self.salaries_expense + self.utilities_expense +
                self.marketing_expense + self.supplies_expense + self.maintenance_expense +
                self.insurance_expense + self.depreciation_expense + self.other_expenses)
    
    def profit_margin(self) -> float:
        revenue = self.total_revenue()
        if revenue == 0:
            return 0.0
        return (self.net_profit() / revenue) * 100
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "revenue": {
                "sales_revenue": round(self.sales_revenue, 2),
                "service_revenue": round(self.service_revenue, 2),
                "other_income": round(self.other_income, 2),
                "total_revenue": round(self.total_revenue(), 2)
            },
            "cost_of_goods_sold": round(self.cost_of_goods_sold, 2),
            "gross_profit": round(self.gross_profit(), 2),
            "operating_expenses": {
                "rent": round(self.rent_expense, 2),
                "salaries": round(self.salaries_expense, 2),
                "utilities": round(self.utilities_expense, 2),
                "marketing": round(self.marketing_expense, 2),
                "supplies": round(self.supplies_expense, 2),
                "maintenance": round(self.maintenance_expense, 2),
                "insurance": round(self.insurance_expense, 2),
                "depreciation": round(self.depreciation_expense, 2),
                "other": round(self.other_expenses, 2),
                "total": round(self.total_operating_expenses(), 2)
            },
            "operating_profit": round(self.operating_profit(), 2),
            "interest_expense": round(self.interest_expense, 2),
            "taxes_expense": round(self.taxes_expense, 2),
            "net_profit": round(self.net_profit(), 2),
            "profit_margin_percent": round(self.profit_margin(), 2)
        }


@dataclass
class CashFlow:
    """Cash Flow Statement"""
    
    operating_cash_flow: float = 0.0
    investing_cash_flow: float = 0.0
    financing_cash_flow: float = 0.0
    
    def net_cash_flow(self) -> float:
        return self.operating_cash_flow + self.investing_cash_flow + self.financing_cash_flow
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "operating_cash_flow": round(self.operating_cash_flow, 2),
            "investing_cash_flow": round(self.investing_cash_flow, 2),
            "financing_cash_flow": round(self.financing_cash_flow, 2),
            "net_cash_flow": round(self.net_cash_flow(), 2)
        }


class FinancialRatios:
    """Calculate key financial ratios"""
    
    def __init__(self, balance_sheet: BalanceSheet, income_statement: IncomeStatement):
        self.bs = balance_sheet
        self.is_stmt = income_statement
    
    def liquidity_ratios(self) -> Dict[str, float]:
        current_assets = self.bs.cash + self.bs.accounts_receivable + self.bs.inventory
        current_liabilities = self.bs.accounts_payable + self.bs.taxes_payable
        
        current_ratio = current_assets / current_liabilities if current_liabilities > 0 else 0
        quick_ratio = (current_assets - self.bs.inventory) / current_liabilities if current_liabilities > 0 else 0
        cash_ratio = self.bs.cash / current_liabilities if current_liabilities > 0 else 0
        
        return {
            "current_ratio": round(current_ratio, 2),
            "quick_ratio": round(quick_ratio, 2),
            "cash_ratio": round(cash_ratio, 2),
            "working_capital": round(current_assets - current_liabilities, 2)
        }
    
    def profitability_ratios(self) -> Dict[str, float]:
        revenue = self.is_stmt.total_revenue()
        return {
            "gross_margin": round((self.is_stmt.gross_profit() / revenue * 100) if revenue > 0 else 0, 2),
            "operating_margin": round((self.is_stmt.operating_profit() / revenue * 100) if revenue > 0 else 0, 2),
            "net_margin": round((self.is_stmt.net_profit() / revenue * 100) if revenue > 0 else 0, 2),
            "roe": round((self.is_stmt.net_profit() / self.bs.owner_equity * 100) if self.bs.owner_equity > 0 else 0, 2),
            "roa": round((self.is_stmt.net_profit() / self.bs.total_assets() * 100) if self.bs.total_assets() > 0 else 0, 2)
        }
    
    def leverage_ratios(self) -> Dict[str, float]:
        total_debt = self.bs.loans_payable + self.bs.accounts_payable
        return {
            "debt_to_equity": round(total_debt / self.bs.owner_equity if self.bs.owner_equity > 0 else 0, 2),
            "debt_to_assets": round(total_debt / self.bs.total_assets() if self.bs.total_assets() > 0 else 0, 2),
            "interest_coverage": round(self.is_stmt.operating_profit() / self.is_stmt.interest_expense if self.is_stmt.interest_expense > 0 else 0, 2)
        }
    
    def efficiency_ratios(self) -> Dict[str, float]:
        revenue = self.is_stmt.total_revenue()
        return {
            "asset_turnover": round(revenue / self.bs.total_assets() if self.bs.total_assets() > 0 else 0, 2),
            "inventory_turnover": round(self.is_stmt.cost_of_goods_sold / self.bs.inventory if self.bs.inventory > 0 else 0, 2),
            "days_sales_outstanding": round((self.bs.accounts_receivable / revenue * 30) if revenue > 0 else 0, 1)
        }
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "liquidity": self.liquidity_ratios(),
            "profitability": self.profitability_ratios(),
            "leverage": self.leverage_ratios(),
            "efficiency": self.efficiency_ratios()
        }


class BusinessFinancials:
    """Generate financial statements based on business type and game state"""
    
    def __init__(self, business_type: str, city_tier: int, initial_capital: float):
        self.business_type = BusinessType(business_type.lower())
        self.city_tier = city_tier  # 1=Tier1, 2=Tier2, 3=Tier3
        self.initial_capital = initial_capital
        
        # City-based multipliers
        self.tier_multiplier = {1: 1.5, 2: 1.0, 3: 0.7}[city_tier]
        
        # Business type specifics
        self.business_configs = {
            BusinessType.RESTAURANT: {
                "cogs_percent": 0.35,
                "rent_monthly_per_sqft": 80,
                "avg_transaction": 300,
                "daily_customers_tier1": 80,
                "inventory_turnover_days": 7
            },
            BusinessType.RETAIL: {
                "cogs_percent": 0.60,
                "rent_monthly_per_sqft": 60,
                "avg_transaction": 500,
                "daily_customers_tier1": 50,
                "inventory_turnover_days": 30
            },
            BusinessType.TECH: {
                "cogs_percent": 0.15,
                "rent_monthly_per_sqft": 50,
                "avg_transaction": 5000,
                "daily_customers_tier1": 5,
                "inventory_turnover_days": 1
            },
            BusinessType.SALON: {
                "cogs_percent": 0.20,
                "rent_monthly_per_sqft": 40,
                "avg_transaction": 500,
                "daily_customers_tier1": 20,
                "inventory_turnover_days": 14
            },
            BusinessType.TUITION: {
                "cogs_percent": 0.05,
                "rent_monthly_per_sqft": 25,
                "avg_transaction": 2000,
                "daily_customers_tier1": 15,
                "inventory_turnover_days": 0
            },
            BusinessType.MANUFACTURING: {
                "cogs_percent": 0.50,
                "rent_monthly_per_sqft": 20,
                "avg_transaction": 10000,
                "daily_customers_tier1": 3,
                "inventory_turnover_days": 45
            },
            BusinessType.TRANSPORT: {
                "cogs_percent": 0.40,
                "rent_monthly_per_sqft": 10,
                "avg_transaction": 2000,
                "daily_customers_tier1": 10,
                "inventory_turnover_days": 0
            },
            BusinessType.HEALTHCARE: {
                "cogs_percent": 0.25,
                "rent_monthly_per_sqft": 70,
                "avg_transaction": 1000,
                "daily_customers_tier1": 25,
                "inventory_turnover_days": 14
            }
        }
    
    def calculate_monthly(self, month: int, growth_rate: float = 0.05) -> Dict[str, Any]:
        """Calculate financial statements for a given month"""
        
        config = self.business_configs.get(self.business_type, self.business_configs[BusinessType.TECH])
        
        # Base calculations with growth
        growth_factor = 1 + (growth_rate * month)
        tier_factor = self.tier_multiplier
        
        daily_customers = config["daily_customers_tier1"] * tier_factor * growth_factor
        monthly_revenue = daily_customers * config["avg_transaction"] * 30
        
        # Income Statement
        income = IncomeStatement()
        
        if self.business_type == BusinessType.TECH:
            income.service_revenue = monthly_revenue
        else:
            income.sales_revenue = monthly_revenue * 0.8
            income.service_revenue = monthly_revenue * 0.2
        
        income.cost_of_goods_sold = monthly_revenue * config["cogs_percent"]
        
        # Expenses based on business size
        space_sqft = min(2000, self.initial_capital / 500)
        income.rent_expense = space_sqft * config["rent_monthly_per_sqft"]
        income.salaries_expense = monthly_revenue * 0.15
        income.utilities_expense = monthly_revenue * 0.03
        income.marketing_expense = monthly_revenue * 0.05
        income.supplies_expense = monthly_revenue * 0.02
        income.maintenance_expense = monthly_revenue * 0.02
        income.insurance_expense = monthly_revenue * 0.01
        income.depreciation_expense = self.initial_capital * 0.001
        income.other_expenses = monthly_revenue * 0.02
        
        # Loan interest if applicable
        if hasattr(self, 'loan_amount') and self.loan_amount > 0:
            income.interest_expense = self.loan_amount * 0.01  # 12% annual
            self.loan_amount *= 0.99  # Principal paid down
        
        # Taxes
        profit_before_tax = income.operating_profit()
        income.taxes_expense = max(0, profit_before_tax * 0.25) if profit_before_tax > 0 else 0
        
        # Balance Sheet
        balance = BalanceSheet()
        balance.cash = monthly_revenue * 0.3 + self.initial_capital * 0.1  # Retained cash
        balance.accounts_receivable = monthly_revenue * 0.1  # Credit sales
        balance.inventory = income.cost_of_goods_sold * (config["inventory_turnover_days"] / 30)
        balance.equipment = self.initial_capital * 0.4  # 40% in equipment
        balance.property_value = self.initial_capital * 0.3 if month > 12 else 0  # After 1 year
        
        balance.accounts_payable = income.cost_of_goods_sold * 0.3
        balance.taxes_payable = income.taxes_expense * 0.5
        
        balance.owner_equity = self.initial_capital
        balance.retained_earnings += income.net_profit()
        
        # Cash Flow
        cash_flow = CashFlow()
        cash_flow.operating_cash_flow = income.net_profit() + income.depreciation_expense
        cash_flow.investing_cash_flow = -self.initial_capital * 0.05  # Ongoing investments
        if month == 1:
            cash_flow.financing_cash_flow = self.initial_capital  # Initial investment
        
        # Financial Ratios
        ratios = FinancialRatios(balance, income)
        
        return {
            "month": month,
            "business_type": self.business_type.value,
            "city_tier": self.city_tier,
            "income_statement": income.to_dict(),
            "balance_sheet": balance.to_dict(),
            "cash_flow": cash_flow.to_dict(),
            "financial_ratios": ratios.to_dict(),
            "summary": {
                "revenue": round(income.total_revenue(), 2),
                "expenses": round(income.total_operating_expenses() + income.cost_of_goods_sold, 2),
                "net_profit": round(income.net_profit(), 2),
                "profit_margin": round(income.profit_margin(), 2),
                "net_worth": round(balance.net_worth(), 2),
                "cash_on_hand": round(balance.cash, 2)
            }
        }
    
    def generate_year_report(self, months: int = 12) -> Dict[str, Any]:
        """Generate full year financial report"""
        
        monthly_reports = []
        cumulative = {
            "total_revenue": 0,
            "total_expenses": 0,
            "total_profit": 0,
            "starting_capital": self.initial_capital,
            "ending_net_worth": self.initial_capital
        }
        
        for month in range(1, months + 1):
            growth = 0.03 if month <= 6 else 0.05  # Ramp up growth
            report = self.calculate_monthly(month, growth_rate=growth)
            monthly_reports.append(report)
            
            cumulative["total_revenue"] += report["summary"]["revenue"]
            cumulative["total_expenses"] += report["summary"]["expenses"]
            cumulative["total_profit"] += report["summary"]["net_profit"]
            cumulative["ending_net_worth"] = report["summary"]["net_worth"]
        
        # Final year balance sheet
        final = self.calculate_monthly(months, growth_rate=0.05)
        
        return {
            "period": f"Year 1 - Month 1 to Month {months}",
            "business_type": self.business_type.value,
            "city_tier": self.city_tier,
            "monthly_breakdown": monthly_reports,
            "annual_summary": {
                **cumulative,
                "roi": round((cumulative["total_profit"] / self.initial_capital) * 100, 2),
                "profit_growth": round(((cumulative["ending_net_worth"] - self.initial_capital) / self.initial_capital) * 100, 2),
                "final_net_worth": round(cumulative["ending_net_worth"], 2),
                "final_cash": round(final["summary"]["cash_on_hand"], 2)
            },
            "final_balance_sheet": final["balance_sheet"],
            "final_ratios": final["financial_ratios"]
        }


def generate_financial_report(
    business_type: str,
    city_tier: int,
    initial_capital: float,
    months: int = 12
) -> Dict[str, Any]:
    """Main function to generate complete financial report"""
    
    financials = BusinessFinancials(business_type, city_tier, initial_capital)
    return financials.generate_year_report(months)
