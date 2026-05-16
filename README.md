# 💊 Pharmaceutical Analytics v2.0 — AI-Driven Pharmaceutical Intelligence Platform

> **Full-Stack System** — Real 200,000-record dataset · ₹5,053Cr revenue · 30 medicines · 49 diseases · 10 Indian cities

---

## 🚀 Live Stats from Real Dataset

| Metric | Value |
|--------|-------|
| 📊 Total Revenue | ₹5,053 Crore |
| 💰 Net Profit | ₹2,009 Crore (39.8% margin) |
| 💊 Units Sold | 5.0 Crore+ |
| 🔬 Medicines | 30 unique |
| 🦠 Diseases | 49 covered |
| 🏙️ Regions | 10 Indian cities |
| 📁 Records | 200,000 rows |

---

## ✨ Feature Highlights

### 🧠 AI / Machine Learning
- **Demand Forecasting** — Gradient Boosting model (R²=0.847, MAE=124.6) predicts 6-month demand
- **Revenue Prediction** — Separate GBM model (R²=0.921) forecasts revenue
- **Anomaly Detection** — Isolation Forest detects demand spikes & outbreak signals
- **What-If Simulator** — Sliders to simulate ±demand/stock changes with live impact
- **Smart Recommendations** — Score-based medicine suggestions per disease + region
- **Stock Risk Assessment** — Depletion predictor with CRITICAL/LOW/MODERATE/ADEQUATE status
- **Prescription Analyzer** — AI suggests medicines from disease + region patterns

### 📊 Analytics Dashboard
- Real KPI cards from 200K records
- Revenue + Profit area trend charts
- Disease × Region interactive heatmap
- Top 10 diseases by case count
- Region performance radar chart
- Category revenue bubble chart
- Disease trend line charts (multi-series)
- Stock status donut chart
- Seasonal demand breakdown

### 🛒 E-Commerce Flow
- Medicine search with live filters
- Add to cart from search or pharmacy
- Full checkout form + simulated payment
- Animated order status timeline (CONFIRMED → PROCESSING → DISPATCHED → DELIVERED)
- Order history

### 📍 Location System
- Simulated nearby pharmacies (Mumbai mock location)
- Distance calculation
- Price comparison across pharmacies
- Emergency pharmacy highlighting

### 🚨 Alert System
- ML-detected anomalies panel
- Disease outbreak alerts
- Stock depletion warnings per medicine+region

### ⚙️ Admin Panel
- System health with live uptime counter
- All 3 ML model metrics displayed
- Hyperparameter tuning UI
- Role-based access control (Admin/Analyst/Pharmacist/Customer)

---

## 🗂️ Project Structure

```
pharma-enhanced/
├── frontend/
│   ├── public/index.html
│   ├── package.json
│   └── src/
│       ├── App.js                  # Router + sidebar + layout
│       ├── index.js / index.css    # Entry + global dark theme
│       ├── context/CartContext.js  # Global cart state
│       ├── utils/api.js            # Axios wrapper + rich mock data
│       ├── components/UI.js        # KPICard, DiseaseHeatmap, Tooltip, etc.
│       └── pages/
│           ├── Dashboard.js        # 10 KPIs + 6 charts from real data
│           ├── Analytics.js        # Heatmap, trends, medicines, regions
│           ├── MLInsights.js       # Forecast, What-if, Risk, Alerts
│           ├── Inventory.js        # CRUD table with risk badges
│           ├── SearchPage.js       # Medicine search + AI recs + prescription
│           ├── Pharmacies.js       # Nearby + price compare
│           ├── CartOrder.js        # Cart + checkout + order timeline
│           └── Admin.js            # Health + ML config + roles
│
├── backend/
│   ├── app.py                      # Flask API — 22 endpoints
│   └── requirements.txt
│
├── ml_model/
│   ├── train.py                    # Full ML training script
│   ├── data/
│   │   ├── pharma_data.csv         # 200K records (from Excel)
│   │   └── analytics.json          # Pre-computed analytics cache
│   └── models/
│       ├── demand_model.pkl        # GBM demand predictor
│       ├── revenue_model.pkl       # GBM revenue predictor
│       ├── anomaly_model.pkl       # Isolation Forest
│       └── encoders.pkl            # Label encoders
│
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- Python 3.9+
- pip

### 1. Clone / Extract

```bash
cd pharma-enhanced
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
pip install flask flask-cors pandas numpy scikit-learn openpyxl

# Run server
python app.py
```
✅ API runs at `http://localhost:5000`

### 3. ML Models (already trained — skip if .pkl files exist)

```bash
cd ml_model

# Only needed if you want to retrain from raw Excel
pip install scikit-learn pandas openpyxl numpy
# Optional: point to raw dataset explicitly
# set PHARMA_DATA_PATH=D:\path\to\pharma_data.xlsx
python train.py
```

### 4. Frontend Setup

```bash
cd frontend

npm install
npm start
```
✅ App runs at `http://localhost:3000`

---

## 🌐 API Endpoints (22 total)

### Analytics
| Route | Description |
|-------|-------------|
| `GET /api/analytics/kpi` | KPI cards (supports `?range=6|12|24`) |
| `GET /api/analytics/monthly-sales` | Revenue/profit/units by month |
| `GET /api/analytics/top-diseases` | Top 10 diseases by cases |
| `GET /api/analytics/region-stats` | Revenue by region |
| `GET /api/analytics/medicine-stats` | Medicine performance |
| `GET /api/analytics/heatmap` | Disease × Region matrix |
| `GET /api/analytics/disease-trend` | Monthly case trends |
| `GET /api/analytics/stock-summary` | Stock status summary |
| `GET /api/analytics/season-stats` | Seasonal demand breakdown |
| `GET /api/analytics/stock-risk` | Risk scores per medicine |
| `GET /api/analytics/anomalies` | ML-detected anomalies |
| `GET /api/analytics/forecasts` | 6-month ML forecasts |

### ML
| Route | Description |
|-------|-------------|
| `POST /api/ml/predict-demand` | GBM demand forecast |
| `POST /api/ml/stock-alert` | Stock depletion prediction |
| `GET  /api/ml/recommend` | Medicine recommendations |
| `POST /api/ml/whatif` | What-if scenario analysis |
| `POST /api/ml/anomaly-detect` | Isolation Forest check |
| `GET  /api/ml/disease-outbreak` | Outbreak alerts |

### Operations
| Route | Description |
|-------|-------------|
| `GET  /api/pharmacies/nearby` | Nearby pharmacies |
| `POST /api/orders` | Place order |
| `GET  /api/orders` | Order history |
| `POST /api/prescription/analyze` | Prescription AI analysis |
| `GET  /api/reference/*` | Medicines/diseases/regions lists |
| `GET  /api/health` | System health check |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router 6, Recharts, Lucide, React Hot Toast |
| **Styling** | Pure CSS — Custom dark theme, glassmorphism, animations |
| **Backend** | Python Flask 3.0, Flask-CORS |
| **ML** | scikit-learn (GBM + Isolation Forest), pandas, numpy |
| **Data** | Real pharmaceutical dataset — 200K records |
| **State** | React Context (Cart) |

---
