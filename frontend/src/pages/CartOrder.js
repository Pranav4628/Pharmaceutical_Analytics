import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, CheckCircle, Package, Truck, Star, X } from 'lucide-react';
import { placeOrder, getOrders } from '../utils/api';
import { fmt } from '../components/UI';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['CONFIRMED','PROCESSING','DISPATCHED','DELIVERED'];

function OrderTimeline({ status }) {
  const cur = STATUS_STEPS.indexOf(status);
  const icons = [CheckCircle, Package, Truck, Star];
  return (
    <div style={{ display:'flex', alignItems:'center', marginTop:12 }}>
      {STATUS_STEPS.map((step, i) => {
        const Icon = icons[i];
        const done = i <= cur;
        return (
          <React.Fragment key={step}>
            <div style={{ textAlign:'center', flex:1 }}>
              <div style={{ width:30, height:30, borderRadius:'50%', margin:'0 auto 5px', display:'flex', alignItems:'center', justifyContent:'center', background:done?'var(--cyan)':'var(--bg-surface)', border:`2px solid ${done?'var(--cyan)':'var(--border-md)'}`, transition:'all 0.4s' }}>
                <Icon size={13} color={done?'#000':'var(--text-muted)'}/>
              </div>
              <p style={{ fontSize:9.5, color:done?'var(--cyan)':'var(--text-muted)', fontWeight:done?600:400, whiteSpace:'nowrap' }}>{step}</p>
            </div>
            {i < STATUS_STEPS.length-1 && (
              <div style={{ flex:1, height:2, background:i<cur?'var(--cyan)':'var(--border)', margin:'0 4px 20px', transition:'background 0.4s' }}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function CartOrder() {
  const { items, remove, update, clear, total, count } = useCart();
  const [orders,  setOrders]  = useState([]);
  const [form,    setForm]    = useState({ name:'', email:'', address:'', phone:'' });
  const [placing, setPlacing] = useState(false);
  const [lastOrder, setLast]  = useState(null);
  const [tab, setTab]         = useState('cart');

  useEffect(() => {
    getOrders().then(r => setOrders(r.data.data||[])).catch(() => setOrders([]));
  }, []);

  const set = (k,v) => setForm(p => ({...p,[k]:v}));

  const handlePlace = async () => {
    if (!form.name || !form.address) { toast.error('Name and address required'); return; }
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    setPlacing(true);
    const payload = {
      user_name: form.name, user_email: form.email, address: form.address,
      pharmacy_id: items[0]?.pharmacy_id || 'p1',
      items: items.map(i => ({ name:i.name, price:i.price, quantity:i.qty })),
    };
    try {
      const r = await placeOrder(payload);
      setLast(r.data.data);
    } catch {
      setLast({ order_id:`RX${Date.now()}`, user_name:form.name, items, total_amount:total, status:'CONFIRMED', payment_status:'SIMULATED', estimated_delivery:'2-3 hours', created_at:new Date().toISOString() });
    }
    clear(); setPlacing(false); setTab('orders');
    toast.success('🎉 Order placed successfully!');
  };

  return (
    <div className="anim-fade-up">
      <div className="page-hdr">
        <h1 style={{ background:'linear-gradient(135deg,#f0f6ff 30%,#3b82f6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Cart & Orders</h1>
        <p>Review items · Checkout · Track delivery status</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:5, marginBottom:24, background:'var(--bg-surface)', padding:4, borderRadius:11, width:'fit-content' }}>
        {[{id:'cart',label:`🛒 Cart (${count})`},{id:'orders',label:'📦 Order History'}].map(t => (
          <button key={t.id} className={`btn btn-sm ${tab===t.id?'btn-primary':'btn-ghost'}`} onClick={() => setTab(t.id)} style={{ borderRadius:8 }}>{t.label}</button>
        ))}
      </div>

      {/* Success banner */}
      {lastOrder && (
        <div className="alert alert-success anim-fade-up" style={{ marginBottom:20, flexDirection:'column', alignItems:'flex-start', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, width:'100%' }}>
            <CheckCircle size={18}/>
            <div style={{ flex:1 }}>
              <strong>Order Placed! 🎉</strong>
              <p style={{ fontSize:12, opacity:0.9, marginTop:2 }}>ID: {lastOrder.order_id} · Total: ₹{fmt.k(lastOrder.total_amount)} · ETA: {lastOrder.estimated_delivery}</p>
            </div>
            <button onClick={() => setLast(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'inherit' }}><X size={15}/></button>
          </div>
          <OrderTimeline status="CONFIRMED" />
        </div>
      )}

      {/* CART TAB */}
      {tab==='cart' && (
        <div className="grid-2" style={{ alignItems:'flex-start' }}>
          <div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:17, marginBottom:14 }}>Cart Items</h2>
            {items.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 20px', background:'var(--bg-card)', borderRadius:'var(--radius)', border:'1px solid var(--border)' }}>
                <ShoppingCart size={44} color="var(--text-muted)" style={{ marginBottom:14 }}/>
                <p style={{ color:'var(--text-muted)', fontSize:15 }}>Cart is empty</p>
                <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:5 }}>Search medicines and add them to cart</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {items.map((item,i) => (
                  <div key={item._key} className="card card-p" style={{ padding:'14px 18px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div style={{ flex:1 }}>
                        <h4 style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>{item.name}</h4>
                        <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8 }}>{item.category || ''} · from {item.pharmacy}</p>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <button className="btn btn-ghost btn-sm" style={{ padding:'4px 8px' }} onClick={() => update(item._key, item.qty-1)}><Minus size={12}/></button>
                            <span style={{ fontWeight:700, minWidth:22, textAlign:'center' }}>{item.qty}</span>
                            <button className="btn btn-ghost btn-sm" style={{ padding:'4px 8px' }} onClick={() => update(item._key, item.qty+1)}><Plus size={12}/></button>
                          </div>
                          <span style={{ color:'var(--amber-hi)', fontWeight:700 }}>₹{fmt.k(item.price)} × {item.qty} = ₹{fmt.k(item.price*item.qty)}</span>
                        </div>
                      </div>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(item._key)} style={{ marginLeft:10 }}><Trash2 size={13}/></button>
                    </div>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" style={{ alignSelf:'flex-start' }} onClick={clear}>Clear All</button>
              </div>
            )}
          </div>

          {/* Checkout */}
          <div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:17, marginBottom:14 }}>Checkout</h2>
            <div className="card card-p">
              {/* Summary */}
              <div style={{ marginBottom:18 }}>
                <p style={{ fontFamily:'var(--font-display)', fontSize:14, marginBottom:10 }}>Order Summary</p>
                {items.map((item,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:13, color:'var(--text-secondary)' }}>
                    <span>{item.name} ×{item.qty}</span>
                    <span>₹{fmt.k(item.price*item.qty)}</span>
                  </div>
                ))}
                <div className="glow-line"/>
                <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:19, color:'var(--amber-hi)', fontFamily:'var(--font-display)' }}>
                  <span>Total</span><span>₹{fmt.k(total)}</span>
                </div>
              </div>
              {/* Form */}
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
                {[{k:'name',l:'Full Name *',t:'text',p:'Enter your name'},{k:'email',l:'Email',t:'email',p:'email@example.com'},{k:'phone',l:'Phone',t:'tel',p:'+91-XXXXXXXXXX'},{k:'address',l:'Delivery Address *',t:'text',p:'Enter full address'}].map(f => (
                  <div key={f.k} className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">{f.l}</label>
                    <input className="input" type={f.t} placeholder={f.p} value={form[f.k]} onChange={e => set(f.k, e.target.value)} />
                  </div>
                ))}
              </div>
              <div className="alert alert-success" style={{ marginBottom:14, fontSize:12 }}>
                <CheckCircle size={13}/> Simulated payment · No real transaction
              </div>
              <button className="btn btn-primary btn-lg" style={{ width:'100%', justifyContent:'center' }} onClick={handlePlace} disabled={placing||items.length===0}>
                {placing ? 'Placing…' : `Place Order · ₹${fmt.k(total)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {tab==='orders' && (
        <div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:17, marginBottom:16 }}>Order History</h2>
          {[...(lastOrder?[lastOrder]:[]), ...orders].length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px', background:'var(--bg-card)', borderRadius:'var(--radius)', border:'1px solid var(--border)' }}>
              <Package size={44} color="var(--text-muted)" style={{ marginBottom:14 }}/>
              <p style={{ color:'var(--text-muted)' }}>No orders yet.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[...(lastOrder?[lastOrder]:[]), ...orders].slice(0,10).map((order,i) => (
                <div key={i} className="card card-p">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <div>
                      <h4 style={{ fontFamily:'var(--font-display)', marginBottom:4 }}>{order.order_id}</h4>
                      <p style={{ fontSize:12, color:'var(--text-muted)' }}>{new Date(order.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} · {order.user_name}</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <span className="badge badge-confirmed">{order.status}</span>
                      <p style={{ fontSize:19, fontWeight:800, color:'var(--amber-hi)', marginTop:5, fontFamily:'var(--font-display)' }}>₹{fmt.k(order.total_amount)}</p>
                    </div>
                  </div>
                  <p style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:8 }}>
                    {(order.items||[]).map((it,j) => `${it.name||it.medicine_name}(×${it.quantity||it.qty})`).join(', ')}
                  </p>
                  <OrderTimeline status={order.status||'CONFIRMED'} />
                  <div style={{ marginTop:10, display:'flex', gap:16, fontSize:11, color:'var(--text-muted)' }}>
                    <span>⏱ ETA: {order.estimated_delivery}</span>
                    <span>💳 {order.payment_status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
