import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RT, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { TrendingUp, Package, Activity, AlertTriangle, Building2, Zap, IndianRupee, Brain, ShieldAlert, Database } from 'lucide-react';
import { KPICard, Tooltip, SkeletonCard, fmt } from '../components/UI';
import { getKPI, getMonthlySales, getTopDiseases, getRegionStats, getStockSummary, getSeasonStats, MOCK } from '../utils/api';

const COLORS = ['#00f5d4', '#7c3aed', '#f59e0b', '#f43f5e', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16'];
const ML = { '2023-01': 'Jan\'23', '2023-02': 'Feb\'23', '2023-03': 'Mar\'23', '2023-04': 'Apr\'23', '2023-05': 'May\'23', '2023-06': 'Jun\'23', '2023-07': 'Jul\'23', '2023-08': 'Aug\'23', '2023-09': 'Sep\'23', '2023-10': 'Oct\'23', '2023-11': 'Nov\'23', '2023-12': 'Dec\'23', '2024-01': 'Jan\'24', '2024-02': 'Feb\'24', '2024-03': 'Mar\'24', '2024-04': 'Apr\'24', '2024-05': 'May\'24', '2024-06': 'Jun\'24', '2024-07': 'Jul\'24', '2024-08': 'Aug\'24', '2024-09': 'Sep\'24', '2024-10': 'Oct\'24', '2024-11': 'Nov\'24', '2024-12': 'Dec\'24' };

function RevTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card2)', border: '1px solid var(--border-hi)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 7, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 700, marginBottom: 3 }}>
          {p.name}: {(p.name === 'Revenue' || p.name === 'Profit') ? fmt.cr(p.value) : fmt.k(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [kpi, setKpi] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [regions, setRegions] = useState([]);
  const [stockSum, setStock] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('12');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const p = { range };

    Promise.all([
      getKPI(p),
      getMonthlySales(p),
      getTopDiseases(p),
      getRegionStats(p),
      getStockSummary(p),
      getSeasonStats(p),
    ])
      .then(([k, m, d, r, s, ss]) => {
        if (cancelled) return;
        setKpi(k.data.data || null);
        setMonthly(m.data.data || []);
        setDiseases(d.data.data || []);
        setRegions(r.data.data || []);
        setStock(s.data.data || []);
        setSeasons(ss.data.data || []);
      })
      .catch(() => {
        if (cancelled) return;
        const snap = MOCK.dashboard_ranges?.[range];
        if (snap) {
          setKpi(snap.kpi);
          setMonthly(snap.monthly_sales || []);
          setDiseases(snap.top_diseases || []);
          setRegions(snap.region_stats || []);
          setStock(snap.stock_summary || []);
          setSeasons(snap.season_stats || []);
          return;
        }
        setKpi(MOCK.kpi);
        setMonthly(MOCK.monthly_sales);
        setDiseases(MOCK.top_diseases);
        setRegions(MOCK.region_stats);
        setStock(MOCK.stock_summary);
        setSeasons(MOCK.season_stats);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range]);

  const monthLimit = Number(range) || 12;
  const visibleMonthly = [...monthly]
    .sort((a, b) => String(a.YearMonth).localeCompare(String(b.YearMonth)))
    .slice(-monthLimit);
  const chartData = visibleMonthly.map(m => ({ label: ML[m.YearMonth] || m.YearMonth, Revenue: m.revenue, Profit: m.profit, Units: m.qty }));
  const peakRow = chartData.reduce((max, row) => (row.Units > (max?.Units || -1) ? row : max), null);

  if (loading) return (
    <div>
      <div style={{ marginBottom: 24 }}><div className="skeleton" style={{ height: 28, width: 260, borderRadius: 6 }} /></div>
      <div className="grid-5 stagger" style={{ marginBottom: 18 }}>{[...Array(5)].map((_, i) => <SkeletonCard key={i} h={108} />)}</div>
      <div className="grid-2 stagger">{[...Array(4)].map((_, i) => <SkeletonCard key={i} h={270} />)}</div>
    </div>
  );

  return (
    <div className="anim-fade-up">
      <div className="page-hdr">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ background: 'linear-gradient(135deg,#f0f6ff 30%,#00f5d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>
              Intelligence Dashboard
            </h1>
            <p>Real-time analytics · 200,000 records · FY 2023–2024 · 10 Indian cities</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Period:</span>
            {['6', '12', '24'].map(r => (
              <button key={r} className={`btn btn-sm ${range === r ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setRange(r)}>{r}M</button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Row 1 */}
      <div className="grid-5 stagger" style={{ marginBottom: 16 }}>
        <KPICard title="Total Revenue" value={fmt.cr(kpi?.total_revenue)} sub={`Last ${range} months`} icon={IndianRupee} color="#00f5d4" trend={8.3} />
        <KPICard title="Net Profit" value={fmt.cr(kpi?.total_profit)} sub={`${kpi?.profit_margin}% margin`} icon={TrendingUp} color="#10b981" trend={5.1} />
        <KPICard title="Units Sold" value={fmt.k(kpi?.total_qty_sold)} sub="Total dispensed" icon={Package} color="#7c3aed" trend={3.7} />
        <KPICard title="Low Stock" value={`${kpi?.low_stock_pct}%`} sub="Needs reorder" icon={AlertTriangle} color="#f59e0b" trend={-2.1} />
        <KPICard title="Out of Stock" value={`${kpi?.out_of_stock_pct}%`} sub="Critical items" icon={ShieldAlert} color="#f43f5e" trend={-0.8} />
      </div>

      {/* KPI Row 2 */}
      <div className="grid-5 stagger" style={{ marginBottom: 24 }}>
        <KPICard title="Medicines" value={kpi?.unique_medicines} sub="In catalog" icon={Brain} color="#3b82f6" />
        <KPICard title="Diseases Covered" value={kpi?.unique_diseases} sub="Conditions" icon={Activity} color="#ec4899" />
        <KPICard title="Regions Active" value={kpi?.unique_regions} sub="Cities" icon={Building2} color="#f59e0b" />
        <KPICard title="Dataset Records" value={fmt.k(kpi?.total_records)} sub="Total analyzed" icon={Database} color="#00f5d4" />
        <KPICard title="Avg Revenue/Rec" value={`₹${fmt.k(kpi?.avg_revenue_per_record)}`} sub="Per record" icon={Zap} color="#7c3aed" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid-2" style={{ marginBottom: 18 }}>
        {/* Revenue + Profit */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <p className="chart-title">Revenue vs Profit Trend</p>
              <p className="chart-sub">Monthly across {range} months</p>
            </div>
            <span className="badge badge-adequate">+8.3% YoY</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f5d4" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#00f5d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} interval={range === '24' ? 3 : range === '12' ? 1 : 0} />
              <YAxis tickFormatter={v => fmt.cr(v)} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <RT content={<RevTip />} />
              <Area type="monotone" dataKey="Revenue" stroke="#00f5d4" strokeWidth={2} fill="url(#gR)" dot={false} />
              <Area type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={2} fill="url(#gP)" dot={false} />
              <Legend formatter={v => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{v}</span>} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Region revenue */}
        <div className="chart-card">
          <p className="chart-title">Revenue by Region</p>
          <p className="chart-sub">All 10 cities ranked</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={regions} layout="vertical" barSize={13} margin={{ top: 0, right: 8, bottom: 0, left: 68 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tickFormatter={v => fmt.cr(v)} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="Region" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <RT content={<RevTip />} />
              <Bar dataKey="revenue" name="Revenue" radius={[0, 5, 5, 0]}>
                {regions.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid-2" style={{ marginBottom: 18 }}>
        {/* Top Diseases */}
        <div className="chart-card">
          <p className="chart-title">Top 10 Diseases by Case Load</p>
          <p className="chart-sub">Total reported cases in selected window</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={diseases} layout="vertical" barSize={13} margin={{ top: 0, right: 8, bottom: 0, left: 110 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tickFormatter={v => fmt.k(v)} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="Disease_Name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <RT content={<Tooltip />} />
              <Bar dataKey="cases" name="Cases" radius={[0, 5, 5, 0]}>
                {diseases.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock + Season */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="chart-card" style={{ flex: 1 }}>
            <p className="chart-title" style={{ marginBottom: 4 }}>Stock Status</p>
            <p className="chart-sub">{fmt.k(kpi?.total_records)} records in selected window</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ResponsiveContainer width="45%" height={130}>
                <PieChart>
                  <Pie data={stockSum} dataKey="count" nameKey="status" innerRadius={32} outerRadius={56} paddingAngle={3}>
                    {stockSum.map((s, i) => (
                      <Cell key={i} fill={s.status === 'In Stock' ? '#10b981' : s.status === 'Low Stock' ? '#f59e0b' : '#f43f5e'} />
                    ))}
                  </Pie>
                  <RT content={<Tooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {stockSum.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.status === 'In Stock' ? '#10b981' : s.status === 'Low Stock' ? '#f59e0b' : '#f43f5e' }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.status}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{fmt.k(s.count)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="chart-card" style={{ flex: 1 }}>
            <p className="chart-title" style={{ marginBottom: 12 }}>Sales by Season</p>
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={seasons} barSize={30} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="Season" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <RT content={<RevTip />} />
                <Bar dataKey="revenue" name="Revenue" radius={[5, 5, 0, 0]}>
                  {seasons.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Units line chart */}
      <div className="chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <p className="chart-title">Monthly Units Dispensed</p>
            <p className="chart-sub">Total volume trend across all medicines and regions</p>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { l: 'Peak', v: peakRow?.label || '-', c: 'var(--cyan)' },
              { l: 'Total', v: fmt.k(kpi?.total_qty_sold), c: 'var(--violet-hi)' }
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.l}</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: s.c }}>{s.v}</p>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={170}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} interval={range === '24' ? 3 : 1} />
            <YAxis tickFormatter={v => fmt.k(v)} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <RT content={<RevTip />} />
            <Line type="monotone" dataKey="Units" stroke="#7c3aed" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#7c3aed' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
