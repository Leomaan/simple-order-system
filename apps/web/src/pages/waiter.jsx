import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/sidebar';
import ProductsView from '../components/product/productView';
import WaiterOrdersSection from '../components/order/waiterOrderSection';

const sections = {
  products: ProductsView,
  orders: WaiterOrdersSection,
};

export default function Waiter() {
  const { user } = useAuth();
  const [active, setActive] = useState('orders');
  const Section = sections[active];

  return (
    <div className="min-h-screen bg-neutral-950 flex">
      <Sidebar active={active} onNavigate={setActive} role={user?.role} />
      <main className="flex-1 overflow-y-auto">
        <Section />
      </main>
    </div>
  );
}