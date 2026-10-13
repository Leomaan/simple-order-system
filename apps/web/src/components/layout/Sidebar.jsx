import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingBag, 
  UtensilsCrossed, 
  Users, 
  BarChart3, 
  History, 
  LogOut, 
  User,
  Trash2,
  Settings as SettingsIcon,
  ChefHat,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const baseAdminNavItems = [
  { label: 'Cardápio / Produtos', key: 'products', icon: UtensilsCrossed },
  { label: 'Pedidos das Mesas', key: 'orders', icon: ShoppingBag },
  { label: 'Cozinha (KDS)', key: 'kds_link', icon: ChefHat, isExternalRoute: '/kds' },
  { label: 'Usuários da Equipe', key: 'users', icon: Users },
  { label: 'Relatórios de Vendas', key: 'reports', icon: BarChart3 },
  { label: 'Auditoria & Logs', key: 'logs', icon: History },
  { label: 'Lixeira', key: 'trash', icon: Trash2 },
  { label: 'Configurações', key: 'settings', icon: SettingsIcon },
];

const waiterNavItems = [
  { label: 'Cardápio', key: 'products', icon: UtensilsCrossed },
  { label: 'Mesas & Pedidos', key: 'orders', icon: ShoppingBag },
  { label: 'Cozinha (KDS)', key: 'kds_link', icon: ChefHat, isExternalRoute: '/kds' },
];

export default function Sidebar({ active, onNavigate, role }) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Se o usuário for SuperAdmin, adiciona o link direto para o Painel SuperAdmin
  const navItems = role === 'ADMIN'
    ? (user?.isSuperAdmin 
        ? [{ label: 'Painel Master Superadmin', key: 'superadmin_link', icon: ShieldCheck, isExternalRoute: '/superadmin' }, ...baseAdminNavItems]
        : baseAdminNavItems)
    : waiterNavItems;

  const panelLabel = user?.isSuperAdmin
    ? 'Plataforma Master'
    : role === 'ADMIN'
    ? 'Gestão do Restaurante'
    : 'Painel de Atendimento';

  const roleLabel = user?.isSuperAdmin
    ? 'Superadmin (Master)'
    : role === 'ADMIN'
    ? 'Dono / Administrador'
    : 'Garçom';

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden w-full h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-black text-base shadow-sm">
            S
          </div>
          <div>
            <h1 className="text-neutral-900 dark:text-white font-bold text-sm tracking-tight">Simple Order</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-[9px] uppercase font-semibold tracking-wider">{panelLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-750 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all cursor-pointer active:scale-95"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar aside */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between shrink-0 select-none transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col flex-1">
          {/* Brand / Logo */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-black text-lg shadow-sm">
              S
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-neutral-900 dark:text-white font-bold text-sm tracking-tight truncate">Simple Order</h1>
              <p className="text-neutral-500 dark:text-neutral-400 text-[10px] uppercase font-semibold mt-0.5 tracking-wider truncate">
                {panelLabel}
              </p>
            </div>
            {/* Close button inside aside on mobile */}
            <button 
              onClick={() => setIsOpen(false)} 
              className="md:hidden ml-auto p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
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
                  onClick={() => {
                    if (item.isExternalRoute) {
                      window.location.href = item.isExternalRoute;
                      return;
                    }
                    onNavigate(item.key);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer active:scale-98 text-left ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm'
                      : isSuperAdminHighlight
                      ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700/80 hover:bg-neutral-200/80 dark:hover:bg-neutral-750 font-bold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white dark:text-neutral-900' : 'text-neutral-500 dark:text-neutral-400'} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile & logout */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-3 bg-neutral-50/50 dark:bg-neutral-950/20">
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8.5 h-8.5 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-750 shrink-0">
                <User size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-neutral-900 dark:text-white text-xs font-semibold truncate leading-none">
                  {user?.name || 'Usuário'}
                </p>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium uppercase mt-1 block tracking-wider truncate">
                  {roleLabel}
                </span>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-red-500/40 hover:bg-red-500/5 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer active:scale-98"
          >
            <LogOut size={14} />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>
    </>
  );
}