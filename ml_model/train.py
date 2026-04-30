import json
import os
import pickle
import warnings
from pathlib import Path

_IMPORT_ERR = None
try:
    import pandas as pd
    from sklearn.ensemble import GradientBoostingRegressor, IsolationForest
    from sklearn.metrics import mean_absolute_error, r2_score
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import LabelEncoder
    _HAS_ML = True
except Exception as exc:
    pd = None
    _HAS_ML = False
    _IMPORT_ERR = exc

warnings.filterwarnings('ignore')

ROOT = Path(__file__).resolve().parent
MODELS_DIR = ROOT / 'models'
ANALYTICS_FILE = ROOT / 'data' / 'analytics.json'


def resolve_data_path():
    env_path = os.environ.get('PHARMA_DATA_PATH', '').strip()
    candidates = []
    if env_path:
        candidates.append(Path(env_path))
    candidates.extend([
        ROOT / 'data' / 'pharma_data.csv',
        ROOT / 'data' / 'pharma_data.xlsx',
        ROOT / 'data' / 'pharmaceuticals__1_.xlsx',
        Path('/mnt/user-data/uploads/pharmaceuticals__1_.xlsx'),
    ])
    for path in candidates:
        if path.exists():
            return path
    searched = '\n'.join([str(p) for p in candidates])
    raise FileNotFoundError(
        f"No source dataset found. Set PHARMA_DATA_PATH or place data file in one of:\n{searched}"
    )


def load_dataframe(path):
    if pd is None:
        raise RuntimeError("pandas is not available; cannot load dataset")
    if path.suffix.lower() == '.csv':
        return pd.read_csv(path)
    return pd.read_excel(path)


def month_to_season(month):
    month = int(month)
    if month in (12, 1, 2):
        return 'Winter'
    if month in (3, 4):
        return 'Spring'
    if month in (5, 6):
        return 'Summer'
    if month in (7, 8):
        return 'Monsoon'
    return 'Fall'


def prepare_dataframe(df):
    required = ['Date', 'Region', 'Disease_Name', 'Medicine_Name', 'Medicine_Category', 'Quantity_Sold', 'Revenue']
    missing = [col for col in required if col not in df.columns]
    if missing:
        raise ValueError(f"Source data missing required columns: {missing}")

    df = df.copy()
    df['Date'] = pd.to_datetime(df['Date'])
    df['Month'] = df['Date'].dt.month
    df['Year'] = df['Date'].dt.year
    df['Quarter'] = df['Date'].dt.quarter
    df['YearMonth'] = df['Date'].dt.strftime('%Y-%m')

    if 'Season' not in df.columns:
        df['Season'] = df['Month'].map(month_to_season)
    if 'Stock_Level' not in df.columns:
        df['Stock_Level'] = 2500
    if 'Disease_Case_Count' not in df.columns:
        df['Disease_Case_Count'] = df['Quantity_Sold'].clip(lower=1)
    if 'Profit' not in df.columns:
        df['Profit'] = df['Revenue'] * 0.398

    return df


def train_models(df):
    if not _HAS_ML:
        raise RuntimeError("Model training dependencies are missing")
    le_region = LabelEncoder().fit(df['Region'])
    le_disease = LabelEncoder().fit(df['Disease_Name'])
    le_medicine = LabelEncoder().fit(df['Medicine_Name'])
    le_cat = LabelEncoder().fit(df['Medicine_Category'])
    le_season = LabelEncoder().fit(df['Season'])

    df['region_enc'] = le_region.transform(df['Region'])
    df['disease_enc'] = le_disease.transform(df['Disease_Name'])
    df['medicine_enc'] = le_medicine.transform(df['Medicine_Name'])
    df['cat_enc'] = le_cat.transform(df['Medicine_Category'])
    df['season_enc'] = le_season.transform(df['Season'])

    features = [
        'region_enc', 'disease_enc', 'medicine_enc', 'cat_enc', 'season_enc',
        'Month', 'Year', 'Quarter', 'Stock_Level', 'Disease_Case_Count'
    ]
    x = df[features].values

    print('Training demand model...')
    x_tr, x_te, y_tr, y_te = train_test_split(x, df['Quantity_Sold'].values, test_size=0.15, random_state=42)
    demand_model = GradientBoostingRegressor(n_estimators=100, max_depth=5, learning_rate=0.08, random_state=42)
    demand_model.fit(x_tr, y_tr)
    print(f"Demand: MAE={mean_absolute_error(y_te, demand_model.predict(x_te)):.1f}, R2={r2_score(y_te, demand_model.predict(x_te)):.3f}")

    print('Training revenue model...')
    x_tr2, x_te2, y_tr2, y_te2 = train_test_split(x, df['Revenue'].values, test_size=0.15, random_state=42)
    revenue_model = GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=42)
    revenue_model.fit(x_tr2, y_tr2)
    print(f"Revenue R2={r2_score(y_te2, revenue_model.predict(x_te2)):.3f}")

    print('Training anomaly model...')
    anomaly_model = IsolationForest(contamination=0.05, random_state=42)
    anomaly_model.fit(df[['Quantity_Sold', 'Disease_Case_Count', 'Stock_Level', 'Revenue']].values)

    encoders = {
        'region': le_region,
        'disease': le_disease,
        'medicine': le_medicine,
        'cat': le_cat,
        'season': le_season,
        'features': features,
    }
    return demand_model, revenue_model, anomaly_model, encoders


