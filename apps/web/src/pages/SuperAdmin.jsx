import React, { useState } from 'react';
import { useCompany } from '../hooks/useCompany';
import { useAuth } from '../context/AuthContext';
import CreateCompanyModal from '../components/superadmin/CreateCompanyModal';
import CompanyTable from '../components/superadmin/CompanyTable';
import ConfirmModal from '../components/ui/ConfirmModal';
import ThemeToggle from '../components/ui/ThemeToggle';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { ShieldCheck, Plus, Search, LogOut } from 'lucide-react';

export default function SuperAdmin() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState(null);
  const { logout } = useAuth();

  const {
    companies,
    isLoading,
    errorMsg,
    setErrorMsg,
    createCompany,
    isCreating,
    toggleStatus,
    deleteCompany,
    isDeleting,
    impersonate,
  } = useCompany();

  const handleCreateCompany = (payload) => {
    createCompany(payload, {
      onSuccess: () => setIsModalOpen(false),
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingCompany) return;
    deleteCompany(deletingCompany.id, {
      onSuccess: () => setDeletingCompany(null),
      onError: (err) => {
        alert(err.response?.data?.message || 'Erro ao excluir empresa');
        setDeletingCompany(null);
      },
    });
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f7f4ee] dark:bg-[#121215] text-[#1c1917] dark:text-[#ececf0] p-6 sm:p-10 font-sans transition-colors">
      {deletingCompany && (
        <ConfirmModal
          title={`Excluir "${deletingCompany.name}"?`}
          message={`Esta ação é permanente e removerá o estabelecimento "${deletingCompany.name}", seus produtos, pedidos, categorias e usuários vinculados. Deseja realmente excluir?`}
          confirmLabel="Excluir Empresa"
          confirmVariant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingCompany(null)}
          loading={isDeleting}
        />
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e4ded4] dark:border-[#2e2e38]">
          <div>
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 font-semibold text-xs tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              Painel Master Superadmin • Gestão SaaS
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-[#1c1917] dark:text-white">
              Estabelecimentos & Donos de Restaurantes
            </h1>
            <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Como Superadmin, você cadastra as empresas clientes e define as credenciais de acesso do dono de cada restaurante. O dono gerencia o cardápio e os pedidos da sua respectiva empresa.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Button
              onClick={() => {
                setErrorMsg('');
                setIsModalOpen(true);
              }}
              variant="primary"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Empresa</span>
            </Button>

            <button
              onClick={logout}
              title="Sair da conta"
              type="button"
              className="flex items-center gap-1.5 px-3 py-2.5 border border-[#d8d2c4] dark:border-[#3e3e4a] hover:border-red-500/40 text-stone-600 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Busca e Estatísticas */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="w-full sm:w-96">
            <Input
              icon={Search}
              placeholder="Buscar estabelecimento por nome ou slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              filter="text"
            />
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium">
            <span className="px-3.5 py-1.5 bg-white dark:bg-[#1a1a20] border border-[#e4ded4] dark:border-[#2e2e38] rounded-xl shadow-xs">
              Total: <strong className="text-[#1c1917] dark:text-white">{companies.length}</strong>
            </span>
            <span className="px-3.5 py-1.5 bg-white dark:bg-[#1a1a20] border border-[#e4ded4] dark:border-[#2e2e38] rounded-xl shadow-xs">
              Ativas: <strong className="text-emerald-600 dark:text-emerald-400">{companies.filter(c => c.active).length}</strong>
            </span>
          </div>
        </div>

        {/* Lista de Empresas */}
        <div className="bg-white dark:bg-[#1a1a20] border border-[#e4ded4] dark:border-[#2e2e38] rounded-2xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="p-12 text-center text-stone-500 dark:text-stone-400 text-sm">
              Carregando estabelecimentos...
            </div>
          ) : (
            <CompanyTable
              companies={filteredCompanies}
              onImpersonate={impersonate}
              onToggleStatus={toggleStatus}
              onDelete={setDeletingCompany}
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
