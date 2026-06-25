import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import ProductView from '../components/product/ProductView';
import WaiterOrderSection from '../components/order/WaiterOrderSection';

const sections = {
  products: ProductView,
  orders: WaiterOrderSection,
};

export default function Waiter() {
  const { user } = useAuth();
  const [active, setActive] = useState('orders');
  const Section = sections[active];

  return (
    <div className="min-h-screen bg-neutral-950 flex font-sans antialiased text-neutral-200">
      <Sidebar active={active} onNavigate={setActive} role={user?.role} />
      <main className="flex-1 overflow-y-auto">
        <Section />
      </main>
    </div>
  );
}