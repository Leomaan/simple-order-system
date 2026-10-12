import React, { useState } from 'react';
import { useCompany } from '../hooks/useCompany';
import CreateCompanyModal from '../components/superadmin/CreateCompanyModal';
import CompanyTable from '../components/superadmin/CompanyTable';
import { ShieldCheck, Plus, Search } from 'lucide-react';

export default function SuperAdmin() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm tracking-wide uppercase">
              <ShieldCheck className="w-5 h-5" />
              Painel Master Superadmin
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1">Gestão de Empresas & Tenants</h1>
            <p className="text-neutral-400 text-sm mt-0.5">
              Cadastre estabelecimentos parceiros e configure acessos fechados com isolamento de dados.
            </p>
          </div>

          <button
            onClick={() => {
              setErrorMsg('');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-medium rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nova Empresa
          </button>
        </div>

        {/* Busca e Estatísticas */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome ou slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-4 text-sm text-neutral-400">
            <span>Total: <strong className="text-white">{companies.length}</strong></span>
            <span>Ativas: <strong className="text-emerald-400">{companies.filter(c => c.active).length}</strong></span>
          </div>
        </div>

        {/* Lista de Empresas */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="p-12 text-center text-neutral-400">Carregando estabelecimentos...</div>
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