def save_models(demand_model, revenue_model, anomaly_model, encoders):
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    with open(MODELS_DIR / 'demand_model.pkl', 'wb') as f:
        pickle.dump(demand_model, f)
    with open(MODELS_DIR / 'revenue_model.pkl', 'wb') as f:
        pickle.dump(revenue_model, f)
    with open(MODELS_DIR / 'anomaly_model.pkl', 'wb') as f:
        pickle.dump(anomaly_model, f)
    with open(MODELS_DIR / 'encoders.pkl', 'wb') as f:
        pickle.dump(encoders, f)
    print(f'All models saved in {MODELS_DIR}')


def _latest_monthly_rows(rows, months):
    ordered = sorted(rows, key=lambda r: str(r.get('YearMonth', '')))
    return ordered[-months:] if months > 0 else ordered


def _month_to_season(year_month):
    try:
        month = int(str(year_month).split('-')[1])
    except Exception:
        return 'Unknown'
    return month_to_season(month)


def _estimate_range_records(total_qty, base_kpi):
    base_records = int(base_kpi.get('total_records', 0) or 0)
    base_qty = float(base_kpi.get('total_qty_sold', 0) or 0)
    if base_records > 0 and base_qty > 0:
        return max(1, int(round(base_records * (total_qty / base_qty))))
    return 1


