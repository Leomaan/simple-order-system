import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../hooks/useCompany';
import ThemeToggle from '../ui/ThemeToggle';
import { 
  Package, 
  ClipboardList, 
  Users, 
  BarChart3, 
  FileText, 
  Trash2, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  ShieldCheck,
  Tv
} from 'lucide-react';

export default function Sidebar({ active, onNavigate, role }) {
  const { logout, user } = useAuth();
  const { exitImpersonate } = useCompany();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Admin items
  const adminItems = [
    { key: 'products', label: 'Produtos', icon: Package },
    { key: 'orders', label: 'Mesas & Pedidos', icon: ClipboardList },
    { key: 'kds_link', label: 'Cozinha KDS', icon: Tv, isExternalRoute: '/kds' },
    { key: 'users', label: 'Usuários', icon: Users },
    { key: 'reports', label: 'Relatórios', icon: BarChart3 },
    { key: 'logs', label: 'Logs de Auditoria', icon: FileText },
    { key: 'trash', label: 'Lixeira', icon: Trash2 },
    { key: 'settings', label: 'Configurações', icon: Settings },
  ];

  // Superadmin item if user is superadmin
  if (user?.isSuperAdmin) {
    adminItems.unshift({
      key: 'superadmin_link',
      label: 'Painel Superadmin',
      icon: ShieldCheck,
      isExternalRoute: '/superadmin'
    });
  }

  // Waiter items
  const waiterItems = [
    { key: 'orders', label: 'Mesas & Comandas', icon: ClipboardList },
    { key: 'kds_link', label: 'Cozinha KDS', icon: Tv, isExternalRoute: '/kds' },
    { key: 'products', label: 'Consultar Cardápio', icon: Package },
  ];

  const navItems = role === 'ADMIN' ? adminItems : waiterItems;
  const roleLabel = role === 'ADMIN' ? 'Administrador' : 'Garçom';
  const panelLabel = role === 'ADMIN' ? 'Painel do Restaurante' : 'Terminal do Garçom';

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#1a1a20] border-b border-[#e4ded4] dark:border-[#2e2e38] sticky top-0 z-40 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-orange-500/20">
            S
          </div>
          <span className="text-[#1c1917] dark:text-white font-bold text-sm tracking-tight">Simple Order</span>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="w-10 h-10 rounded-xl bg-[#ede8df] dark:bg-[#26262e] border border-[#d8d2c4] dark:border-[#3e3e4a] flex items-center justify-center text-stone-700 dark:text-stone-300 hover:text-[#1c1917] dark:hover:text-white transition cursor-pointer active:scale-95"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar aside */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#1a1a20] border-r border-[#e4ded4] dark:border-[#2e2e38] flex flex-col justify-between shrink-0 select-none transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col flex-1">
          {/* Brand / Logo */}
          <div className="p-6 border-b border-[#e4ded4] dark:border-[#2e2e38] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-orange-500/20">
              S
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[#1c1917] dark:text-white font-bold text-sm tracking-tight truncate">Simple Order</h1>
              <p className="text-stone-500 dark:text-stone-400 text-[10px] uppercase font-semibold mt-0.5 tracking-wider truncate">
                {panelLabel}
              </p>
            </div>
            {/* Close button inside aside on mobile */}
            <button 
              onClick={() => setIsOpen(false)} 
              type="button"
              className="md:hidden ml-auto p-1.5 text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-[#26262e] rounded-lg"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 flex flex-col gap-1 mt-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;
              const isSuperAdminHighlight = item.key === 'superadmin_link';

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    if (item.key === 'superadmin_link') {
                      exitImpersonate();
                      return;
                    }
                    if (item.key === 'kds_link') {
                      navigate('/kds');
                      setIsOpen(false);
                      return;
                    }
                    if (item.isExternalRoute) {
                      window.location.href = item.isExternalRoute;
                      return;
                    }
                    onNavigate(item.key);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer active:scale-98 text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-sm shadow-orange-500/20'
                      : isSuperAdminHighlight
                      ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 font-bold'
                      : 'text-stone-600 hover:text-[#1c1917] hover:bg-stone-200/50 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-[#26262e]'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-stone-500 dark:text-stone-400'} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile & logout */}
        <div className="p-4 border-t border-[#e4ded4] dark:border-[#2e2e38] flex flex-col gap-3 bg-[#fcfbf9]/80 dark:bg-[#15151a]">
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8.5 h-8.5 rounded-full bg-[#ede8df] dark:bg-[#26262e] flex items-center justify-center text-stone-700 dark:text-stone-300 border border-[#d8d2c4] dark:border-[#3e3e4a] shrink-0">
                <User size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[#1c1917] dark:text-white text-xs font-semibold truncate leading-none">
                  {user?.name || 'Usuário'}
                </p>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium uppercase mt-1 block tracking-wider truncate">
                  {roleLabel}
                </span>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <button
            onClick={logout}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-[#d8d2c4] dark:border-[#3e3e4a] hover:border-red-500/40 hover:bg-red-500/5 text-stone-600 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold tracking-wider uppercase transition cursor-pointer active:scale-98"
          >
            <LogOut size={14} />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>
    </>
  );
}