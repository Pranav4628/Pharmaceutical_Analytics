import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RT, ResponsiveContainer, Cell, LineChart, Line
} from 'recharts';
import { Brain, Zap, AlertTriangle, TrendingUp, Activity, ShieldAlert, Sliders, Search } from 'lucide-react';
import { SectionHdr, SkeletonCard, RiskBadge, fmt } from '../components/UI';
import { predictDemand, getStockAlert, getStockRisk, getAnomalies, runWhatIf, getOutbreakAlerts, MOCK } from '../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#00f5d4', '#7c3aed', '#f59e0b', '#f43f5e', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'];
const MEDICINES = ['Paracetamol', 'Amoxicillin', 'Metformin', 'Remdesivir', 'Insulin', 'Losartan', 'Atorvastatin', 'Favipiravir', 'Warfarin', 'Cetirizine', 'Ciprofloxacin', 'Omeprazole'];
const DISEASES = ['Influenza', 'Diabetes', 'Hypertension', 'COVID-19', 'Malaria', 'Dengue', 'Asthma', 'Common Cold'];
const REGIONS = ['Mumbai', 'Delhi', 'Chennai', 'Bengaluru', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];

function RevTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card2)', border: '1px solid var(--border-hi)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color || 'var(--cyan)', fontWeight: 700, marginBottom: 2 }}>{p.name}: {fmt.k(Math.round(p.value))}</p>)}
    </div>
  );
}

