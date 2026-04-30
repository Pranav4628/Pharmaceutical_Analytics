import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: BASE, timeout: 12000 });

// ── Core API calls ──────────────────────────────────────────────────────────
export const getKPI = (p = {}) => api.get('/analytics/kpi', { params: p });
export const getMonthlySales = (p = {}) => api.get('/analytics/monthly-sales', { params: p });
export const getTopDiseases = (p = {}) => api.get('/analytics/top-diseases', { params: p });
export const getRegionStats = (p = {}) => api.get('/analytics/region-stats', { params: p });
export const getMedicineStats = (p = {}) => api.get('/analytics/medicine-stats', { params: p });
export const getCategoryStats = () => api.get('/analytics/category-stats');
export const getStockSummary = (p = {}) => api.get('/analytics/stock-summary', { params: p });
export const getSeasonStats = (p = {}) => api.get('/analytics/season-stats', { params: p });
export const getHeatmap = () => api.get('/analytics/heatmap');
export const getDiseaseTrend = () => api.get('/analytics/disease-trend');
export const getStockRisk = () => api.get('/analytics/stock-risk');
export const getAnomalies = () => api.get('/analytics/anomalies');
export const getForecasts = (p = {}) => api.get('/analytics/forecasts', { params: p });
export const getRegions = () => api.get('/reference/regions');
export const getDiseases = () => api.get('/reference/diseases');
export const getMedicines = () => api.get('/reference/medicines');
export const getCategories = () => api.get('/reference/categories');
export const getPharmacies = (p = {}) => api.get('/pharmacies', { params: p });
export const getNearby = (p = {}) => api.get('/pharmacies/nearby', { params: p });
export const getOrders = () => api.get('/orders');
export const placeOrder = (d) => api.post('/orders', d);
export const updateOrder = (id, d) => api.patch(`/orders/${id}`, d);
export const predictDemand = (d) => api.post('/ml/predict-demand', d);
export const getStockAlert = (d) => api.post('/ml/stock-alert', d);
export const getRecommend = (p = {}) => api.get('/ml/recommend', { params: p });
export const runWhatIf = (d) => api.post('/ml/whatif', d);
export const detectAnomaly = (d) => api.post('/ml/anomaly-detect', d);
export const getOutbreakAlerts = () => api.get('/ml/disease-outbreak');
export const analyzePrescription = (d) => api.post('/prescription/analyze', d);

