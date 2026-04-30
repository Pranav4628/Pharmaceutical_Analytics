import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartCtx = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const add = useCallback((med, pharmacy = null) => {
    setItems(prev => {
      const key = `${med.Medicine_Name||med.name}-${pharmacy?.id||''}`;
      const ex  = prev.find(i => i._key === key);
      if (ex) return prev.map(i => i._key === key ? {...i, qty: i.qty+1} : i);
      return [...prev, { _key:key, name:med.Medicine_Name||med.name, price:Math.round((med.avg_revenue||25000)/100), category:med.Medicine_Category||med.category||'', qty:1, pharmacy:pharmacy?.name||'Any Pharmacy', pharmacy_id:pharmacy?.id||'p1' }];
    });
    toast.success(`${med.Medicine_Name||med.name} added to cart`, { duration:1800 });
  }, []);

  const remove = useCallback((key) => setItems(prev => prev.filter(i => i._key !== key)), []);
  const update = useCallback((key, qty) => {
    if (qty < 1) return;
    setItems(prev => prev.map(i => i._key === key ? {...i, qty} : i));
  }, []);
  const clear  = useCallback(() => setItems([]), []);
  const total  = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count  = items.reduce((s, i) => s + i.qty, 0);

  return <CartCtx.Provider value={{items,add,remove,update,clear,total,count}}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);
