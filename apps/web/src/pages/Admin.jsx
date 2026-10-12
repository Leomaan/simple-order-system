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
    <div className="min-h-screen bg-neutral-950 flex flex-col font-sans antialiased text-neutral-200">
      {user?.isSuperAdmin && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>
              Você está acessando este estabelecimento em <strong>Modo Suporte Superadmin</strong>.
            </span>
          </div>
          <button
            onClick={() => {
              window.location.href = '/superadmin';
            }}
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold rounded-lg transition"
          >
            ← Voltar ao Superadmin
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar active={active} onNavigate={setActive} role={user?.role} />
        <main className="flex-1 overflow-y-auto">
          <Section />
        </main>
      </div>
    </div>
  );
}