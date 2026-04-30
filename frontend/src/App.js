import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard, Package, Search, MapPin, ShoppingCart, Brain,
  Settings, Activity, Bell, Menu, X, TrendingUp, AlertTriangle,
  FlaskConical, Sliders, ChevronRight, ShieldAlert, Sun, Moon
} from 'lucide-react';
import { CartProvider, useCart } from './context/CartContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import SearchPage from './pages/SearchPage';
import Pharmacies from './pages/Pharmacies';
import CartOrder from './pages/CartOrder';
import MLInsights from './pages/MLInsights';
import Analytics from './pages/Analytics';
import Admin from './pages/Admin';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', group: 'main' },
  { to: '/analytics', icon: TrendingUp, label: 'Analytics', group: 'main' },
  { to: '/inventory', icon: Package, label: 'Inventory', group: 'main' },
  { to: '/ml', icon: Brain, label: 'AI Insights', group: 'ai' },
  { to: '/alerts', icon: ShieldAlert, label: 'Alert Center', group: 'ai' },
  { to: '/search', icon: Search, label: 'Medicine Search', group: 'ops' },
  { to: '/pharmacies', icon: MapPin, label: 'Pharmacies', group: 'ops' },
  { to: '/cart', icon: ShoppingCart, label: 'Cart & Orders', group: 'ops' },
  { to: '/admin', icon: Settings, label: 'Admin', group: 'ops' },
];

function SidebarContent({ onClose }) {
  const { count } = useCart();
  const { theme, toggleTheme } = useTheme();
  const groups = [
    { id: 'main', label: 'Overview' },
    { id: 'ai', label: 'AI / ML' },
    { id: 'ops', label: 'Operations' },
  ];
  return (
    <>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#00f5d4,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>PharmaBI</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1.2px', textTransform: 'uppercase' }}>v2.0 · AI Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {groups.map(g => (
          <div key={g.id} style={{ marginBottom: 6 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '1.2px', textTransform: 'uppercase', padding: '8px 10px 4px' }}>{g.label}</p>
            {NAV.filter(n => n.group === g.id).map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                  borderRadius: 9, marginBottom: 2, textDecoration: 'none', fontSize: 13.5,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(0,245,212,0.08)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(0,245,212,0.18)' : 'transparent'}`,
                  transition: 'all 0.15s',
                })}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{label}</span>
                {label === 'Cart & Orders' && count > 0 && (
                  <span style={{ background: 'var(--rose)', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{count}</span>
                )}
                <ChevronRight size={12} style={{ opacity: 0.3 }} />
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4, borderRadius: 6, transition: 'all 0.15s' }} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)' }} className="glow-dot" />
        <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>200K records · Live</span>
      </div>
    </>
  );
}

function Topbar({ onMenu }) {
  const { count } = useCart();
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onMenu} className="btn btn-ghost btn-sm" style={{ display: 'none' }} id="menu-btn">
          <Menu size={16} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8 }}>
          <AlertTriangle size={13} color="var(--amber-hi)" />
          <span style={{ fontSize: 12, color: 'var(--amber-hi)' }}>Real dataset: 200K records · ₹5,053Cr revenue · 30 medicines · 49 diseases</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="btn btn-ghost btn-sm" style={{ position: 'relative' }}>
          <Bell size={15} />
          <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, background: 'var(--rose)', borderRadius: '50%' }} />
        </button>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,var(--cyan),var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>A</div>
      </div>
    </div>
  );
}

function AlertsPage() {
  // Minimal placeholder - redirects to ML insights alerts tab
  return (
    <div style={{ padding: 28 }}>
      <div className="page-hdr">
        <h1>🚨 Alert Center</h1>
        <p>Real-time stock, demand, and outbreak alerts</p>
      </div>
      <iframe src="/ml#alerts" style={{ width: '100%', height: '80vh', border: 'none' }} title="alerts" />
      <div style={{ marginTop: 20 }}>
        <MLInsights defaultTab="alerts" />
      </div>
    </div>
  );
}

export default function App() {
  const [menuOpen, setMenu] = useState(false);
  return (
    <ThemeProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="app-root">
            <style>{`
              @media(max-width:900px){
                .desktop-sidebar{display:none!important}
                #menu-btn{display:flex!important}
                .main-wrap{margin-left:0!important}
              }
            `}</style>

            {/* Desktop sidebar */}
            <aside className="sidebar desktop-sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
              <SidebarContent onClose={() => { }} />
            </aside>

            {/* Mobile sidebar overlay */}
            {menuOpen && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 190 }} onClick={() => setMenu(false)} />
            )}
            <aside className={`sidebar${menuOpen ? ' open' : ''}`} style={{ display: menuOpen ? 'flex' : 'none', flexDirection: 'column', zIndex: 200 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 12px 0' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setMenu(false)}><X size={16} /></button>
              </div>
              <SidebarContent onClose={() => setMenu(false)} />
            </aside>

            {/* Main */}
            <div className="main-wrap">
              <Topbar onMenu={() => setMenu(true)} />
              <div className="page-content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/ml" element={<MLInsights />} />
                  <Route path="/alerts" element={<MLInsights defaultTab="alerts" />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/pharmacies" element={<Pharmacies />} />
                  <Route path="/cart" element={<CartOrder />} />
                  <Route path="/admin" element={<Admin />} />
                </Routes>
              </div>
            </div>
          </div>
          <Toaster position="bottom-right" toastOptions={{ style: { background: 'var(--bg-card2)', color: 'var(--text-primary)', border: '1px solid var(--border-hi)', fontSize: 13 } }} />
        </BrowserRouter>
      </CartProvider>
    </ThemeProvider>
  );
}
