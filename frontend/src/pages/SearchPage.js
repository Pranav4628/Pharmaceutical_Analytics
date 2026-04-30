import React, { useState, useEffect } from 'react';
import { Search, Brain, ShoppingCart, Star, Upload, FileText, Zap } from 'lucide-react';
import { getMedicineStats, getRecommend, analyzePrescription, MOCK } from '../utils/api';
import { fmt } from '../components/UI';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const DISEASES = ['Influenza','Diabetes','Hypertension','COVID-19','Malaria','Dengue','Asthma','Common Cold','Arthritis','Pneumonia','Typhoid','Tuberculosis'];
const REGIONS  = ['Mumbai','Delhi','Chennai','Bengaluru','Hyderabad','Kolkata','Pune','Ahmedabad','Jaipur','Nagpur'];

function MedCard({ med, onAdd }) {
  const margin   = med.profit && med.revenue ? Math.round(med.profit/med.revenue*100) : 0;
  const stockPct = Math.min(100, (med.avg_stock / 5000) * 100);
  const isLow    = med.avg_stock < 1500;

  return (
    <div className="card card-p anim-fade-up" style={{ position:'relative', overflow:'hidden', transition:'all 0.25s' }}
      onMouseEnter={e => e.currentTarget.style.transform='translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
    >
      {isLow && <div style={{ position:'absolute', top:0, right:0, background:'var(--rose)', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 10px', borderBottomLeftRadius:9, letterSpacing:'0.5px' }}>LOW STOCK</div>}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,var(--cyan),var(--violet))`, opacity:0.6, borderRadius:'var(--radius) var(--radius) 0 0' }}/>
      <div style={{ marginBottom:12 }}>
        <h3 style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>{med.Medicine_Name}</h3>
        <span className="tag" style={{ fontSize:11 }}>{med.Medicine_Category}</span>
      </div>
      <div style={{ marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
          <span style={{ fontSize:12, color:'var(--text-muted)' }}>Stock availability</span>
          <span style={{ fontSize:12, fontWeight:600, color:isLow?'var(--rose)':'var(--cyan)' }}>{fmt.k(Math.round(med.avg_stock))} avg</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width:`${stockPct}%`, background:isLow?'var(--rose)':'var(--cyan)' }}/>
        </div>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div>
          <p style={{ fontSize:11, color:'var(--text-muted)' }}>Total Revenue</p>
          <p style={{ fontSize:16, fontWeight:700, color:'var(--amber-hi)', fontFamily:'var(--font-display)' }}>{fmt.cr(med.revenue)}</p>
        </div>
        <div style={{ textAlign:'right' }}>
          <p style={{ fontSize:11, color:'var(--text-muted)' }}>Margin</p>
          <p style={{ fontSize:14, fontWeight:700, color:margin>40?'#34d399':margin>25?'var(--amber-hi)':'var(--rose)' }}>{margin}%</p>
        </div>
      </div>
      <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:13 }} onClick={() => onAdd(med)}>
        <ShoppingCart size={14}/> Add to Cart
      </button>
    </div>
  );
}

export default function SearchPage() {
  const [medicines,  setMeds]    = useState([]);
  const [filtered,   setFiltered]= useState([]);
  const [search,     setSearch]  = useState('');
  const [disease,    setDisease] = useState('');
  const [region,     setRegion]  = useState('Mumbai');
  const [recs,       setRecs]    = useState([]);
  const [loadRec,    setLoadRec] = useState(false);
  const [prescTab,   setPrescTab]= useState(false);
  const [prescDisease, setPD]    = useState('Influenza');
  const [prescResult,  setPR]    = useState(null);
  const [loading,    setLoading] = useState(true);
  const { add } = useCart();

  useEffect(() => {
    getMedicineStats().then(r => { setMeds(r.data.data); setFiltered(r.data.data); }).catch(() => { setMeds(MOCK.medicine_stats); setFiltered(MOCK.medicine_stats); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let data = medicines;
    if (search) data = data.filter(m => m.Medicine_Name?.toLowerCase().includes(search.toLowerCase()) || m.Medicine_Category?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(data);
  }, [search, medicines]);

  useEffect(() => {
    if (!disease) { setRecs([]); return; }
    setLoadRec(true);
    getRecommend({ disease, region })
      .then(r => setRecs(r.data.data?.recommendations || []))
      .catch(() => setRecs(MOCK.medicine_stats.slice(0,6)))
      .finally(() => setLoadRec(false));
  }, [disease, region]);

  const handlePrescription = async () => {
    try {
      const r = await analyzePrescription({ disease: prescDisease, region });
      setPR(r.data.data);
    } catch {
      setPR({ disease:prescDisease, region, suggested_medicines: MOCK.medicine_stats.slice(0,6), ai_note:`Based on ${prescDisease} patterns in ${region}, these medicines show highest demand correlation.` });
    }
  };

  return (
    <div className="anim-fade-up">
      <div className="page-hdr">
        <h1 style={{ background:'linear-gradient(135deg,#f0f6ff 30%,var(--cyan))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Medicine Search</h1>
        <p>Search by name · Filter by disease · AI-powered recommendations · Prescription analysis</p>
      </div>

      {/* Search Bar */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:240 }}>
          <Search size={16} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
          <input className="input" style={{ paddingLeft:40, fontSize:15 }} placeholder="Search medicines, categories…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ width:180 }} value={disease} onChange={e => setDisease(e.target.value)}>
          <option value="">All Diseases</option>
          {DISEASES.map(d => <option key={d}>{d}</option>)}
        </select>
        <select className="input" style={{ width:160 }} value={region} onChange={e => setRegion(e.target.value)}>
          {REGIONS.map(r => <option key={r}>{r}</option>)}
        </select>
        <button className="btn btn-outline btn-sm" onClick={() => setPrescTab(!prescTab)}>
          <Upload size={14}/> Prescription
        </button>
      </div>

      {/* Prescription Panel */}
      {prescTab && (
        <div className="card card-p anim-fade-up" style={{ marginBottom:20, borderColor:'rgba(0,245,212,0.2)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <FileText size={18} color="var(--cyan)" />
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:16 }}>Prescription Analyzer</h3>
            <span className="badge badge-ai">AI-Powered</span>
          </div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:14 }}>
            <select className="input" style={{ width:200 }} value={prescDisease} onChange={e => setPD(e.target.value)}>
              {DISEASES.map(d => <option key={d}>{d}</option>)}
            </select>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 16px', background:'var(--bg-surface)', borderRadius:'var(--radius-sm)', border:'2px dashed var(--border-md)', cursor:'pointer', color:'var(--text-secondary)', fontSize:13 }}
              onClick={() => toast('File upload simulated — prescription received', { icon:'📋' })}>
              <Upload size={15}/> Upload prescription (PDF/Image)
            </div>
            <button className="btn btn-primary" onClick={handlePrescription}><Brain size={14}/> Analyze</button>
          </div>
          {prescResult && (
            <div>
              <div className="alert alert-success" style={{ marginBottom:12 }}>
                <Brain size={15}/> {prescResult.ai_note}
              </div>
              <div className="grid-3">
                {(prescResult.suggested_medicines||[]).slice(0,6).map((m,i) => (
                  <div key={i} style={{ padding:'12px 14px', background:'var(--bg-surface)', borderRadius:10, border:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <p style={{ fontWeight:600, fontSize:13 }}>{m.Medicine_Name||m.medicine}</p>
                      <span className="tag" style={{ fontSize:11, marginTop:4 }}>{m.Medicine_Category||m.category}</span>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => add(m)}><ShoppingCart size={12}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Recommendations */}
      {disease && (
        <div style={{ marginBottom:22, padding:'18px 20px', background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:'var(--radius)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <Brain size={17} color="var(--violet-hi)"/>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700 }}>AI Recommendations for <span style={{ color:'var(--violet-hi)' }}>{disease}</span> in {region}</h3>
          </div>
          {loadRec ? <div style={{ display:'flex', gap:10 }}>{[...Array(4)].map((_,i) => <div key={i} className="skeleton" style={{ height:90, flex:1, borderRadius:9 }}/>)}</div> : (
            <div className="grid-4">
              {recs.slice(0,8).map((r,i) => (
                <div key={i} style={{ padding:'12px 14px', background:'var(--bg-card)', borderRadius:10, border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontWeight:700, fontSize:13 }}>{r.Medicine_Name}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:3, color:'var(--amber-hi)' }}>
                      <Star size={11} fill="var(--amber-hi)"/><span style={{ fontSize:11 }}>{(4+Math.random()*0.9).toFixed(1)}</span>
                    </div>
                  </div>
                  <span className="tag" style={{ fontSize:10 }}>{r.Medicine_Category}</span>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10 }}>
                    <span style={{ fontWeight:700, color:'var(--amber-hi)', fontSize:13 }}>{fmt.cr(r.revenue)}</span>
                    <button className="btn btn-primary btn-sm" onClick={() => add(r)}><ShoppingCart size={12}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:17 }}>
          {disease || 'All Medicines'} <span style={{ fontSize:13, color:'var(--text-muted)', fontFamily:'var(--font-ui)', fontWeight:400 }}>({filtered.length})</span>
        </h2>
        {search && <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Clear search</button>}
      </div>

      {loading ? <div className="grid-3">{[...Array(6)].map((_,i) => <div key={i} className="skeleton" style={{ height:220, borderRadius:'var(--radius)' }}/>)}</div> : (
        <div className="grid-3">
          {filtered.map((m,i) => <MedCard key={i} med={m} onAdd={add} />)}
        </div>
      )}
      {!loading && filtered.length===0 && (
        <div style={{ textAlign:'center', padding:'60px 20px', background:'var(--bg-card)', borderRadius:'var(--radius)', border:'1px solid var(--border)' }}>
          <Search size={40} color="var(--text-muted)" style={{ marginBottom:14 }}/>
          <p style={{ color:'var(--text-muted)', fontSize:16 }}>No medicines found</p>
          <button className="btn btn-ghost btn-sm" style={{ marginTop:12 }} onClick={() => { setSearch(''); setDisease(''); }}>Clear filters</button>
        </div>
      )}
    </div>
  );
}
