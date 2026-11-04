import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../hooks/useCompany';
import ThemeToggle from '../ui/ThemeToggle';
import { 
  ClipboardList, 
  ChefHat,
  Utensils,
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
  Building2
} from 'lucide-react';

export default function Sidebar({ active, onNavigate, role }) {
  const { logout, user } = useAuth();
  const { exitImpersonate } = useCompany();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Busca detalhes da empresa ativa caso necessário
  const effectiveCompanyId = user?.companyId || (typeof window !== 'undefined' ? localStorage.getItem('companyId') : null);
  const { data: companyData } = useQuery({
    queryKey: ['active-company-info', { companyId: effectiveCompanyId }],
    queryFn: async () => {
      const res = await api.get('/company/current').catch(() => ({ data: { data: null } }));
      return res.data?.data || null;
    },
    enabled: !!effectiveCompanyId,
    staleTime: 5 * 60 * 1000,
  });

  // Identificação da Empresa
  const companyName = 
    companyData?.name || 
    user?.company?.name || 
    user?.companyName || 
    (typeof window !== 'undefined' ? localStorage.getItem('companyName') : null) || 
    (user?.isSuperAdmin && !effectiveCompanyId ? 'Administração Global' : 'Empresa');
  
  const companyLogo = companyData?.logoUrl || user?.company?.logoUrl;
  const companyInitial = companyName.trim().charAt(0).toUpperCase() || 'E';

  // Identificação do Funcionário e Função
  const rawName = user?.name || 'Funcionário';
  const employeeName = rawName.replace(/\s*\(Suporte:.*\)$/, '');
  const employeeInitial = employeeName.trim().charAt(0).toUpperCase() || 'F';

  const roleLabel = (() => {
    if (user?.isSuperAdmin && !user?.impersonating) return 'Superadministrador';
    if (user?.impersonating) return 'Administrador (Suporte)';
    if (role === 'ADMIN') return 'Administrador';
    return 'Garçom';
  })();

  // Admin items - Nomes diretos, objetivos e sem '&'
  const adminItems = [
    { key: 'orders', label: 'Pedidos', icon: ClipboardList },
    { key: 'kds_link', label: 'Distribuição', icon: ChefHat, isExternalRoute: '/kds' },
    { key: 'products', label: 'Gerenciar menu', icon: Utensils },
    { key: 'users', label: 'Funcionários', icon: Users },
    { key: 'reports', label: 'Relatórios', icon: BarChart3 },
    { key: 'logs', label: 'Histórico', icon: FileText },
    { key: 'trash', label: 'Lixeira', icon: Trash2 },
    { key: 'settings', label: 'Configurações', icon: Settings },
  ];

  // Superadmin item if user is superadmin
  if (user?.isSuperAdmin) {
    adminItems.unshift({
      key: 'superadmin_link',
      label: 'Superadmin',
      icon: ShieldCheck,
      isExternalRoute: '/superadmin'
    });
  }

  // Waiter items - Nomes diretos e objetivos
  const waiterItems = [
    { key: 'orders', label: 'Pedidos', icon: ClipboardList },
    { key: 'kds_link', label: 'Distribuição', icon: ChefHat, isExternalRoute: '/kds' },
    { key: 'products', label: 'Consultar menu', icon: Utensils },
  ];

  const navItems = role === 'ADMIN' ? adminItems : waiterItems;

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#1a1a20] border-b border-[#e4ded4] dark:border-[#2e2e38] sticky top-0 z-40 transition-colors">
        <div className="flex items-center gap-2.5 min-w-0">
          {companyLogo ? (
            <img 
              src={companyLogo} 
              alt={companyName}
              className="w-8 h-8 rounded-xl object-cover border border-[#e4ded4] dark:border-[#2e2e38] shrink-0" 
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-black text-xs shadow-sm shadow-orange-500/20 shrink-0">
              {companyInitial}
            </div>
          )}
          <div className="min-w-0">
            <span className="text-[#1c1917] dark:text-white font-bold text-sm tracking-tight block truncate">
              {companyName}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="w-10 h-10 rounded-xl bg-[#ede8df] dark:bg-[#26262e] border border-[#d8d2c4] dark:border-[#3e3e4a] flex items-center justify-center text-stone-700 dark:text-stone-300 hover:text-[#1c1917] dark:hover:text-white transition cursor-pointer active:scale-95"
            aria-label="Abrir menu"
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
          {/* Identificação da Empresa na parte superior */}
          <div className="p-5 border-b border-[#e4ded4] dark:border-[#2e2e38] flex items-center gap-3">
            {companyLogo ? (
              <img 
                src={companyLogo} 
                alt={companyName}
                className="w-10 h-10 rounded-xl object-cover shadow-xs border border-[#e4ded4] dark:border-[#2e2e38] shrink-0" 
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-black text-base shadow-sm shadow-orange-500/20 shrink-0">
                {companyInitial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Building2 size={13} className="text-orange-500 shrink-0" />
                <h1 className="text-[#1c1917] dark:text-white font-bold text-sm tracking-tight truncate" title={companyName}>
                  {companyName}
                </h1>
              </div>
              <p className="text-stone-500 dark:text-stone-400 text-[10px] font-semibold tracking-wider uppercase mt-0.5 truncate">
                {user?.impersonating ? 'Modo Suporte' : 'Painel Operacional'}
              </p>
            </div>
            {/* Botão Fechar no Mobile */}
            <button 
              onClick={() => setIsOpen(false)} 
              type="button"
              className="md:hidden ml-auto p-1.5 text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-[#26262e] rounded-lg cursor-pointer"
              aria-label="Fechar menu"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navegação de Seções Otimizadas */}
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

        {/* Perfil do Funcionário com Nome e Função */}
        <div className="p-4 border-t border-[#e4ded4] dark:border-[#2e2e38] flex flex-col gap-3 bg-[#fcfbf9]/80 dark:bg-[#15151a]">
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs border border-orange-500/25 shrink-0">
                {employeeInitial}
              </div>
              <div className="min-w-0">
                <p className="text-[#1c1917] dark:text-white text-xs font-bold truncate leading-tight" title={employeeName}>
                  {employeeName}
                </p>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium block truncate mt-0.5">
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
