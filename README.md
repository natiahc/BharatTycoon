# BharatTycoon 🇮🇳

An AI-powered Indian business simulation game where you build a company across India's major cities over 18 months.

## Features

- **AI-Powered Onboarding**: Get personalized business recommendations based on your capital, city, and market trends
- **6 Indian Cities**: Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Kolkata - each with unique market dynamics
- **14 Business Types**: From kirana stores to tech services, each with different capital requirements and risk profiles
- **Real-time Market Analysis**: AI analyzes city demand, competition, and trends to suggest the best opportunities
- **18-Month Journey**: Progress through Founder → Seed → Growth → Scale phases

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI (Python)
- **AI Engine**: Multi-factor recommendation system

## Getting Started

### Frontend
```bash
cd BharatTycoon
npm install
npm run dev
```
Runs on http://localhost:8081

### Backend
```bash
cd BharatTycoon-backend
pip install -r requirements.txt
python main.py
```
Runs on http://localhost:8000

## Game Flow

1. **Select Capital** - Choose your starting capital (₹30K - ₹5L)
2. **Choose City** - Pick a city with demand data
3. **AI Recommendations** - Get smart business suggestions based on your profile
4. **Play** - Make decisions monthly to grow your business

## API Endpoints

- `POST /unified/recommendations` - AI business recommendations
- `POST /unified/simulate` - Run business simulation
- `POST /unified/risk` - Risk analysis
- `POST /unified/advisor` - Get contextual advice

## Screens

- **Onboarding**: Capital → City → AI Recommendations → Play Style
- **Gameplay**: Monthly decisions with financial tracking
- **Dashboard**: Business intelligence and metrics

## License

MIT
