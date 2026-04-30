import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Star, ShoppingCart, Zap, CheckCircle, XCircle, Clock, ArrowUpDown } from 'lucide-react';
import { getNearby, getMedicineStats, MOCK } from '../utils/api';
import { fmt } from '../components/UI';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const REGIONS = ['All','Mumbai','Delhi','Chennai','Bengaluru','Hyderabad','Kolkata','Pune','Ahmedabad'];

function PharmCard({ pharmacy, onOrder }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card card-p anim-fade-up" style={{ borderColor: pharmacy.is_emergency ? 'rgba(244,63,94,0.35)' : 'var(--border)', position:'relative', overflow:'hidden', transition:'all 0.25s' }}
      onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
    >
      {pharmacy.is_emergency && (
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'var(--rose)' }}/>
      )}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <h3 style={{ fontSize:15, fontWeight:700 }}>{pharmacy.name}</h3>
            {pharmacy.is_emergency && <span className="badge badge-critical" style={{ fontSize:10 }}><Zap size={9}/> EMERGENCY</span>}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5, color:'var(--text-secondary)', fontSize:12 }}>
            <MapPin size={12}/> {pharmacy.address}
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ display:'flex', alignItems:'center', gap:4, color:'var(--amber-hi)', fontSize:13, fontWeight:600, marginBottom:4 }}>
            <Star size={12} fill="var(--amber-hi)"/> {pharmacy.rating}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color: pharmacy.is_open ? '#34d399' : 'var(--rose)' }}>
            {pharmacy.is_open ? <CheckCircle size={12}/> : <XCircle size={12}/>}
            {pharmacy.is_open ? 'Open Now' : 'Closed'}
          </div>
        </div>
      </div>
      <div style={{ display:'flex', gap:16, marginBottom:14, flexWrap:'wrap' }}>
        <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--text-secondary)' }}><MapPin size={12} color="var(--cyan)"/><span style={{ color:'var(--cyan)', fontWeight:600 }}>{pharmacy.distance_km}km</span></span>
        <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--text-secondary)' }}><Phone size={12}/>{pharmacy.phone}</span>
        <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--text-secondary)' }}><Clock size={12}/>~{Math.round(pharmacy.distance_km*3+10)}min</span>
      </div>
      <div style={{ background:'var(--bg-surface)', borderRadius:9, padding:'9px 13px', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:12, color:'var(--text-secondary)' }}>
          Available: <strong style={{ color:'var(--text-primary)' }}>{pharmacy.medicines?.length || 0} medicines</strong>
        </span>
        <button className="btn btn-ghost btn-sm" style={{ fontSize:11 }} onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Hide' : 'View'} stock
        </button>
      </div>
      {expanded && (
        <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:14 }}>
          {(pharmacy.medicines||[]).map((med,i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 12px', background:'var(--bg-surface)', borderRadius:8, border:'1px solid var(--border)' }}>
              <span style={{ fontSize:13, fontWeight:500 }}>{med}</span>
              <button className="btn btn-primary btn-sm" onClick={() => onOrder(med, pharmacy)} style={{ fontSize:11 }}><ShoppingCart size={11}/>Add</button>
            </div>
          ))}
        </div>
      )}
      <button className="btn btn-outline" style={{ width:'100%', justifyContent:'center' }} onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Collapse' : `Order from ${pharmacy.name}`}
      </button>
    </div>
  );
}

