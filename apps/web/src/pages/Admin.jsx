import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import ProductSection from '../components/product/ProductSection';
import OrderSection from '../components/order/OrderSection';
import UserSection from '../components/user/UserSection';
import ReportSection from '../components/report/ReportSection';
import LogSection from '../components/log/LogSection';
import TrashSection from '../components/trash/TrashSection';
import SettingsSection from '../components/settings/SettingsSection';

const sections = {
  products: ProductSection,
  orders: OrderSection,
  users: UserSection,
  reports: ReportSection,
  logs: LogSection,
  trash: TrashSection,
  settings: SettingsSection,
};

export default function Admin() {
  const { user } = useAuth();
  const [active, setActive] = useState('products');
  const Section = sections[active];

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col md:flex-row font-sans antialiased text-neutral-200">
      <Sidebar active={active} onNavigate={setActive} role={user?.role} />
      <main className="flex-1 overflow-y-auto">
        <Section />
      </main>
    </div>
  );
}