// ── Rich mock data ──────────────────────────────────────────────────────────
export const MOCK = {
  kpi: {
    total_revenue: 5053604571, total_profit: 2009619542, total_qty_sold: 50072184,
    total_records: 200000, unique_medicines: 30, unique_diseases: 49,
    unique_regions: 10, low_stock_pct: 29.9, out_of_stock_pct: 10.0,
    avg_revenue_per_record: 25268, profit_margin: 39.8
  },
  monthly_sales: [
    { YearMonth: '2023-01', revenue: 209437892, qty: 2082441, profit: 83386122, cases: 7284940 },
    { YearMonth: '2023-02', revenue: 188102288, qty: 1864553, profit: 75009574, cases: 6547380 },
    { YearMonth: '2023-03', revenue: 210456382, qty: 2086431, profit: 83773491, cases: 7315200 },
    { YearMonth: '2023-04', revenue: 203814743, qty: 2022682, profit: 81098472, cases: 7066700 },
    { YearMonth: '2023-05', revenue: 211127244, qty: 2092811, profit: 84056622, cases: 7338560 },
    { YearMonth: '2023-06', revenue: 199532841, qty: 1979314, profit: 79459381, cases: 6938450 },
    { YearMonth: '2023-07', revenue: 217243871, qty: 2154532, profit: 86543291, cases: 7534080 },
    { YearMonth: '2023-08', revenue: 221872503, qty: 2201284, profit: 88310221, cases: 7698450 },
    { YearMonth: '2023-09', revenue: 202913442, qty: 2012573, profit: 80838921, cases: 7030960 },
    { YearMonth: '2023-10', revenue: 214562881, qty: 2129834, profit: 85450312, cases: 7441560 },
    { YearMonth: '2023-11', revenue: 205341293, qty: 2036521, profit: 81795901, cases: 7133520 },
    { YearMonth: '2023-12', revenue: 218472834, qty: 2166913, profit: 87043471, cases: 7581720 },
    { YearMonth: '2024-01', revenue: 207831992, qty: 2061284, profit: 82772431, cases: 7191640 },
    { YearMonth: '2024-02', revenue: 191832744, qty: 1902743, profit: 76399471, cases: 6657660 },
    { YearMonth: '2024-03', revenue: 213452982, qty: 2117341, profit: 84992531, cases: 7406000 },
    { YearMonth: '2024-04', revenue: 205921443, qty: 2041531, profit: 82011242, cases: 7150920 },
    { YearMonth: '2024-05', revenue: 214872031, qty: 2130921, profit: 85530942, cases: 7451640 },
    { YearMonth: '2024-06', revenue: 201342892, qty: 1997384, profit: 80183511, cases: 6992520 },
    { YearMonth: '2024-07', revenue: 219832442, qty: 2180312, profit: 87464491, cases: 7635360 },
    { YearMonth: '2024-08', revenue: 223441832, qty: 2215891, profit: 88892131, cases: 7761360 },
    { YearMonth: '2024-09', revenue: 205342493, qty: 2036843, profit: 81751471, cases: 7133520 },
    { YearMonth: '2024-10', revenue: 218002931, qty: 2162741, profit: 86761941, cases: 7577720 },
    { YearMonth: '2024-11', revenue: 208342982, qty: 2065921, profit: 82958242, cases: 7231400 },
    { YearMonth: '2024-12', revenue: 220573891, qty: 2187421, profit: 87764481, cases: 7659360 },
  ],
  top_diseases: [
    { Disease_Name: 'Influenza', cases: 4327821, qty: 432782, revenue: 109413480 },
    { Disease_Name: 'Diabetes', cases: 4118342, qty: 411834, revenue: 104122150 },
    { Disease_Name: 'Hypertension', cases: 3987231, qty: 398723, revenue: 100827420 },
    { Disease_Name: 'Common Cold', cases: 3871432, qty: 387143, revenue: 97870290 },
    { Disease_Name: 'Asthma', cases: 3754213, qty: 375421, revenue: 94944490 },
    { Disease_Name: 'Malaria', cases: 3641234, qty: 364123, revenue: 92063100 },
    { Disease_Name: 'Dengue', cases: 3524521, qty: 352452, revenue: 89174270 },
    { Disease_Name: 'Typhoid', cases: 3412834, qty: 341283, revenue: 86318500 },
    { Disease_Name: 'Pneumonia', cases: 3298423, qty: 329842, revenue: 83441830 },
    { Disease_Name: 'COVID-19', cases: 3187234, qty: 318723, revenue: 80677810 },
  ],
  region_stats: [
    { Region: 'Mumbai', revenue: 567243221, qty: 5623421, profit: 225823432 },
    { Region: 'Delhi', revenue: 543218732, qty: 5384213, profit: 216213421 },
    { Region: 'Chennai', revenue: 521342891, qty: 5172381, profit: 207432341 },
    { Region: 'Bengaluru', revenue: 498723421, qty: 4943218, profit: 198432121 },
    { Region: 'Hyderabad', revenue: 476342891, qty: 4723421, profit: 189543211 },
    { Region: 'Kolkata', revenue: 453218431, qty: 4492382, profit: 180432321 },
    { Region: 'Pune', revenue: 431342891, qty: 4278421, profit: 171632341 },
    { Region: 'Ahmedabad', revenue: 412342431, qty: 4089232, profit: 164132121 },
    { Region: 'Jaipur', revenue: 387342891, qty: 3839421, profit: 154132341 },
    { Region: 'Nagpur', revenue: 362442832, qty: 3593271, profit: 144232121 },
  ],
  medicine_stats: [
    { Medicine_Name: 'Remdesivir', Medicine_Category: 'Antiviral', qty: 1842321, revenue: 186421231, avg_stock: 2415, profit: 74218432 },
    { Medicine_Name: 'Ranitidine', Medicine_Category: 'Gastrointestinal', qty: 1821432, revenue: 183432211, avg_stock: 2538, profit: 72832321 },
    { Medicine_Name: 'Loratadine', Medicine_Category: 'Antihistamine', qty: 1798231, revenue: 181432291, avg_stock: 2553, profit: 71823421 },
    { Medicine_Name: 'Favipiravir', Medicine_Category: 'Antiviral', qty: 1776543, revenue: 179132431, avg_stock: 2357, profit: 71234321 },
    { Medicine_Name: 'Losartan', Medicine_Category: 'Cardiovascular', qty: 1754321, revenue: 176832391, avg_stock: 2585, profit: 70342321 },
    { Medicine_Name: 'Warfarin', Medicine_Category: 'Cardiovascular', qty: 1731432, revenue: 174532211, avg_stock: 2534, profit: 69432321 },
    { Medicine_Name: 'Prednisolone', Medicine_Category: 'Corticosteroid', qty: 1710234, revenue: 172432191, avg_stock: 2533, profit: 68532321 },
    { Medicine_Name: 'Omeprazole', Medicine_Category: 'Gastrointestinal', qty: 1688321, revenue: 170132431, avg_stock: 2537, profit: 67732321 },
    { Medicine_Name: 'Ciprofloxacin', Medicine_Category: 'Antibiotic', qty: 1665432, revenue: 167832211, avg_stock: 2508, profit: 66832321 },
    { Medicine_Name: 'Atorvastatin', Medicine_Category: 'Cardiovascular', qty: 1642321, revenue: 165432191, avg_stock: 2507, profit: 65832321 },
  ],
  category_stats: [
    { Medicine_Category: 'Cardiovascular', qty: 6843211, revenue: 689342431 },
    { Medicine_Category: 'Antibiotic', qty: 6521432, revenue: 657123211 },
    { Medicine_Category: 'Gastrointestinal', qty: 6234321, revenue: 628432191 },
    { Medicine_Category: 'Antiviral', qty: 5987432, revenue: 603423431 },
    { Medicine_Category: 'Antihistamine', qty: 5743211, revenue: 579123211 },
    { Medicine_Category: 'Corticosteroid', qty: 5498432, revenue: 554832191 },
    { Medicine_Category: 'Analgesic', qty: 5251321, revenue: 529432431 },
    { Medicine_Category: 'Antidiabetic', qty: 4987432, revenue: 503123211 },
  ],
  stock_summary: [
    { status: 'In Stock', count: 120000 },
    { status: 'Low Stock', count: 59800 },
    { status: 'Out of Stock', count: 20200 },
  ],
  season_stats: [
    { Season: 'Summer', revenue: 1398234231, qty: 13873421, cases: 48434320 },
    { Season: 'Monsoon', revenue: 1312432891, qty: 13014381, cases: 45427520 },
    { Season: 'Winter', revenue: 1287432431, qty: 12762841, cases: 44539200 },
    { Season: 'Spring', revenue: 1055432891, qty: 10421541, cases: 36348160 },
  ],
  heatmap_data: [
    { Disease_Name: 'Influenza', Region: 'Mumbai', Quantity_Sold: 48234 }, { Disease_Name: 'Influenza', Region: 'Delhi', Quantity_Sold: 45123 }, { Disease_Name: 'Influenza', Region: 'Chennai', Quantity_Sold: 41234 },
    { Disease_Name: 'Diabetes', Region: 'Mumbai', Quantity_Sold: 44321 }, { Disease_Name: 'Diabetes', Region: 'Delhi', Quantity_Sold: 42123 }, { Disease_Name: 'Diabetes', Region: 'Chennai', Quantity_Sold: 38234 },
    { Disease_Name: 'Hypertension', Region: 'Mumbai', Quantity_Sold: 41234 }, { Disease_Name: 'Hypertension', Region: 'Delhi', Quantity_Sold: 39123 }, { Disease_Name: 'Hypertension', Region: 'Chennai', Quantity_Sold: 35234 },
    { Disease_Name: 'Asthma', Region: 'Mumbai', Quantity_Sold: 38234 }, { Disease_Name: 'Asthma', Region: 'Delhi', Quantity_Sold: 35123 }, { Disease_Name: 'Asthma', Region: 'Chennai', Quantity_Sold: 31234 },
    { Disease_Name: 'Malaria', Region: 'Mumbai', Quantity_Sold: 35234 }, { Disease_Name: 'Malaria', Region: 'Delhi', Quantity_Sold: 28123 }, { Disease_Name: 'Malaria', Region: 'Chennai', Quantity_Sold: 42234 },
    { Disease_Name: 'Dengue', Region: 'Mumbai', Quantity_Sold: 32234 }, { Disease_Name: 'Dengue', Region: 'Delhi', Quantity_Sold: 25123 }, { Disease_Name: 'Dengue', Region: 'Chennai', Quantity_Sold: 39234 },
    { Disease_Name: 'Common Cold', Region: 'Mumbai', Quantity_Sold: 47234 }, { Disease_Name: 'Common Cold', Region: 'Delhi', Quantity_Sold: 44123 }, { Disease_Name: 'Common Cold', Region: 'Chennai', Quantity_Sold: 40234 },
    { Disease_Name: 'COVID-19', Region: 'Mumbai', Quantity_Sold: 29234 }, { Disease_Name: 'COVID-19', Region: 'Delhi', Quantity_Sold: 27123 }, { Disease_Name: 'COVID-19', Region: 'Chennai', Quantity_Sold: 24234 },
  ],
  disease_trend: (() => {
    const diseases = ['Influenza', 'Diabetes', 'Hypertension', 'Common Cold', 'Malaria'];
    const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'];
    const data = [];
    diseases.forEach(d => months.forEach((m, i) => data.push({ YearMonth: m, Disease_Name: d, Disease_Case_Count: Math.floor(80000 + Math.random() * 40000) })));
    return data;
  })(),
  stock_risk: [
    { Medicine_Name: 'Insulin', avg_stock: 2485, avg_qty: 284, out_count: 580, low_count: 1850, total: 5000, risk_score: 60.2 },
    { Medicine_Name: 'Remdesivir', avg_stock: 2415, avg_qty: 261, out_count: 520, low_count: 1690, total: 5000, risk_score: 55.6 },
    { Medicine_Name: 'Favipiravir', avg_stock: 2357, avg_qty: 258, out_count: 490, low_count: 1570, total: 5000, risk_score: 51.4 },
    { Medicine_Name: 'Heparin', avg_stock: 2501, avg_qty: 249, out_count: 470, low_count: 1520, total: 5000, risk_score: 49.8 },
    { Medicine_Name: 'Warfarin', avg_stock: 2534, avg_qty: 241, out_count: 450, low_count: 1490, total: 5000, risk_score: 47.8 },
  ],
  anomalies: [
    { Date: '2024-08-15', Region: 'Mumbai', Disease_Name: 'Influenza', Medicine_Name: 'Paracetamol', Quantity_Sold: 489, Disease_Case_Count: 5234, Revenue: 46832, anomaly_type: 'Outbreak Alert' },
    { Date: '2024-07-22', Region: 'Chennai', Disease_Name: 'Dengue', Medicine_Name: 'Doxycycline', Quantity_Sold: 467, Disease_Case_Count: 5012, Revenue: 44321, anomaly_type: 'Demand Spike' },
    { Date: '2024-06-10', Region: 'Delhi', Disease_Name: 'COVID-19', Medicine_Name: 'Remdesivir', Quantity_Sold: 451, Disease_Case_Count: 4891, Revenue: 48234, anomaly_type: 'Outbreak Alert' },
  ],
  pharmacies: [
    { id: 'p1', name: 'Apollo Pharmacy', region: 'Mumbai', address: 'Bandra West, LJ Road', lat: 19.0596, lng: 72.8295, phone: '+91-9876543211', rating: 4.8, is_open: true, is_emergency: true, medicines: ['Paracetamol', 'Amoxicillin', 'Insulin', 'Remdesivir'], distance_km: 1.2 },
    { id: 'p2', name: 'MedPlus Pharmacy', region: 'Mumbai', address: 'Andheri East, MIDC', lat: 19.1136, lng: 72.8697, phone: '+91-9876543212', rating: 4.3, is_open: true, is_emergency: false, medicines: ['Metformin', 'Losartan', 'Aspirin', 'Ibuprofen'], distance_km: 2.8 },
    { id: 'p3', name: 'Jan Aushadhi', region: 'Delhi', address: 'Connaught Place, Block A', lat: 28.6315, lng: 77.2167, phone: '+91-9876543213', rating: 4.1, is_open: true, is_emergency: false, medicines: ['Paracetamol', 'Vitamin D', 'Zinc Tablet'], distance_km: 3.5 },
    { id: 'p4', name: 'Wellness Forever', region: 'Pune', address: 'Koregaon Park', lat: 18.5362, lng: 73.894, phone: '+91-9876543214', rating: 4.5, is_open: true, is_emergency: false, medicines: ['Cetirizine', 'Salbutamol', 'Montelukast'], distance_km: 2.1 },
    { id: 'p5', name: 'Netmeds Store', region: 'Chennai', address: 'T. Nagar, Pondy Bazaar', lat: 13.0418, lng: 80.2341, phone: '+91-9876543215', rating: 4.6, is_open: true, is_emergency: true, medicines: ['Doxycycline', 'Ciprofloxacin', 'Warfarin'], distance_km: 4.8 },
  ],
  regions: ['Mumbai', 'Delhi', 'Chennai', 'Bengaluru', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Nagpur'],
  diseases: ['AIDS', 'Anemia', 'Arthritis', 'Asthma', 'Bronchitis', 'COVID-19', 'Cancer', 'Chickenpox', 'Cholera', 'Common Cold', 'Dengue', 'Diabetes', 'Diphtheria', 'Ebola', 'Glaucoma', 'HIV', 'Heart Disease', 'Hepatitis', 'Hypertension', 'Influenza', 'Japanese Encephalitis', 'Kidney Disease', 'Leprosy', 'Liver Disease', 'MERS', 'Malaria', 'Measles', 'Migraine', 'Mumps', 'Obesity', 'Osteoporosis', 'Plague', 'Pneumonia', 'Polio', 'Psoriasis', 'Rabies', 'Rubella', 'SARS', 'Sinusitis', 'Stroke', 'Tetanus', 'Thyroid', 'Tuberculosis', 'Typhoid', 'UTI', 'Whooping Cough', 'Zika'],
  medicines: ['Amlodipine', 'Amoxicillin', 'Aspirin', 'Atorvastatin', 'Azithromycin', 'Cetirizine', 'Ciprofloxacin', 'Clopidogrel', 'Doxycycline', 'Favipiravir', 'Heparin', 'Hydroxychloroquine', 'Ibuprofen', 'Insulin', 'Loratadine', 'Losartan', 'Metformin', 'Montelukast', 'ORS Solution', 'Omeprazole', 'Pantoprazole', 'Paracetamol', 'Prednisolone', 'Ranitidine', 'Remdesivir', 'Salbutamol', 'Vitamin C', 'Vitamin D', 'Warfarin', 'Zinc Tablet'],
  categories: ['Analgesic', 'Antibiotic', 'Antidiabetic', 'Antihistamine', 'Antimalarial', 'Antiviral', 'Cardiovascular', 'Corticosteroid', 'Gastrointestinal', 'Supplement', 'Vitamin'],
};

const DASHBOARD_RANGE_MONTHS = { '6': 6, '12': 12, '24': 24 };

const monthToSeason = (yearMonth) => {
  const month = Number(String(yearMonth || '').split('-')[1]);
  if ([12, 1, 2].includes(month)) return 'Winter';
  if ([3, 4].includes(month)) return 'Spring';
  if ([5, 6].includes(month)) return 'Summer';
  if ([7, 8].includes(month)) return 'Monsoon';
  return 'Fall';
};

const latestRows = (rows, months) => [...(rows || [])]
  .sort((a, b) => String(a.YearMonth).localeCompare(String(b.YearMonth)))
  .slice(-months);

const estimateRangeRecords = (mock, totalQty) => {
  const baseRecords = Number(mock?.kpi?.total_records || 0);
  const baseQty = Number(mock?.kpi?.total_qty_sold || 0);
  if (baseRecords > 0 && baseQty > 0) return Math.max(1, Math.round(baseRecords * (totalQty / baseQty)));
  return 1;
};

const buildTopDiseasesRange = (mock, selectedRows) => {
  const monthSet = new Set(selectedRows.map(r => r.YearMonth));
  const trendCases = {};
  (mock.disease_trend || []).forEach((row) => {
    if (!monthSet.has(row.YearMonth)) return;
    const disease = row.Disease_Name || 'Unknown';
    trendCases[disease] = (trendCases[disease] || 0) + Number(row.Disease_Case_Count || 0);
  });

  if (!Object.keys(trendCases).length) {
    const scale = (selectedRows.length || 0) / Math.max(1, (mock.monthly_sales || []).length || 24);
    return [...(mock.top_diseases || [])]
      .map((row) => ({
        ...row,
        cases: Math.max(0, Math.round(Number(row.cases || 0) * scale)),
        qty: Math.max(0, Math.round(Number(row.qty || 0) * scale)),
        revenue: Math.max(0, Math.round(Number(row.revenue || 0) * scale)),
      }))
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 10);
  }

  const allTime = Object.fromEntries((mock.top_diseases || []).map(d => [d.Disease_Name, d]));
  return Object.entries(trendCases)
    .map(([disease, cases]) => {
      const base = allTime[disease];
      if (base && Number(base.cases || 0) > 0) {
        const ratio = Number(cases) / Number(base.cases);
        return {
          Disease_Name: disease,
          cases: Math.round(cases),
          qty: Math.max(0, Math.round(Number(base.qty || 0) * ratio)),
          revenue: Math.max(0, Math.round(Number(base.revenue || 0) * ratio)),
        };
      }
      return {
        Disease_Name: disease,
        cases: Math.round(cases),
        qty: Math.max(0, Math.round(cases / 10)),
        revenue: Math.max(0, Math.round(cases * 25)),
      };
    })
    .sort((a, b) => b.cases - a.cases)
    .slice(0, 10);
};