// ── Demand Forecast Panel ────────────────────────────────────────────────────
function DemandForecast() {
  const [form, setForm] = useState({ medicine: 'Paracetamol', disease: 'Influenza', region: 'Mumbai' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await predictDemand(form);
      setResult(r.data.data);
    } catch {
      // mock fallback
      const now = new Date();
      const sm = ['Winter', 'Winter', 'Spring', 'Spring', 'Summer', 'Summer'];
      setResult({
        medicine: form.medicine, disease: form.disease, region: form.region,
        model_r2: 0.847, mae: 124.6,
        predictions: Array.from({ length: 6 }, (_, i) => {
          const m = ((now.getMonth() + i) % 12) + 1;
          const y = now.getFullYear() + Math.floor((now.getMonth() + i) / 12);
          return { month_label: `${y}-${String(m).padStart(2, '0')}`, month: m, year: y, season: sm[i], pred_qty: 280 + Math.floor(Math.random() * 180), pred_rev: 22000 + Math.floor(Math.random() * 18000) };
        })
      });
    }
    setLoading(false);
  };

  return (
    <div className="card card-p anim-fade-up" style={{ marginBottom: 18 }}>
      <SectionHdr title="AI Demand Forecasting" sub="6-month AI demand prediction" icon={Brain} color="var(--violet-hi)" />
      <div className="grid-3" style={{ marginBottom: 16 }}>
        {[
          { key: 'medicine', label: 'Medicine', opts: MEDICINES },
          { key: 'disease', label: 'Disease', opts: DISEASES },
          { key: 'region', label: 'Region', opts: REGIONS },
        ].map(f => (
          <div key={f.key} className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{f.label}</label>
            <select className="input" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>
      <button className="btn btn-violet" onClick={run} disabled={loading}>
        <Brain size={15} /> {loading ? 'Predicting…' : 'Run 6-Month Forecast'}
      </button>

      {result && (
        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16, padding: '12px 16px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10 }}>
            {[
              { l: 'Medicine', v: result.medicine, c: 'var(--text-primary)' },
              { l: 'Region', v: result.region, c: 'var(--cyan)' },
              { l: '6M Total Demand', v: `${fmt.k(result.predictions?.reduce((s, p) => s + p.pred_qty, 0))} units`, c: 'var(--violet-hi)' },
              { l: '6M Est. Revenue', v: fmt.cr(result.predictions?.reduce((s, p) => s + p.pred_rev, 0)), c: 'var(--amber-hi)' },
            ].map((s, i) => (
              <div key={i}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{s.l}</p>
                <p style={{ fontWeight: 700, color: s.c, fontSize: s.l === '6M Total Demand' || s.l === '6M Est. Revenue' ? 17 : 14 }}>{s.v}</p>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={result.predictions} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month_label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt.k(v)} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <RT content={<RevTip />} />
              <Area type="monotone" dataKey="pred_qty" name="Predicted Units" stroke="#7c3aed" strokeWidth={2.5} fill="url(#gV)" dot={{ r: 4, fill: '#7c3aed' }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            {result.predictions?.map((p, i) => (
              <div key={i} style={{ flex: 1, minWidth: 90, padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 9, border: '1px solid var(--border)', textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{p.month_label}</p>
                <p style={{ fontWeight: 700, color: 'var(--violet-hi)', fontSize: 15 }}>{fmt.k(p.pred_qty)}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{p.season}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── What-If Analysis Panel ───────────────────────────────────────────────────
function WhatIfPanel() {
  const [medicine, setMedicine] = useState('Paracetamol');
  const [demandChg, setDemandChg] = useState(0);
  const [stockChg, setStockChg] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await runWhatIf({ medicine, demand_change: demandChg, stock_change: stockChg });
      setResult(r.data.data);
    } catch {
      const baseQty = 320; const baseRev = 28000; const baseProfit = 11200;
      const newQty = Math.round(baseQty * (1 + demandChg / 100));
      const newRev = Math.round(baseRev * (1 + demandChg / 100));
      const newProfit = Math.round(baseProfit * (1 + demandChg / 100));
      const newStock = Math.round(2500 * (1 + stockChg / 100));
      const daysLeft = Math.round(newStock / (newQty / 30));
      setResult({
        medicine, demand_change: demandChg, stock_change: stockChg,
        base: { qty: baseQty, revenue: baseRev, stock: 2500, profit: baseProfit },
        simulated: { qty: newQty, revenue: newRev, stock: newStock, profit: newProfit },
        days_until_depletion: daysLeft,
        stock_status: daysLeft <= 7 ? 'CRITICAL' : daysLeft <= 30 ? 'LOW' : 'ADEQUATE',
        revenue_impact: newRev - baseRev,
        profit_impact: newProfit - baseProfit,
      });
    }
    setLoading(false);
  };

  const statusColor = result?.stock_status === 'CRITICAL' ? 'var(--rose)' : result?.stock_status === 'LOW' ? 'var(--amber-hi)' : '#34d399';

  return (
    <div className="card card-p anim-fade-up" style={{ marginBottom: 18 }}>
      <SectionHdr title="What-If Simulator" sub="Simulate demand & stock changes to see impact on revenue and depletion" icon={Sliders} color="var(--amber-hi)" />
      <div className="grid-2" style={{ marginBottom: 16, gap: 24 }}>
        <div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Medicine</label>
            <select className="input" value={medicine} onChange={e => setMedicine(e.target.value)}>
              {MEDICINES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Demand Change: <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{demandChg > 0 ? '+' : ''}{demandChg}%</span></label>
            <input type="range" min="-50" max="100" step="5" value={demandChg} onChange={e => setDemandChg(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--cyan)', height: 6, cursor: 'pointer' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
              <span>-50%</span><span>0</span><span>+100%</span>
            </div>
          </div>
        </div>
        <div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Stock Change: <span style={{ color: 'var(--amber-hi)', fontWeight: 700 }}>{stockChg > 0 ? '+' : ''}{stockChg}%</span></label>
            <input type="range" min="-60" max="100" step="5" value={stockChg} onChange={e => setStockChg(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--amber)', height: 6, cursor: 'pointer' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
              <span>-60%</span><span>0</span><span>+100%</span>
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={run} disabled={loading}>
            <Zap size={15} /> {loading ? 'Simulating…' : 'Run Simulation'}
          </button>
        </div>
      </div>

      {result && (
        <div style={{ marginTop: 8 }}>
          <div className="grid-2" style={{ gap: 14, marginBottom: 14 }}>
            {/* Base vs Simulated */}
            {[
              { label: 'Baseline', data: result.base, color: 'var(--text-secondary)' },
              { label: 'Simulated', data: result.simulated, color: 'var(--cyan)' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '14px 16px', background: 'var(--bg-surface)', borderRadius: 10, border: `1px solid ${i === 1 ? 'rgba(0,245,212,0.25)' : 'var(--border)'}` }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: s.color, marginBottom: 10 }}>{s.label}</p>
                <div className="grid-2" style={{ gap: 10 }}>
                  {[{ l: 'Daily Qty', v: fmt.k(Math.round(s.data.qty)) }, { l: 'Revenue', v: `₹${fmt.k(Math.round(s.data.revenue))}` }, { l: 'Stock', v: fmt.k(Math.round(s.data.stock)) }, { l: 'Profit', v: `₹${fmt.k(Math.round(s.data.profit))}` }].map((item, j) => (
                    <div key={j}>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.l}</p>
                      <p style={{ fontWeight: 700, fontSize: 15, color: s.color }}>{item.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Impact row */}
          <div className="grid-3" style={{ gap: 12 }}>
            {[
              { label: 'Days Until Depletion', value: result.days_until_depletion, color: statusColor, suffix: ' days' },
              { label: 'Revenue Impact', value: (result.revenue_impact > 0 ? '+' : '') + `₹${fmt.k(Math.abs(Math.round(result.revenue_impact)))}`, color: result.revenue_impact >= 0 ? '#34d399' : 'var(--rose)' },
              { label: 'Profit Impact', value: (result.profit_impact > 0 ? '+' : '') + `₹${fmt.k(Math.abs(Math.round(result.profit_impact)))}`, color: result.profit_impact >= 0 ? '#34d399' : 'var(--rose)' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '14px 16px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{item.label}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: item.color, fontFamily: 'var(--font-display)' }}>{item.value}{item.suffix || ''}</p>
                {item.label === 'Days Until Depletion' && (
                  <span className={`badge badge-${result.stock_status?.toLowerCase()}`} style={{ marginTop: 6, fontSize: 11 }}>{result.stock_status}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stock Risk Panel ─────────────────────────────────────────────────────────
function StockRiskPanel() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ medicine: 'Insulin', region: 'Mumbai', current_stock: 1200 });
  const [alert, setAlert] = useState(null);
  const [alertLoading, setAL] = useState(false);

  useEffect(() => {
    getStockRisk().then(r => setRisks(r.data.data)).catch(() => setRisks(MOCK.stock_risk)).finally(() => setLoading(false));
  }, []);

  const checkAlert = async () => {
    setAL(true);
    try {
      const r = await getStockAlert(form);
      setAlert(r.data.data);
    } catch {
      const days = Math.max(5, Math.round(form.current_stock / 12));
      const status = days <= 7 ? 'CRITICAL' : days <= 30 ? 'LOW' : days <= 60 ? 'MODERATE' : 'ADEQUATE';
      setAlert({ medicine: form.medicine, region: form.region, current_stock: form.current_stock, monthly_demand: 360, daily_demand: 12, days_until_depletion: days, status, alert: status !== 'ADEQUATE', recommended_reorder: 720 });
    }
    setAL(false);
  };

  const statusColor = s => s === 'CRITICAL' ? 'var(--rose)' : s === 'LOW' ? 'var(--amber-hi)' : s === 'MODERATE' ? '#60a5fa' : '#34d399';

  return (
    <div className="card card-p anim-fade-up" style={{ marginBottom: 18 }}>
      <SectionHdr title="Stock Risk Assessment" sub="Real-time depletion predictor per medicine + region" icon={ShieldAlert} color="var(--rose-hi)" />
      <div className="grid-2" style={{ gap: 20 }}>
        {/* Left: checker */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Check Specific Medicine</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Medicine</label>
              <select className="input" value={form.medicine} onChange={e => setForm(p => ({ ...p, medicine: e.target.value }))}>
                {MEDICINES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Region</label>
              <select className="input" value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))}>
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Current Stock (units)</label>
              <input className="input" type="number" value={form.current_stock} onChange={e => setForm(p => ({ ...p, current_stock: +e.target.value }))} />
            </div>
          </div>
          <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={checkAlert} disabled={alertLoading}>
            <ShieldAlert size={15} /> {alertLoading ? 'Checking…' : 'Predict Depletion'}
          </button>
          {alert && (
            <div style={{ marginTop: 14, padding: '16px', background: `${alert.status === 'CRITICAL' ? 'rgba(244,63,94,0.08)' : alert.status === 'LOW' ? 'rgba(245,158,11,0.08)' : 'rgba(0,245,212,0.06)'}`, border: `1px solid ${alert.status === 'CRITICAL' ? 'rgba(244,63,94,0.3)' : alert.status === 'LOW' ? 'rgba(245,158,11,0.3)' : 'rgba(0,245,212,0.2)'}`, borderRadius: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { l: 'Days Left', v: alert.days_until_depletion, large: true, c: statusColor(alert.status) },
                  { l: 'Status', v: alert.status, badge: true },
                  { l: 'Daily Demand', v: `${alert.daily_demand} units/day`, c: 'var(--text-primary)' },
                  { l: 'Reorder Qty', v: `${fmt.k(alert.recommended_reorder)} units`, c: 'var(--cyan)' },
                ].map((item, i) => (
                  <div key={i}>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{item.l}</p>
                    {item.badge ? <span className={`badge badge-${alert.status?.toLowerCase()}`}>{item.v}</span>
                      : <p style={{ fontWeight: 700, fontSize: item.large ? 24 : 14, color: item.c || 'var(--text-primary)', fontFamily: item.large ? 'var(--font-display)' : undefined }}>{item.v}</p>}
                  </div>
                ))}
              </div>
              {alert.alert && <p style={{ fontSize: 12, color: statusColor(alert.status), marginTop: 12, fontWeight: 600 }}>⚠ Reorder {alert.medicine} immediately — {alert.days_until_depletion} days remaining</p>}
            </div>
          )}
        </div>
        {/* Right: risk table */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Top Risk Medicines</p>
          {loading ? [...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 44, marginBottom: 6, borderRadius: 8 }} />) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {risks.slice(0, 8).map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 9, border: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13 }}>{r.Medicine_Name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Avg stock: {fmt.k(Math.round(r.avg_stock))}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <RiskBadge score={r.risk_score} />
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{r.risk_score?.toFixed(1)}% risk</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Anomaly / Outbreak Alerts Panel ──────────────────────────────────────────
function AlertsPanel() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnomalies(), getOutbreakAlerts()])
      .then(([a, o]) => {
        const anom = a.data.data || [];
        const out = o.data.data || [];
        setAnomalies([...anom.slice(0, 8), ...out.slice(0, 6)]);
      })
      .catch(() => setAnomalies(MOCK.anomalies))
      .finally(() => setLoading(false));
  }, []);

  const typeColor = t => t === 'Outbreak Alert' ? 'var(--rose)' : t === 'Demand Spike' ? 'var(--amber-hi)' : 'var(--blue)';
  const typeBg = t => t === 'Outbreak Alert' ? 'rgba(244,63,94,0.08)' : t === 'Demand Spike' ? 'rgba(245,158,11,0.08)' : 'rgba(59,130,246,0.08)';
  const typeBorder = t => t === 'Outbreak Alert' ? 'rgba(244,63,94,0.25)' : t === 'Demand Spike' ? 'rgba(245,158,11,0.25)' : 'rgba(59,130,246,0.25)';

  return (
    <div className="card card-p anim-fade-up">
      <SectionHdr title="Anomaly & Outbreak Alerts" sub="ML-detected demand spikes and disease outbreak signals" icon={AlertTriangle} color="var(--rose-hi)" />
      {loading ? [...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 72, marginBottom: 8, borderRadius: 10 }} />) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {anomalies.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 30 }}>No anomalies detected.</p>}
          {anomalies.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', background: typeBg(a.anomaly_type || a.type), border: `1px solid ${typeBorder(a.anomaly_type || a.type)}`, borderRadius: 10 }}>
              <div style={{ width: 8, height: 8, minWidth: 8, borderRadius: '50%', background: typeColor(a.anomaly_type || a.type) }} className="glow-dot" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{a.Disease_Name || a.disease}</span>
                  <span className="tag" style={{ fontSize: 11 }}>{a.Region || a.region}</span>
                  <span className="tag" style={{ fontSize: 11 }}>{a.Medicine_Name || a.medicine || ''}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Cases: {fmt.k(a.Disease_Case_Count || a.cases || 0)} · Qty sold: {fmt.k(a.Quantity_Sold || 0)} · Rev: {a.Revenue ? `₹${fmt.k(a.Revenue)}` : '—'} · {String(a.Date || a.date || '').slice(0, 10)}
                </p>
              </div>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: typeColor(a.anomaly_type || a.type), padding: '3px 10px', background: typeBg(a.anomaly_type || a.type), border: `1px solid ${typeBorder(a.anomaly_type || a.type)}`, borderRadius: 20, whiteSpace: 'nowrap' }}>
                  {a.anomaly_type || a.type || 'Alert'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main MLInsights Page ─────────────────────────────────────────────────────
export default function MLInsights({ defaultTab = 'forecast' }) {
  const [tab, setTab] = useState(defaultTab);

  return (
    <div className="anim-fade-up">
      <div className="page-hdr">
        <h1 style={{ background: 'linear-gradient(135deg,#f0f6ff 30%,var(--violet-hi))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          AI / ML Insights
        </h1>
        <p>Demand forecasting · Stock prediction · What-if analysis · Anomaly detection</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'var(--bg-surface)', padding: 5, borderRadius: 12, width: 'fit-content', flexWrap: 'wrap' }}>
        {[
          { id: 'forecast', label: '🤖 Demand Forecast' },
          { id: 'whatif', label: '🎛️ What-If Simulator' },
          { id: 'risk', label: '🛡️ Stock Risk' },
          { id: 'alerts', label: '🚨 Alerts' },
        ].map(t => (
          <button key={t.id} className={`btn btn-sm ${tab === t.id ? 'btn-violet' : 'btn-ghost'}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === 'forecast' && <DemandForecast />}
      {tab === 'whatif' && <WhatIfPanel />}
      {tab === 'risk' && <StockRiskPanel />}
      {tab === 'alerts' && <AlertsPanel />}
    </div>
  );
}