def _build_top_diseases_snapshot(analytics, selected_months):
    trend = analytics.get('disease_trend', [])
    if not trend:
        return analytics.get('top_diseases', [])[:10]

    month_set = {r.get('YearMonth') for r in selected_months}
    disease_cases = {}
    for row in trend:
        if row.get('YearMonth') not in month_set:
            continue
        disease = row.get('Disease_Name', 'Unknown')
        disease_cases[disease] = disease_cases.get(disease, 0) + int(row.get('Disease_Case_Count', 0) or 0)

    if not disease_cases:
        return analytics.get('top_diseases', [])[:10]

    all_time = {d.get('Disease_Name'): d for d in analytics.get('top_diseases', [])}
    out = []
    for disease, cases in disease_cases.items():
        base = all_time.get(disease)
        if base and int(base.get('cases', 0) or 0) > 0:
            scale = cases / int(base.get('cases', 1))
            qty = int(round(float(base.get('qty', 0) or 0) * scale))
            revenue = int(round(float(base.get('revenue', 0) or 0) * scale))
        else:
            qty = int(cases // 10)
            revenue = int(cases * 25)
        out.append({'Disease_Name': disease, 'cases': int(cases), 'qty': max(0, qty), 'revenue': max(0, revenue)})

    out.sort(key=lambda x: x['cases'], reverse=True)
    return out[:10]


def _build_region_stats_snapshot(analytics, selected_months):
    legacy = analytics.get('region_stats', [])
    if not legacy:
        return []
    all_monthly = analytics.get('monthly_sales', [])
    range_revenue = sum(float(r.get('revenue', 0) or 0) for r in selected_months)
    all_revenue = sum(float(r.get('revenue', 0) or 0) for r in all_monthly) or 1.0
    scale = range_revenue / all_revenue

    rows = []
    for row in legacy:
        rows.append({
            'Region': row.get('Region', 'Unknown'),
            'revenue': int(round(float(row.get('revenue', 0) or 0) * scale)),
            'qty': int(round(float(row.get('qty', 0) or 0) * scale)),
            'profit': int(round(float(row.get('profit', 0) or 0) * scale)),
        })
    rows.sort(key=lambda x: x['revenue'], reverse=True)
    return rows


def _build_stock_summary_snapshot(analytics, range_records):
    legacy = analytics.get('stock_summary', [])
    if not legacy or range_records <= 0:
        return legacy

    total_legacy = sum(int(row.get('count', 0) or 0) for row in legacy) or 1
    rows, allocated = [], 0
    for row in legacy:
        pct = int(row.get('count', 0) or 0) / total_legacy
        count = int(round(range_records * pct))
        rows.append({'status': row.get('status', 'Unknown'), 'count': count})
        allocated += count
    if rows and allocated != range_records:
        rows[0]['count'] = max(0, rows[0]['count'] + (range_records - allocated))
    return rows


def _build_season_stats_snapshot(selected_months):
    if not selected_months:
        return []
    season_agg = {}
    for row in selected_months:
        season = _month_to_season(row.get('YearMonth', ''))
        bucket = season_agg.setdefault(season, {'Season': season, 'revenue': 0.0, 'qty': 0.0, 'cases': 0.0})
        bucket['revenue'] += float(row.get('revenue', 0) or 0)
        bucket['qty'] += float(row.get('qty', 0) or 0)
        bucket['cases'] += float(row.get('cases', 0) or 0)

    out = [{
        'Season': row['Season'],
        'revenue': int(round(row['revenue'])),
        'qty': int(round(row['qty'])),
        'cases': int(round(row['cases'])),
    } for row in season_agg.values()]
    out.sort(key=lambda x: x['revenue'], reverse=True)
    return out


def _build_kpi_snapshot(analytics, selected_months, range_records, stock_summary):
    base = analytics.get('kpi', {})
    total_revenue = int(round(sum(float(r.get('revenue', 0) or 0) for r in selected_months)))
    total_profit = int(round(sum(float(r.get('profit', 0) or 0) for r in selected_months)))
    total_qty = int(round(sum(float(r.get('qty', 0) or 0) for r in selected_months)))

    low_count = sum(int(s.get('count', 0) or 0) for s in stock_summary if s.get('status') == 'Low Stock')
    out_count = sum(int(s.get('count', 0) or 0) for s in stock_summary if s.get('status') == 'Out of Stock')

    return {
        'total_revenue': total_revenue,
        'total_profit': total_profit,
        'total_qty_sold': total_qty,
        'total_records': range_records,
        'unique_medicines': int(base.get('unique_medicines', 0) or 0),
        'unique_diseases': int(base.get('unique_diseases', 0) or 0),
        'unique_regions': int(base.get('unique_regions', 0) or 0),
        'low_stock_pct': round((low_count / max(1, range_records)) * 100, 1),
        'out_of_stock_pct': round((out_count / max(1, range_records)) * 100, 1),
        'avg_revenue_per_record': int(round(total_revenue / max(1, range_records))),
        'profit_margin': round((total_profit / max(1, total_revenue)) * 100, 1),
    }


def _build_dashboard_range_snapshot(analytics, months):
    selected_months = _latest_monthly_rows(analytics.get('monthly_sales', []), months)
    total_qty = sum(float(r.get('qty', 0) or 0) for r in selected_months)
    range_records = _estimate_range_records(total_qty, analytics.get('kpi', {}))
    stock_summary = _build_stock_summary_snapshot(analytics, range_records)

    return {
        'kpi': _build_kpi_snapshot(analytics, selected_months, range_records, stock_summary),
        'monthly_sales': selected_months,
        'top_diseases': _build_top_diseases_snapshot(analytics, selected_months),
        'region_stats': _build_region_stats_snapshot(analytics, selected_months),
        'stock_summary': stock_summary,
        'season_stats': _build_season_stats_snapshot(selected_months),
    }


def ensure_dashboard_ranges_in_analytics(analytics_path):
    if not analytics_path.exists():
        print(f'Skipping dashboard_ranges generation: {analytics_path} not found')
        return

    with open(analytics_path, 'r', encoding='utf-8') as f:
        analytics = json.load(f)

    existing = analytics.get('dashboard_ranges')
    if isinstance(existing, dict) and all(k in existing for k in ('6', '12', '24')):
        print('dashboard_ranges already present in analytics.json')
        return

    generated = {str(m): _build_dashboard_range_snapshot(analytics, m) for m in (6, 12, 24)}
    if isinstance(existing, dict):
        for key, value in generated.items():
            existing.setdefault(key, value)
    else:
        analytics['dashboard_ranges'] = generated

    with open(analytics_path, 'w', encoding='utf-8') as f:
        json.dump(analytics, f, ensure_ascii=False, indent=2)
    print(f'dashboard_ranges updated in {analytics_path}')


def main():
    print('Loading data...')
    if _HAS_ML:
        data_path = resolve_data_path()
        print(f'Using dataset: {data_path}')
        df = prepare_dataframe(load_dataframe(data_path))

        demand_model, revenue_model, anomaly_model, encoders = train_models(df)
        save_models(demand_model, revenue_model, anomaly_model, encoders)
    else:
        print(f"Skipping model training: {_IMPORT_ERR}")
    ensure_dashboard_ranges_in_analytics(ANALYTICS_FILE)


if __name__ == '__main__':
    main()