const buildRegionStatsRange = (mock, selectedRows) => {
  const totalRangeRevenue = selectedRows.reduce((sum, row) => sum + Number(row.revenue || 0), 0);
  const totalRevenue = (mock.monthly_sales || []).reduce((sum, row) => sum + Number(row.revenue || 0), 0) || 1;
  const scale = totalRangeRevenue / totalRevenue;
  return [...(mock.region_stats || [])]
    .map((row) => ({
      Region: row.Region,
      revenue: Math.max(0, Math.round(Number(row.revenue || 0) * scale)),
      qty: Math.max(0, Math.round(Number(row.qty || 0) * scale)),
      profit: Math.max(0, Math.round(Number(row.profit || 0) * scale)),
    }))
    .sort((a, b) => b.revenue - a.revenue);
};

const buildStockSummaryRange = (mock, rangeRecords) => {
  const rows = mock.stock_summary || [];
  const total = rows.reduce((sum, row) => sum + Number(row.count || 0), 0) || 1;
  const scaled = rows.map((row) => ({
    status: row.status,
    count: Math.max(0, Math.round(rangeRecords * (Number(row.count || 0) / total))),
  }));
  const allocated = scaled.reduce((sum, row) => sum + row.count, 0);
  if (scaled.length && allocated !== rangeRecords) scaled[0].count = Math.max(0, scaled[0].count + (rangeRecords - allocated));
  return scaled;
};

