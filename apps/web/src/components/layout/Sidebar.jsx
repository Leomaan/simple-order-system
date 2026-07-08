import React from 'react';
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
  Settings as SettingsIcon
} from 'lucide-react';

const adminNavItems = [
  { label: 'Produtos', key: 'products', icon: UtensilsCrossed },
  { label: 'Pedidos', key: 'orders', icon: ShoppingBag },
  { label: 'Usuários', key: 'users', icon: Users },
  { label: 'Relatórios', key: 'reports', icon: BarChart3 },
  { label: 'Auditoria', key: 'logs', icon: History },
  { label: 'Lixeira', key: 'trash', icon: Trash2 },
  { label: 'Configurações', key: 'settings', icon: SettingsIcon },
];

const waiterNavItems = [
  { label: 'Cardápio', key: 'products', icon: UtensilsCrossed },
  { label: 'Mesas', key: 'orders', icon: ShoppingBag },
];

export default function Sidebar({ active, onNavigate, role }) {
  const { user, logout } = useAuth();
  const navItems = role === 'ADMIN' ? adminNavItems : waiterNavItems;
  const panelLabel = role === 'ADMIN' ? 'Painel Administrativo' : 'Painel de Atendimento';

  return (
    <aside className="w-64 min-h-screen bg-neutral-900 border-r border-neutral-800 flex flex-col justify-between shrink-0 select-none">
      <div className="flex flex-col flex-1">
        {/* Brand / Logo */}
        <div className="p-6 border-b border-neutral-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-orange-500/10">
            S
          </div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-tight">Simple Order</h1>
            <p className="text-neutral-500 text-[10px] uppercase font-semibold mt-0.5 tracking-wider">{panelLabel}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 flex flex-col gap-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer active:scale-98 ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/15'
                    : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile & logout */}
      <div className="p-4 border-t border-neutral-800 flex flex-col gap-3 bg-neutral-950/20">
        <div className="flex items-center gap-3 px-2.5 py-1.5">
          <div className="w-8.5 h-8.5 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 border border-neutral-750">
            <User size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate leading-none">{user?.name || 'Funcionário'}</p>
            <span className="text-[10px] text-neutral-550 font-bold uppercase mt-1 block tracking-wider">
              {role === 'ADMIN' ? 'Administrador' : 'Garçom'}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-neutral-800 hover:border-red-500/35 hover:bg-red-500/5 text-neutral-400 hover:text-red-400 text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer active:scale-98"
        >
          <LogOut size={14} />
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
}