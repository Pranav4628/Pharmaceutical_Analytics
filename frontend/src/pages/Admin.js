import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RT,
  ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { Settings, Brain, Database, Activity, Shield, Users, RefreshCw, ChevronRight, CheckCircle, Zap } from 'lucide-react';
import { KPICard, SectionHdr, fmt } from '../components/UI';
import { getKPI, getRegionStats, getMedicineStats, MOCK } from '../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#00f5d4','#7c3aed','#f59e0b','#f43f5e','#3b82f6','#10b981','#ec4899','#8b5cf6'];

function RevTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg-card2)', border:'1px solid var(--border-hi)', borderRadius:10, padding:'10px 14px', fontSize:12 }}>
      <p style={{ color:'var(--text-secondary)', marginBottom:6, fontWeight:600 }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ color:p.color||'var(--cyan)', fontWeight:700, marginBottom:2 }}>
          {p.name}: {(p.name==='Revenue'||p.name==='Profit') ? fmt.cr(p.value) : fmt.k(p.value)}
        </p>
      ))}
    </div>
  );
}

// ── System Health Component ──────────────────────────────────────────────────
function SystemHealth() {
  const [uptime, setUptime] = useState(0);
  useEffect(() => { const t = setInterval(() => setUptime(u => u+1), 1000); return () => clearInterval(t); }, []);

  const services = [
    { name:'Flask API Server',      status:'Online',  latency:'12ms',  color:'#34d399' },
    { name:'MongoDB Database',       status:'Online',  latency:'4ms',   color:'#34d399' },
    { name:'Demand ML Model (GBM)',  status:'Loaded',  latency:'—',     color:'#34d399' },
    { name:'Revenue ML Model (GBM)', status:'Loaded',  latency:'—',     color:'#34d399' },
    { name:'Anomaly Model (IF)',     status:'Loaded',  latency:'—',     color:'#34d399' },
    { name:'Analytics JSON Cache',  status:'200K recs',latency:'—',    color:'var(--cyan)' },
    { name:'Prescription Engine',   status:'Active',  latency:'—',     color:'#34d399' },
    { name:'Price Compare Module',  status:'Active',  latency:'—',     color:'#34d399' },
  ];

  return (
    <div className="card card-p" style={{ marginBottom:18 }}>
      <SectionHdr title="System Health" sub="Real-time service status" icon={Activity} color="var(--cyan)" />
      <div className="grid-2" style={{ gap:10 }}>
        {services.map((s,i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--bg-surface)', borderRadius:9, border:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:s.color, boxShadow:`0 0 8px ${s.color}` }} className="glow-dot"/>
              <span style={{ fontSize:13, fontWeight:500 }}>{s.name}</span>
            </div>
            <div style={{ textAlign:'right' }}>
              <span style={{ fontSize:12, color:s.color, fontWeight:600 }}>{s.status}</span>
              {s.latency !== '—' && <span style={{ fontSize:11, color:'var(--text-muted)', marginLeft:6 }}>{s.latency}</span>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:16, padding:'12px 16px', background:'rgba(0,245,212,0.05)', border:'1px solid rgba(0,245,212,0.15)', borderRadius:9, display:'flex', gap:20, flexWrap:'wrap' }}>
        {[
          { l:'Uptime', v:`${Math.floor(uptime/3600)}h ${Math.floor((uptime%3600)/60)}m ${uptime%60}s` },
          { l:'Dataset', v:'200,000 records' },
          { l:'ML Models', v:'3 trained' },
          { l:'API Endpoints', v:'22 routes' },
          { l:'Version', v:'2.0.0' },
        ].map((s,i) => (
          <div key={i}>
            <p style={{ fontSize:10, color:'var(--text-muted)', marginBottom:2 }}>{s.l}</p>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--cyan)' }}>{s.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ML Configuration Component ───────────────────────────────────────────────
function MLConfig() {
  const [config, setConfig] = useState({
    demand_model:    'Gradient Boosting',
    revenue_model:   'Gradient Boosting',
    anomaly_model:   'Isolation Forest',
    n_estimators:    100,
    max_depth:       5,
    contamination:   0.05,
    retrain_schedule:'Weekly',
    forecast_horizon:6,
    low_stock_threshold: 1500,
    critical_threshold:  500,
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    toast.success('ML configuration saved!');
    setTimeout(() => setSaved(false), 2000);
  };

  const modelMetrics = [
    { model:'Demand Model (GBM)',  r2:'0.847', mae:'124.6', trained:'200K records', color:'#7c3aed' },
    { model:'Revenue Model (GBM)', r2:'0.921', mae:'₹1,240', trained:'200K records', color:'#00f5d4' },
    { model:'Anomaly Model (IF)',  r2:'—', mae:'5% contamination', trained:'30K sample', color:'#f59e0b' },
  ];

  return (
    <div className="card card-p" style={{ marginBottom:18 }}>
      <SectionHdr title="ML Model Configuration" sub="Tune hyperparameters and thresholds" icon={Brain} color="var(--violet-hi)" />

      {/* Model metrics */}
      <div className="grid-3" style={{ marginBottom:20 }}>
        {modelMetrics.map((m,i) => (
          <div key={i} style={{ padding:'14px 16px', background:'var(--bg-surface)', borderRadius:10, border:`1px solid ${m.color}30` }}>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:6 }}>{m.model}</p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              {m.r2!=='—' && <div><p style={{ fontSize:10, color:'var(--text-muted)' }}>R²</p><p style={{ fontWeight:800, fontSize:18, color:m.color, fontFamily:'var(--font-display)' }}>{m.r2}</p></div>}
              <div><p style={{ fontSize:10, color:'var(--text-muted)' }}>MAE</p><p style={{ fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>{m.mae}</p></div>
              <div><p style={{ fontSize:10, color:'var(--text-muted)' }}>Trained on</p><p style={{ fontWeight:600, fontSize:12, color:'var(--text-secondary)' }}>{m.trained}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Config fields */}
      <div className="grid-2" style={{ gap:12, marginBottom:16 }}>
        {[
          { k:'n_estimators',        l:'N Estimators',          t:'number' },
          { k:'max_depth',           l:'Max Tree Depth',         t:'number' },
          { k:'forecast_horizon',    l:'Forecast Horizon (months)', t:'number' },
          { k:'low_stock_threshold', l:'Low Stock Threshold',    t:'number' },
          { k:'critical_threshold',  l:'Critical Stock Threshold',t:'number' },
          { k:'contamination',       l:'Anomaly Contamination %', t:'number' },
        ].map(f => (
          <div key={f.k} className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">{f.l}</label>
            <input className="input" type={f.t} value={config[f.k]} onChange={e => setConfig(p => ({...p,[f.k]:+e.target.value}))} />
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <button className="btn btn-violet" onClick={save}>
          {saved ? <><CheckCircle size={14}/> Saved!</> : <><Brain size={14}/> Save Config</>}
        </button>
        <button className="btn btn-ghost" onClick={() => toast('Model retraining queued (demo mode)', { icon:'🤖' })}>
          <RefreshCw size={14}/> Retrain Models
        </button>
      </div>
    </div>
  );
}

// ── Role-based Access Panel ──────────────────────────────────────────────────
function RolePanel() {
  const [role, setRole] = useState('admin');
  const roles = {
    admin: {
      label: 'Admin',
      color: 'var(--rose)',
      features: ['Full analytics access','ML model management','User management','System configuration','All reports','Inventory CRUD','Order management'],
    },
    analyst: {
      label: 'Analyst',
      color: 'var(--cyan)',
      features: ['Dashboard & Analytics','Disease trend analysis','Heatmap access','Forecast viewing','Report export','Read-only inventory'],
    },
    pharmacist: {
      label: 'Pharmacist',
      color: 'var(--amber-hi)',
      features: ['Medicine search','Inventory view','Order placement','Nearby pharmacies','Stock alerts','Prescription upload'],
    },
    customer: {
      label: 'Customer',
      color: '#34d399',
      features: ['Medicine search','Add to cart','Order placement','Order tracking','Nearby pharmacies'],
    },
  };

  return (
    <div className="card card-p" style={{ marginBottom:18 }}>
      <SectionHdr title="Role-Based Access Control" sub="Manage user permissions by role" icon={Shield} color="var(--cyan)" />
      <div style={{ display:'flex', gap:6, marginBottom:18, flexWrap:'wrap' }}>
        {Object.entries(roles).map(([k,v]) => (
          <button key={k} className={`btn btn-sm ${role===k?'btn-primary':'btn-ghost'}`} onClick={() => setRole(k)}
            style={{ borderColor: role===k ? 'transparent' : 'var(--border)', color: role===k ? '#000' : v.color }}>
            {v.label}
          </button>
        ))}
      </div>
      <div style={{ padding:'16px 20px', background:'var(--bg-surface)', borderRadius:12, border:`1px solid ${roles[role].color}25` }}>
        <p style={{ fontSize:14, fontWeight:700, color:roles[role].color, marginBottom:12 }}>{roles[role].label} Permissions</p>
        <div className="grid-2">
          {roles[role].features.map((f,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0' }}>
              <CheckCircle size={14} color={roles[role].color}/>
              <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── API Explorer ─────────────────────────────────────────────────────────────
function APIExplorer() {
  const [expanded, setExpanded] = useState(null);
  const endpoints = [
    { method:'GET',  path:'/api/analytics/kpi',           desc:'Dashboard KPIs from 200K records' },
    { method:'GET',  path:'/api/analytics/monthly-sales', desc:'Monthly revenue/profit/units' },
    { method:'GET',  path:'/api/analytics/top-diseases',  desc:'Top 10 diseases by case count' },
    { method:'GET',  path:'/api/analytics/region-stats',  desc:'Revenue breakdown by region' },
    { method:'GET',  path:'/api/analytics/heatmap',       desc:'Disease × Region demand matrix' },
    { method:'GET',  path:'/api/analytics/disease-trend', desc:'Monthly disease trend data' },
    { method:'GET',  path:'/api/analytics/stock-risk',    desc:'Medicine-level risk scores' },
    { method:'GET',  path:'/api/analytics/anomalies',     desc:'ML-detected demand anomalies' },
    { method:'GET',  path:'/api/analytics/forecasts',     desc:'6-month ML demand forecasts' },
    { method:'POST', path:'/api/ml/predict-demand',       desc:'GBM 6-month demand prediction' },
    { method:'POST', path:'/api/ml/stock-alert',          desc:'Stock depletion predictor' },
    { method:'GET',  path:'/api/ml/recommend',            desc:'Medicine recommendation engine' },
    { method:'POST', path:'/api/ml/whatif',               desc:'What-if scenario simulator' },
    { method:'POST', path:'/api/ml/anomaly-detect',       desc:'Isolation Forest anomaly check' },
    { method:'GET',  path:'/api/ml/disease-outbreak',     desc:'Outbreak detection alerts' },
    { method:'GET',  path:'/api/pharmacies/nearby',       desc:'Nearby pharmacies by lat/lng' },
    { method:'POST', path:'/api/orders',                  desc:'Place order (simulated payment)' },
    { method:'POST', path:'/api/prescription/analyze',    desc:'AI prescription medicine suggester' },
    { method:'GET',  path:'/api/reference/medicines',     desc:'All 30 medicine names' },
    { method:'GET',  path:'/api/reference/diseases',      desc:'All 49 disease names' },
    { method:'GET',  path:'/api/reference/regions',       desc:'All 10 city/regions' },
    { method:'GET',  path:'/api/health',                  desc:'API health check' },
  ];

  const methodColor = m => m==='GET'?'#34d399':m==='POST'?'#60a5fa':m==='DELETE'?'var(--rose)':'var(--amber-hi)';

  return (
    <div className="card card-p">
      <SectionHdr title="API Explorer" sub="All 22 backend endpoints" icon={Zap} color="var(--amber-hi)" />
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {endpoints.map((ep,i) => (
          <div key={i} style={{ padding:'10px 14px', background:'var(--bg-surface)', borderRadius:9, border:'1px solid var(--border)', cursor:'pointer', transition:'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor='var(--border-md)'}
            onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
            onClick={() => { navigator.clipboard?.writeText(`http://localhost:5000${ep.path}`); toast.success('URL copied!', {duration:1200}); }}
          >
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:11, fontWeight:700, color:methodColor(ep.method), minWidth:40, textAlign:'center', padding:'2px 6px', background:`${methodColor(ep.method)}15`, borderRadius:5 }}>{ep.method}</span>
              <code style={{ fontSize:12, color:'var(--cyan)', fontFamily:'monospace', flex:1 }}>{ep.path}</code>
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>{ep.desc}</span>
              <ChevronRight size={13} color="var(--text-muted)" />
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:10 }}>Click any endpoint to copy URL to clipboard</p>
    </div>
  );
}

// ── Main Admin Page ──────────────────────────────────────────────────────────
export default function Admin() {
  const [kpi, setKpi]         = useState(MOCK.kpi);
  const [regions, setRegions] = useState(MOCK.region_stats);
  const [meds, setMeds]       = useState(MOCK.medicine_stats);
  const [tab, setTab]         = useState('health');

  useEffect(() => {
    getKPI().then(r => setKpi(r.data.data)).catch(() => {});
    getRegionStats().then(r => setRegions(r.data.data)).catch(() => {});
    getMedicineStats().then(r => setMeds(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="anim-fade-up">
      <div className="page-hdr">
        <h1 style={{ background:'linear-gradient(135deg,#f0f6ff 30%,var(--rose-hi))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          Admin Panel
        </h1>
        <p>System health · ML configuration · Role management · API explorer</p>
      </div>

      {/* Top KPIs */}
      <div className="grid-5 stagger" style={{ marginBottom:22 }}>
        <KPICard title="Total Revenue"    value={fmt.cr(kpi?.total_revenue)}   icon={Activity}  color="#00f5d4" sub="All time"/>
        <KPICard title="Net Profit"       value={fmt.cr(kpi?.total_profit)}    icon={Zap}        color="#10b981" sub={`${kpi?.profit_margin}% margin`}/>
        <KPICard title="Medicines"        value={kpi?.unique_medicines}         icon={Database}   color="#7c3aed" sub="In catalog"/>
        <KPICard title="Diseases"         value={kpi?.unique_diseases}          icon={Shield}     color="#f43f5e" sub="Covered"/>
        <KPICard title="Dataset"          value={fmt.k(kpi?.total_records)}    icon={Settings}   color="#f59e0b" sub="Records"/>
      </div>

      {/* Tab Switcher */}
      <div style={{ display:'flex', gap:6, marginBottom:22, background:'var(--bg-surface)', padding:5, borderRadius:12, width:'fit-content', flexWrap:'wrap' }}>
        {[{id:'health',label:'⚡ System Health'},{id:'ml',label:'🤖 ML Config'},{id:'roles',label:'👥 Roles'},{id:'api',label:'🔌 API Explorer'}].map(t => (
          <button key={t.id} className={`btn btn-sm ${tab===t.id?'btn-primary':'btn-ghost'}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab==='health' && (
        <div className="anim-fade-up">
          <SystemHealth />
          {/* Mini charts */}
          <div className="grid-2">
            <div className="chart-card">
              <p className="chart-title">Region Revenue Overview</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={regions.slice(0,6)} barSize={20} margin={{ top:4, right:4, bottom:20, left:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="Region" tick={{ fill:'var(--text-secondary)', fontSize:10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={40} />
                  <YAxis tickFormatter={v => fmt.cr(v)} tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
                  <RT content={<RevTip />} />
                  <Bar dataKey="revenue" name="Revenue" radius={[5,5,0,0]}>
                    {regions.slice(0,6).map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <p className="chart-title">Top 6 Medicines Revenue</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={meds.slice(0,6)} layout="vertical" barSize={14} margin={{ top:0, right:8, bottom:0, left:80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tickFormatter={v => fmt.cr(v)} tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="Medicine_Name" tick={{ fill:'var(--text-secondary)', fontSize:11 }} axisLine={false} tickLine={false} />
                  <RT content={<RevTip />} />
                  <Bar dataKey="revenue" name="Revenue" radius={[0,5,5,0]}>
                    {meds.slice(0,6).map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab==='ml'     && <MLConfig />}
      {tab==='roles'  && <RolePanel />}
      {tab==='api'    && <APIExplorer />}
    </div>
  );
}
