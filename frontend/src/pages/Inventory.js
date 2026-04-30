// ═══════════════════════════════════════════════════════════════
//  Inventory.js
// ═══════════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Search, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { getMedicineStats, getCategoryStats, MOCK } from '../utils/api';
import { RiskBadge, SkeletonCard, fmt } from '../components/UI';
import toast from 'react-hot-toast';

const CATS = ['Analgesic','Antibiotic','Antidiabetic','Antihistamine','Antiviral','Cardiovascular','Corticosteroid','Gastrointestinal','Supplement','Vitamin'];

function MedModal({ med, onSave, onClose }) {
  const [form, setForm] = useState(med || { Medicine_Name:'', Medicine_Category:'Analgesic', qty:0, revenue:0, avg_stock:2500, profit:0 });
  const set = (k,v) => setForm(p => ({...p,[k]:v}));
  const save = () => {
    if (!form.Medicine_Name) { toast.error('Name required'); return; }
    onSave(form);
    toast.success(med ? 'Updated!' : 'Medicine added!');
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal anim-scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <h3 className="modal-title">{med ? 'Edit Medicine' : '+ Add Medicine'}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={15}/></button>
        </div>
        <div className="grid-2">
          {[{k:'Medicine_Name',l:'Name *',t:'text'},{k:'qty',l:'Quantity Sold',t:'number'},{k:'revenue',l:'Revenue (₹)',t:'number'},{k:'avg_stock',l:'Avg Stock',t:'number'},{k:'profit',l:'Profit (₹)',t:'number'}].map(f => (
            <div key={f.k} className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">{f.l}</label>
              <input className="input" type={f.t} value={form[f.k]||''} onChange={e => set(f.k, f.t==='number'?+e.target.value:e.target.value)} />
            </div>
          ))}
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Category</label>
            <select className="input" value={form.Medicine_Category||''} onChange={e => set('Medicine_Category',e.target.value)}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:'flex', gap:10, marginTop:20 }}>
          <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={save}>{med ? 'Update' : 'Add Medicine'}</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function Inventory() {
  const [medicines, setMeds]   = useState([]);
  const [loading,   setLoading] = useState(true);
  const [search,    setSearch]  = useState('');
  const [catF,      setCatF]    = useState('All');
  const [modal,     setModal]   = useState(false);
  const [editMed,   setEdit]    = useState(null);

  useEffect(() => {
    getMedicineStats().then(r => setMeds(r.data.data)).catch(() => setMeds(MOCK.medicine_stats)).finally(() => setLoading(false));
  }, []);

  const cats    = ['All', ...new Set(medicines.map(m => m.Medicine_Category))];
  const filtered = medicines.filter(m => {
    const matchS = !search || m.Medicine_Name?.toLowerCase().includes(search.toLowerCase());
    const matchC = catF==='All' || m.Medicine_Category===catF;
    return matchS && matchC;
  });

  const handleSave = (data) => {
    if (editMed) setMeds(prev => prev.map(m => m.Medicine_Name===editMed.Medicine_Name ? data : m));
    else setMeds(prev => [data, ...prev]);
    setModal(false); setEdit(null);
  };
  const handleDelete = (med) => {
    if (!window.confirm(`Delete ${med.Medicine_Name}?`)) return;
    setMeds(prev => prev.filter(m => m.Medicine_Name !== med.Medicine_Name));
    toast.success('Deleted');
  };

  const statsRow = [
    {l:'Total Medicines',v:medicines.length,c:'var(--cyan)'},
    {l:'Total Revenue',v:fmt.cr(medicines.reduce((s,m)=>s+(m.revenue||0),0)),c:'#34d399'},
    {l:'Total Units',v:fmt.k(medicines.reduce((s,m)=>s+(m.qty||0),0)),c:'var(--violet-hi)'},
    {l:'Avg Stock',v:fmt.k(Math.round(medicines.reduce((s,m)=>s+(m.avg_stock||0),0)/(medicines.length||1))),c:'var(--amber-hi)'},
  ];

  return (
    <div className="anim-fade-up">
      <div className="page-hdr">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ background:'linear-gradient(135deg,#f0f6ff 30%,var(--cyan))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Inventory Management</h1>
            <p>Real dataset · 30 medicines · Live stock monitoring</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEdit(null); setModal(true); }}><Plus size={15}/> Add Medicine</button>
        </div>
      </div>
      <div className="grid-4 stagger" style={{ marginBottom:22 }}>
        {statsRow.map((s,i) => (
          <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'16px 20px' }}>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.8px' }}>{s.l}</p>
            <p style={{ fontSize:22, fontWeight:800, color:s.c, fontFamily:'var(--font-display)' }}>{s.v}</p>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:220 }}>
          <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
          <input className="input" style={{ paddingLeft:36 }} placeholder="Search medicines…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {cats.map(c => <button key={c} className={`btn btn-sm ${catF===c?'btn-primary':'btn-ghost'}`} onClick={() => setCatF(c)} style={{ fontSize:12 }}>{c}</button>)}
        </div>
        <span style={{ alignSelf:'center', fontSize:13, color:'var(--text-muted)' }}>{filtered.length} of {medicines.length}</span>
      </div>
      {loading ? <SkeletonCard h={400}/> : (
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Medicine</th><th>Category</th><th>Units Sold</th><th>Revenue</th><th>Profit</th><th>Avg Stock</th><th>Margin</th><th>Risk</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((m,i) => {
                const margin = m.profit && m.revenue ? Math.round(m.profit/m.revenue*100) : 0;
                const riskScore = 100 - (m.avg_stock / 5000 * 100);
                return (
                  <tr key={i}>
                    <td style={{ color:'var(--text-muted)', fontSize:12 }}>{i+1}</td>
                    <td><span style={{ fontWeight:600 }}>{m.Medicine_Name}</span></td>
                    <td><span className="tag" style={{ fontSize:11 }}>{m.Medicine_Category}</span></td>
                    <td>{fmt.k(m.qty)}</td>
                    <td style={{ color:'var(--cyan)', fontWeight:600 }}>{fmt.cr(m.revenue)}</td>
                    <td style={{ color:'#34d399', fontWeight:600 }}>{fmt.cr(m.profit)}</td>
                    <td>{fmt.k(Math.round(m.avg_stock))}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <div className="progress-track" style={{ width:44 }}>
                          <div className="progress-fill" style={{ width:`${Math.min(margin,100)}%`, background:margin>40?'#34d399':margin>25?'#f59e0b':'#f43f5e' }}/>
                        </div>
                        <span style={{ fontSize:12, fontWeight:600 }}>{margin}%</span>
                      </div>
                    </td>
                    <td><RiskBadge score={riskScore} /></td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEdit(m); setModal(true); }}><Edit2 size={13}/></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m)}><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length===0 && <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No medicines found</div>}
        </div>
      )}
      {modal && <MedModal med={editMed} onSave={handleSave} onClose={() => { setModal(false); setEdit(null); }} />}
    </div>
  );
}

export default Inventory;
