import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RT, ResponsiveContainer, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Filter } from 'lucide-react';
import { SectionHdr, DiseaseHeatmap, Tooltip, SkeletonCard, fmt } from '../components/UI';
import { getHeatmap, getDiseaseTrend, getMedicineStats, getCategoryStats, getRegionStats, MOCK } from '../utils/api';

const COLORS = ['#00f5d4','#7c3aed','#f59e0b','#f43f5e','#3b82f6','#10b981','#ec4899','#8b5cf6','#06b6d4','#84cc16'];
const DISEASES_LIST = ['Influenza','Diabetes','Hypertension','Common Cold','Asthma','Malaria','Dengue','COVID-19'];
const REGIONS_LIST  = ['Mumbai','Delhi','Chennai','Bengaluru','Hyderabad','Kolkata','Pune','Ahmedabad','Jaipur','Nagpur'];
const MLABELS = {'2024-01':'Jan','2024-02':'Feb','2024-03':'Mar','2024-04':'Apr','2024-05':'May','2024-06':'Jun'};

function RevTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg-card2)', border:'1px solid var(--border-hi)', borderRadius:10, padding:'10px 14px', fontSize:12 }}>
      <p style={{ color:'var(--text-secondary)', marginBottom:7, fontWeight:600 }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ color:p.color||'var(--cyan)', fontWeight:700, marginBottom:2 }}>
          {p.name}: {(p.name==='Revenue'||p.name==='Profit') ? fmt.cr(p.value) : fmt.k(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [heatmap,    setHeatmap]    = useState([]);
  const [trend,      setTrend]      = useState([]);
  const [medicines,  setMedicines]  = useState([]);
  const [categories, setCats]       = useState([]);
  const [regions,    setRegions]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [catFilter,  setCatFilter]  = useState('All');
  const [tab,        setTab]        = useState('heatmap');

  useEffect(() => {
    Promise.all([getHeatmap(), getDiseaseTrend(), getMedicineStats(), getCategoryStats(), getRegionStats()])
      .then(([h,t,m,c,r]) => {
        setHeatmap(h.data.data); setTrend(t.data.data);
        setMedicines(m.data.data); setCats(c.data.data); setRegions(r.data.data);
      })
      .catch(() => {
        setHeatmap(MOCK.heatmap_data); setTrend(MOCK.disease_trend);
        setMedicines(MOCK.medicine_stats); setCats(MOCK.category_stats); setRegions(MOCK.region_stats);
      })
      .finally(() => setLoading(false));
  }, []);

  const topDiseases = [...new Set(trend.map(t => t.Disease_Name))].slice(0,5);
  const trendMonths = [...new Set(trend.map(t => t.YearMonth))].sort().slice(-6);
  const trendData   = trendMonths.map(m => {
    const row = { month: MLABELS[m] || m };
    topDiseases.forEach(d => {
      const pt = trend.find(t => t.YearMonth===m && t.Disease_Name===d);
      row[d] = pt?.Disease_Case_Count || 0;
    });
    return row;
  });

  const allCats      = ['All', ...[...new Set(medicines.map(m => m.Medicine_Category))]];
  const filteredMeds = catFilter==='All' ? medicines : medicines.filter(m => m.Medicine_Category===catFilter);
  const radarData    = regions.slice(0,6).map(r => ({ region:r.Region.slice(0,3), revenue:Math.round(r.revenue/1e8), qty:Math.round(r.qty/1e5), profit:Math.round(r.profit/1e8) }));
  const scatterData  = categories.map((c,i) => ({ name:c.Medicine_Category, x:Math.round(c.qty/1e4), y:Math.round(c.revenue/1e8), z:Math.round(c.revenue/1e8)*3 }));

  if (loading) return <div className="grid-2 stagger">{[...Array(4)].map((_,i) => <SkeletonCard key={i} h={280}/>)}</div>;

  return (
    <div className="anim-fade-up">
      <div className="page-hdr">
        <h1 style={{ background:'linear-gradient(135deg,#f0f6ff 30%,#7c3aed)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Advanced Analytics</h1>
        <p>Disease heatmaps · Trend analysis · Medicine performance · Category insights</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:24, background:'var(--bg-surface)', padding:5, borderRadius:12, width:'fit-content', flexWrap:'wrap' }}>
        {[{id:'heatmap',label:'🌡️ Heatmap'},{id:'trend',label:'📈 Disease Trends'},{id:'medicines',label:'💊 Medicines'},{id:'region',label:'🗺️ Region Deep-Dive'}].map(t => (
          <button key={t.id} className={`btn btn-sm ${tab===t.id?'btn-primary':'btn-ghost'}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* HEATMAP */}
      {tab==='heatmap' && (
        <div className="anim-fade-up">
          <div className="chart-card" style={{ marginBottom:18 }}>
            <p className="chart-title" style={{ marginBottom:4 }}>Disease × Region Demand Heatmap</p>
            <p className="chart-sub">Units sold per disease-region pair · Darker = higher demand</p>
            <DiseaseHeatmap data={heatmap} diseases={DISEASES_LIST} regions={REGIONS_LIST.slice(0,7)} />
          </div>
          <div className="chart-card">
            <p className="chart-title">Revenue by Medicine Category</p>
            <p className="chart-sub">Total revenue contribution per category</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categories} barSize={32} margin={{ top:4, right:4, bottom:0, left:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="Medicine_Category" tick={{ fill:'var(--text-secondary)', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => fmt.cr(v)} tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
                <RT content={<RevTip />} />
                <Bar dataKey="revenue" name="Revenue" radius={[6,6,0,0]}>
                  {categories.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TREND */}
      {tab==='trend' && (
        <div className="anim-fade-up">
          <div className="chart-card" style={{ marginBottom:18 }}>
            <p className="chart-title">Top 5 Disease Case Trends — Monthly</p>
            <p className="chart-sub">Month-over-month reported cases (2024)</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData} margin={{ top:8, right:12, bottom:0, left:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => fmt.k(v)} tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
                <RT content={<RevTip />} />
                {topDiseases.map((d,i) => (
                  <Line key={d} type="monotone" dataKey={d} stroke={COLORS[i%COLORS.length]} strokeWidth={2.5} dot={{ r:3, fill:COLORS[i%COLORS.length] }} activeDot={{ r:5 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginTop:12 }}>
              {topDiseases.map((d,i) => (
                <div key={d} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:14, height:3, borderRadius:2, background:COLORS[i%COLORS.length] }}/>
                  <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid-2">
            <div className="chart-card">
              <p className="chart-title">Units Sold by Category</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categories} layout="vertical" barSize={14} margin={{ top:0, right:8, bottom:0, left:90 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tickFormatter={v => fmt.k(v)} tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="Medicine_Category" tick={{ fill:'var(--text-secondary)', fontSize:11 }} axisLine={false} tickLine={false} />
                  <RT content={<RevTip />} />
                  <Bar dataKey="qty" name="Units" radius={[0,5,5,0]}>{categories.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <p className="chart-title">Region Radar — Revenue / Qty / Profit</p>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis dataKey="region" tick={{ fill:'var(--text-secondary)', fontSize:11 }} />
                  <Radar name="Revenue" dataKey="revenue" stroke="#00f5d4" fill="#00f5d4" fillOpacity={0.14} strokeWidth={2} />
                  <Radar name="Qty"     dataKey="qty"     stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.12} strokeWidth={2} />
                  <RT content={<RevTip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* MEDICINES */}
      {tab==='medicines' && (
        <div className="anim-fade-up">
          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
            <Filter size={15} color="var(--text-muted)" />
            <span style={{ fontSize:13, color:'var(--text-secondary)' }}>Category:</span>
            {allCats.map(c => (
              <button key={c} className={`btn btn-sm ${catFilter===c?'btn-primary':'btn-ghost'}`} onClick={() => setCatFilter(c)} style={{ fontSize:12 }}>{c}</button>
            ))}
          </div>
          <div className="chart-card" style={{ marginBottom:18 }}>
            <p className="chart-title">Top 10 Medicines — Revenue</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={filteredMeds.slice(0,10)} barSize={22} margin={{ top:4, right:4, bottom:40, left:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="Medicine_Name" tick={{ fill:'var(--text-secondary)', fontSize:10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={55} />
                <YAxis tickFormatter={v => fmt.cr(v)} tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
                <RT content={<RevTip />} />
                <Bar dataKey="revenue" name="Revenue" radius={[6,6,0,0]}>{filteredMeds.slice(0,10).map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <p className="chart-title" style={{ marginBottom:14 }}>Medicine Performance Table</p>
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Medicine</th><th>Category</th><th>Units Sold</th><th>Revenue</th><th>Profit</th><th>Avg Stock</th><th>Margin</th></tr>
                </thead>
                <tbody>
                  {filteredMeds.slice(0,15).map((m,i) => {
                    const margin = m.profit && m.revenue ? Math.round(m.profit/m.revenue*100) : 0;
                    return (
                      <tr key={i}>
                        <td style={{ color:'var(--text-muted)', fontSize:12 }}>{i+1}</td>
                        <td style={{ fontWeight:600 }}>{m.Medicine_Name}</td>
                        <td><span className="tag" style={{ fontSize:11 }}>{m.Medicine_Category}</span></td>
                        <td>{fmt.k(m.qty)}</td>
                        <td style={{ color:'var(--cyan)', fontWeight:600 }}>{fmt.cr(m.revenue)}</td>
                        <td style={{ color:'#34d399', fontWeight:600 }}>{fmt.cr(m.profit)}</td>
                        <td>{fmt.k(Math.round(m.avg_stock))}</td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div className="progress-track" style={{ width:48 }}>
                              <div className="progress-fill" style={{ width:`${Math.min(margin,100)}%`, background:margin>40?'#34d399':margin>25?'#f59e0b':'#f43f5e' }}/>
                            </div>
                            <span style={{ fontSize:12, fontWeight:600 }}>{margin}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REGION */}
      {tab==='region' && (
        <div className="anim-fade-up">
          <div className="grid-2" style={{ marginBottom:18 }}>
            <div className="chart-card">
              <p className="chart-title">Revenue vs Profit by Region</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={regions} barSize={16} margin={{ top:4, right:4, bottom:40, left:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="Region" tick={{ fill:'var(--text-secondary)', fontSize:10 }} axisLine={false} tickLine={false} angle={-25} textAnchor="end" height={55} />
                  <YAxis tickFormatter={v => fmt.cr(v)} tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
                  <RT content={<RevTip />} />
                  <Bar dataKey="revenue" name="Revenue" fill="#00f5d4" radius={[4,4,0,0]} />
                  <Bar dataKey="profit"  name="Profit"  fill="#7c3aed" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <p className="chart-title" style={{ marginBottom:14 }}>Region Performance</p>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Region</th><th>Revenue</th><th>Units</th><th>Profit</th><th>Margin</th></tr></thead>
                  <tbody>
                    {regions.map((r,i) => {
                      const margin = Math.round(r.profit/r.revenue*100);
                      return (
                        <tr key={i}>
                          <td>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ width:8, height:8, borderRadius:'50%', background:COLORS[i%COLORS.length] }}/>
                              <span style={{ fontWeight:600 }}>{r.Region}</span>
                            </div>
                          </td>
                          <td style={{ color:'var(--cyan)', fontWeight:600 }}>{fmt.cr(r.revenue)}</td>
                          <td>{fmt.k(r.qty)}</td>
                          <td style={{ color:'#34d399' }}>{fmt.cr(r.profit)}</td>
                          <td>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <div className="progress-track" style={{ width:40 }}><div className="progress-fill" style={{ width:`${margin}%`, background:'#00f5d4' }}/></div>
                              <span style={{ fontSize:12, fontWeight:600 }}>{margin}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="chart-card">
            <p className="chart-title">Category Revenue vs Volume Bubble Chart</p>
            <p className="chart-sub">X = Units (10K) · Y = Revenue (₹Cr) · Bubble size = Revenue magnitude</p>
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart margin={{ top:10, right:20, bottom:20, left:10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis type="number" dataKey="x" name="Units (10K)" tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="y" name="Revenue (₹Cr)" tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
                <ZAxis type="number" dataKey="z" range={[60,400]} />
                <RT cursor={{ strokeDasharray:'3 3' }} content={({ active, payload }) => {
                  if (!active||!payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div style={{ background:'var(--bg-card2)', border:'1px solid var(--border-hi)', borderRadius:9, padding:'8px 13px', fontSize:12 }}>
                      <p style={{ fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>{d?.name}</p>
                      <p style={{ color:'var(--cyan)' }}>Revenue: ₹{d?.y}Cr</p>
                      <p style={{ color:'var(--violet-hi)' }}>Volume: {d?.x}0K units</p>
                    </div>
                  );
                }} />
                <Scatter data={scatterData} fill="#00f5d4">
                  {scatterData.map((d,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} fillOpacity={0.85} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
