import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

// ── Format helpers ────────────────────────────────────────────────────────────
export const fmt = {
  num:  (n) => n == null ? '—' : Number(n).toLocaleString('en-IN'),
  cr:   (n) => n == null ? '—' : `₹${(n/1e7).toFixed(1)}Cr`,
  lakh: (n) => n == null ? '—' : `₹${(n/1e5).toFixed(1)}L`,
  pct:  (n) => n == null ? '—' : `${Number(n).toFixed(1)}%`,
  k:    (n) => n == null ? '—' : n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : String(n),
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
export function KPICard({ title, value, sub, icon: Icon, color = '#00f5d4', trend, prefix = '' }) {
  const glowStyle = { '--glow-color': `${color}12` };
  return (
    <div className="stat-card anim-fade-up" style={glowStyle}>
      <div className="accent-bar" style={{ background: color }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
        <p style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.9px' }}>{title}</p>
        <div style={{ width:36, height:36, borderRadius:10, background:`${color}15`, border:`1px solid ${color}25`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {Icon && <Icon size={17} color={color} />}
        </div>
      </div>
      <p style={{ fontSize:26, fontWeight:800, fontFamily:'var(--font-display)', color:'var(--text-primary)', lineHeight:1, marginBottom:8 }}>
        {prefix}{value}
      </p>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        {trend != null && (
          <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:11, fontWeight:600, color: trend >= 0 ? '#34d399' : '#fb7185' }}>
            {trend >= 0 ? <TrendingUp size={11}/> : <TrendingDown size={11}/>}
            {Math.abs(trend)}%
          </span>
        )}
        {sub && <span style={{ fontSize:12, color:'var(--text-muted)' }}>{sub}</span>}
      </div>
    </div>
  );
}

// ── Chart Tooltip ─────────────────────────────────────────────────────────────
export function Tooltip({ active, payload, label, prefix = '', suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg-card2)', border:'1px solid var(--border-hi)', borderRadius:10, padding:'10px 14px', fontSize:12, minWidth:140 }}>
      <p style={{ color:'var(--text-secondary)', marginBottom:6, fontWeight:500 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color:p.color||'var(--cyan)', fontWeight:700, marginBottom:2 }}>
          {p.name}: {prefix}{typeof p.value === 'number' ? fmt.num(Math.round(p.value)) : p.value}{suffix}
        </p>
      ))}
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
export function SectionHdr({ title, sub, action, icon: Icon, color = 'var(--cyan)' }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:4 }}>
          {Icon && <Icon size={17} color={color} />}
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:700 }}>{title}</h2>
        </div>
        {sub && <p style={{ fontSize:12.5, color:'var(--text-secondary)', marginLeft:26 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Skeleton loaders ──────────────────────────────────────────────────────────
export function SkeletonCard({ h = 120 }) {
  return <div className="skeleton" style={{ height:h, borderRadius:'var(--radius)' }} />;
}
export function SkeletonRow({ n = 5 }) {
  return Array.from({length:n}).map((_,i) => (
    <tr key={i}><td colSpan={10}><div className="skeleton" style={{height:40,borderRadius:6,margin:'4px 0'}}/></td></tr>
  ));
}

// ── Disease×Region Heatmap ───────────────────────────────────────────────────
export function DiseaseHeatmap({ data = [], diseases = [], regions = [] }) {
  const [hovered, setHovered] = useState(null);
  if (!data.length) return <div className="spin-wrap"><div className="spinner"/></div>;

  const get = (d, r) => data.find(x => x.Disease_Name===d && x.Region===r)?.Quantity_Sold || 0;
  const maxVal = Math.max(...data.map(d => d.Quantity_Sold));

  const getColor = (val) => {
    if (!val) return 'rgba(255,255,255,0.03)';
    const pct = val / maxVal;
    if (pct > 0.8) return 'rgba(244,63,94,0.85)';
    if (pct > 0.6) return 'rgba(245,158,11,0.75)';
    if (pct > 0.4) return 'rgba(0,245,212,0.60)';
    if (pct > 0.2) return 'rgba(0,245,212,0.35)';
    return 'rgba(0,245,212,0.15)';
  };

  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:3 }}>
        <thead>
          <tr>
            <th style={{ textAlign:'left', padding:'4px 8px', fontSize:10, color:'var(--text-muted)', minWidth:130 }}>Disease</th>
            {regions.map(r => <th key={r} style={{ fontSize:10, color:'var(--text-muted)', padding:'4px 6px', textAlign:'center', minWidth:70 }}>{r.slice(0,6)}</th>)}
          </tr>
        </thead>
        <tbody>
          {diseases.map(d => (
            <tr key={d}>
              <td style={{ fontSize:11.5, color:'var(--text-secondary)', padding:'2px 8px', fontWeight:500 }}>{d}</td>
              {regions.map(r => {
                const val = get(d, r);
                const key = `${d}-${r}`;
                return (
                  <td key={r} style={{ padding:2 }}>
                    <div
                      className="heatmap-cell"
                      onMouseEnter={() => setHovered({key, disease:d, region:r, val})}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        height:32, background:getColor(val),
                        borderRadius:4, position:'relative',
                        border: hovered?.key===key ? '1px solid rgba(0,245,212,0.6)' : '1px solid transparent',
                      }}
                      title={`${d} / ${r}: ${fmt.k(val)} units`}
                    >
                      {hovered?.key===key && (
                        <div style={{ position:'absolute', bottom:'105%', left:'50%', transform:'translateX(-50%)', background:'var(--bg-card2)', border:'1px solid var(--border-hi)', borderRadius:6, padding:'5px 9px', fontSize:11, whiteSpace:'nowrap', zIndex:10, pointerEvents:'none' }}>
                          <strong>{d}</strong> · {r}<br/>{fmt.k(val)} units
                        </div>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:12, justifyContent:'flex-end' }}>
        <span style={{ fontSize:11, color:'var(--text-muted)' }}>Low</span>
        {['rgba(0,245,212,0.15)','rgba(0,245,212,0.35)','rgba(0,245,212,0.60)','rgba(245,158,11,0.75)','rgba(244,63,94,0.85)'].map((c,i) => (
          <div key={i} style={{ width:22, height:14, background:c, borderRadius:3 }} />
        ))}
        <span style={{ fontSize:11, color:'var(--text-muted)' }}>High</span>
      </div>
    </div>
  );
}

// ── Risk badge ────────────────────────────────────────────────────────────────
export function RiskBadge({ score }) {
  if (score > 50) return <span className="badge badge-critical">CRITICAL</span>;
  if (score > 35) return <span className="badge badge-low">HIGH</span>;
  if (score > 20) return <span className="badge badge-moderate">MODERATE</span>;
  return <span className="badge badge-adequate">LOW</span>;
}

// ── Forecast mini-chart sparkline ─────────────────────────────────────────────
export function Sparkline({ data, color = '#00f5d4', height = 40, width = 120 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length-1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ overflow:'visible' }}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3}/>
          <stop offset="100%" stopColor={color} stopOpacity={0}/>
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth={1.8} points={pts} />
    </svg>
  );
}
