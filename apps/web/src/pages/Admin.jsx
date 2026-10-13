import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../hooks/useCompany';
import Sidebar from '../components/layout/Sidebar';
import ProductSection from '../components/product/ProductSection';
import OrderSection from '../components/order/OrderSection';
import UserSection from '../components/user/UserSection';
import ReportSection from '../components/report/ReportSection';
import LogSection from '../components/log/LogSection';
import TrashSection from '../components/trash/TrashSection';
import SettingsSection from '../components/settings/SettingsSection';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

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
  const { exitImpersonate } = useCompany();
  const [active, setActive] = useState('products');
  const Section = sections[active];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col font-sans antialiased text-neutral-900 dark:text-neutral-100">
      {user?.isSuperAdmin && (
        <div className="bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 py-2.5 flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <ShieldCheck className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <span>
              Você está visualizando a loja em <strong>Modo Suporte Superadmin</strong>.
            </span>
          </div>
          <button
            onClick={exitImpersonate}
            className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 font-semibold rounded-lg transition active:scale-95 cursor-pointer shadow-sm text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Superadmin</span>
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