function PriceCompare({ medicines, pharmacies }) {
  const [sel, setSel] = useState('');
  const avail = pharmacies.filter(p => p.medicines?.includes(sel)).map((p,i) => ({
    ...p, price: sel ? Math.round(25000 + i*1200 - Math.random()*800) : 0
  })).sort((a,b) => a.price - b.price);

  return (
    <div className="chart-card" style={{ marginBottom:18 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <ArrowUpDown size={17} color="var(--cyan)"/><h3 style={{ fontFamily:'var(--font-display)', fontSize:15 }}>Price Comparison</h3>
      </div>
      <select className="input" style={{ marginBottom:14, maxWidth:280 }} value={sel} onChange={e => setSel(e.target.value)}>
        <option value="">Select a medicine to compare</option>
        {[...new Set(pharmacies.flatMap(p => p.medicines||[]))].map(m => <option key={m}>{m}</option>)}
      </select>
      {sel && avail.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {avail.map((p,i) => (
            <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderRadius:10, background: i===0 ? 'rgba(0,245,212,0.06)' : 'var(--bg-surface)', border:`1px solid ${i===0?'rgba(0,245,212,0.3)':'var(--border)'}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                {i===0 && <span style={{ fontSize:10, fontWeight:700, background:'var(--cyan)', color:'#000', padding:'2px 8px', borderRadius:10 }}>BEST PRICE</span>}
                <div>
                  <p style={{ fontWeight:600, fontSize:13 }}>{p.name}</p>
                  <p style={{ fontSize:11, color:'var(--text-muted)' }}>{p.distance_km}km · {p.is_open?'Open':'Closed'}</p>
                </div>
              </div>
              <span style={{ fontWeight:800, fontSize:19, color:i===0?'var(--cyan)':'var(--amber-hi)', fontFamily:'var(--font-display)' }}>₹{fmt.k(p.price)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Pharmacies() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [region,     setRegion]     = useState('All');
  const [emergOnly,  setEmerg]      = useState(false);
  const [openOnly,   setOpen]       = useState(false);
  const { add } = useCart();

  useEffect(() => {
    getNearby({ lat:19.076, lng:72.877}).then(r => setPharmacies(r.data.data)).catch(() => setPharmacies(MOCK.pharmacies)).finally(() => setLoading(false));
  }, []);

  const filtered = pharmacies.filter(p => {
    if (region!=='All' && p.region!==region) return false;
    if (emergOnly && !p.is_emergency) return false;
    if (openOnly  && !p.is_open) return false;
    return true;
  });

  const handleOrder = (medName, pharmacy) => {
    add({ Medicine_Name:medName, Medicine_Category:'', avg_stock:2500, revenue:25000, profit:10000 }, pharmacy);
  };

  return (
    <div className="anim-fade-up">
      <div className="page-hdr">
        <h1 style={{ background:'linear-gradient(135deg,#f0f6ff 30%,var(--amber-hi))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Nearby Pharmacies</h1>
        <p>Mock location: Mumbai, Maharashtra · Find stock, compare prices, place orders</p>
      </div>

      {/* Location banner */}
      <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px', background:'rgba(0,245,212,0.05)', border:'1px solid rgba(0,245,212,0.2)', borderRadius:'var(--radius)', marginBottom:20 }}>
        <div style={{ fontSize:32 }}>🗺️</div>
        <div style={{ flex:1 }}>
          <h3 style={{ fontFamily:'var(--font-display)', marginBottom:3 }}>Simulated Location: Mumbai, Maharashtra</h3>
          <p style={{ fontSize:13, color:'var(--text-secondary)' }}>Lat: 19.0760, Lng: 72.8777 · Showing {filtered.length} pharmacies within 10km</p>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ fontSize:13, color:'var(--cyan)', fontWeight:600 }}>{filtered.filter(p=>p.is_open).length} Open Now</p>
          <p style={{ fontSize:12, color:'var(--rose)' }}>{filtered.filter(p=>p.is_emergency).length} Emergency</p>
        </div>
      </div>

      <PriceCompare medicines={[]} pharmacies={pharmacies} />

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {REGIONS.map(r => <button key={r} className={`btn btn-sm ${region===r?'btn-primary':'btn-ghost'}`} onClick={() => setRegion(r)}>{r}</button>)}
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:14 }}>
          {[{l:'Emergency Only', v:emergOnly, set:setEmerg},{l:'Open Now', v:openOnly, set:setOpen}].map(f => (
            <label key={f.l} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:13, color:'var(--text-secondary)' }}>
              <input type="checkbox" checked={f.v} onChange={e => f.set(e.target.checked)} style={{ accentColor:'var(--cyan)', width:14, height:14 }}/>
              {f.l}
            </label>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid-2">{[...Array(4)].map((_,i) => <div key={i} className="skeleton" style={{ height:220, borderRadius:'var(--radius)' }}/>)}</div>
      ) : (
        <div className="grid-2">
          {filtered.map((p,i) => <PharmCard key={i} pharmacy={p} onOrder={handleOrder} />)}
          {filtered.length===0 && (
            <div style={{ gridColumn:'span 2', textAlign:'center', padding:'60px 20px', background:'var(--bg-card)', borderRadius:'var(--radius)', border:'1px solid var(--border)' }}>
              <MapPin size={40} color="var(--text-muted)" style={{ marginBottom:14 }}/>
              <p style={{ color:'var(--text-muted)' }}>No pharmacies match your filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