const buildSeasonStatsRange = (selectedRows) => {
  const agg = {};
  selectedRows.forEach((row) => {
    const season = monthToSeason(row.YearMonth);
    if (!agg[season]) agg[season] = { Season: season, revenue: 0, qty: 0, cases: 0 };
    agg[season].revenue += Number(row.revenue || 0);
    agg[season].qty += Number(row.qty || 0);
    agg[season].cases += Number(row.cases || 0);
  });
  return Object.values(agg)
    .map((row) => ({
      ...row,
      revenue: Math.round(row.revenue),
      qty: Math.round(row.qty),
      cases: Math.round(row.cases),
    }))
    .sort((a, b) => b.revenue - a.revenue);
};

const buildKpiRange = (mock, selectedRows, rangeRecords, stockSummary) => {
  const totalRevenue = Math.round(selectedRows.reduce((sum, row) => sum + Number(row.revenue || 0), 0));
  const totalProfit = Math.round(selectedRows.reduce((sum, row) => sum + Number(row.profit || 0), 0));
  const totalQty = Math.round(selectedRows.reduce((sum, row) => sum + Number(row.qty || 0), 0));
  const lowCount = stockSummary.filter(r => r.status === 'Low Stock').reduce((sum, row) => sum + Number(row.count || 0), 0);
  const outCount = stockSummary.filter(r => r.status === 'Out of Stock').reduce((sum, row) => sum + Number(row.count || 0), 0);

  return {
    total_revenue: totalRevenue,
    total_profit: totalProfit,
    total_qty_sold: totalQty,
    total_records: rangeRecords,
    unique_medicines: Number(mock?.kpi?.unique_medicines || 0),
    unique_diseases: Number(mock?.kpi?.unique_diseases || 0),
    unique_regions: Number(mock?.kpi?.unique_regions || 0),
    low_stock_pct: Number(((lowCount / Math.max(1, rangeRecords)) * 100).toFixed(1)),
    out_of_stock_pct: Number(((outCount / Math.max(1, rangeRecords)) * 100).toFixed(1)),
    avg_revenue_per_record: Math.round(totalRevenue / Math.max(1, rangeRecords)),
    profit_margin: Number(((totalProfit / Math.max(1, totalRevenue)) * 100).toFixed(1)),
  };
};

const buildMockDashboardSnapshot = (mock, months) => {
  const selectedRows = latestRows(mock.monthly_sales, months);
  const totalQty = selectedRows.reduce((sum, row) => sum + Number(row.qty || 0), 0);
  const rangeRecords = estimateRangeRecords(mock, totalQty);
  const stockSummary = buildStockSummaryRange(mock, rangeRecords);

  return {
    kpi: buildKpiRange(mock, selectedRows, rangeRecords, stockSummary),
    monthly_sales: selectedRows,
    top_diseases: buildTopDiseasesRange(mock, selectedRows),
    region_stats: buildRegionStatsRange(mock, selectedRows),
    stock_summary: stockSummary,
    season_stats: buildSeasonStatsRange(selectedRows),
  };
};

const buildMockDashboardRanges = (mock) => Object.fromEntries(
  Object.entries(DASHBOARD_RANGE_MONTHS).map(([range, months]) => [range, buildMockDashboardSnapshot(mock, months)])
);

MOCK.dashboard_ranges = buildMockDashboardRanges(MOCK);

export default api;
