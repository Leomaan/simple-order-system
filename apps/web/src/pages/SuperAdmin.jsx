import React, { useState } from 'react';
import { useCompany } from '../hooks/useCompany';
import { useAuth } from '../context/AuthContext';
import CreateCompanyModal from '../components/superadmin/CreateCompanyModal';
import CompanyTable from '../components/superadmin/CompanyTable';
import ThemeToggle from '../components/ui/ThemeToggle';
import { ShieldCheck, Plus, Search, LogOut } from 'lucide-react';

export default function SuperAdmin() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logout } = useAuth();

  const {
    companies,
    isLoading,
    errorMsg,
    setErrorMsg,
    createCompany,
    isCreating,
    toggleStatus,
    impersonate,
  } = useCompany();

  const handleCreateCompany = (payload) => {
    createCompany(payload, {
      onSuccess: () => setIsModalOpen(false),
    });
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-6 sm:p-10 font-sans transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 font-semibold text-xs tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4 text-neutral-900 dark:text-neutral-100" />
              Painel Master Superadmin • Gestão SaaS
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-neutral-900 dark:text-white">
              Estabelecimentos & Donos de Restaurantes
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Como Superadmin, você cadastra as empresas clientes e define as credenciais de acesso do dono de cada restaurante. O dono gerencia o cardápio e os pedidos da sua respectiva empresa.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={() => {
                setErrorMsg('');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 font-semibold rounded-xl text-xs sm:text-sm transition shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nova Empresa
            </button>

            <button
              onClick={logout}
              title="Sair da conta"
              className="flex items-center gap-1.5 px-3 py-2.5 border border-neutral-200 dark:border-neutral-800 hover:border-red-500/40 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Busca e Estatísticas */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar estabelecimento por nome ou slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-medium">
            <span className="px-3 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
              Total: <strong className="text-neutral-900 dark:text-white">{companies.length}</strong>
            </span>
            <span className="px-3 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
              Ativas: <strong className="text-emerald-600 dark:text-emerald-400">{companies.filter(c => c.active).length}</strong>
            </span>
          </div>
        </div>

        {/* Lista de Empresas */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-12 text-center text-neutral-500 dark:text-neutral-400 text-sm">
              Carregando estabelecimentos...
            </div>
          ) : (
            <CompanyTable
              companies={filteredCompanies}
              onImpersonate={impersonate}
              onToggleStatus={toggleStatus}
            />
          )}
        </div>

        {/* Modal de Criação */}
        <CreateCompanyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateCompany}
          isSubmitting={isCreating}
          errorMsg={errorMsg}
        />

      </div>
    </div>
  );
}
