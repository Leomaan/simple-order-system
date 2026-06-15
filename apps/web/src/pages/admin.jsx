import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/sidebar';
import ProductsSection from '../components/product/productSection';
import OrdersSection from '../components/order/orderSection';
import UsersSection from '../components/user/userSection';
import ReportsSection from '../components/report/reportSection';
import LogsSection from '../components/log/logSection';

const sections = {
  products: ProductsSection,
  orders: OrdersSection,
  users: UsersSection,
  reports: ReportsSection,
  logs: LogsSection,
};

export default function Admin() {
  const { user } = useAuth();
  const [active, setActive] = useState('products');
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