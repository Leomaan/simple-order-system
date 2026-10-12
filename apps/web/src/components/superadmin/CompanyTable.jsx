import React from 'react';
import { Building2, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';

export default function CompanyTable({ companies, onImpersonate, onToggleStatus }) {
  if (companies.length === 0) {
    return <div className="p-12 text-center text-neutral-500">Nenhuma empresa encontrada.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-950/50 text-neutral-400 border-b border-neutral-800">
          <tr>
            <th className="py-4 px-6 font-semibold">Empresa</th>
            <th className="py-4 px-6 font-semibold">Cardápio Público</th>
            <th className="py-4 px-6 font-semibold">Estações KDS</th>
            <th className="py-4 px-6 font-semibold">Status</th>
            <th className="py-4 px-6 font-semibold text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {companies.map((company) => (
            <tr key={company.id} className="hover:bg-neutral-800/40 transition">
              <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center font-bold text-neutral-300">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{company.name}</div>
                    <div className="text-neutral-400 text-xs">CNPJ: {company.cnpj || 'Não informado'}</div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6">
                <a
                  href={`/cardapio/${company.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg"
                >
                  /cardapio/{company.slug}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </td>
              <td className="py-4 px-6">
                <div className="flex flex-wrap gap-1.5">
                  {company.ProductionStations?.map((st) => (
                    <span
                      key={st.id}
                      className="px-2 py-0.5 rounded text-xs text-neutral-300 bg-neutral-800 border border-neutral-700"
                    >
                      {st.name}
                    </span>
                  ))}
                </div>
              </td>
              <td className="py-4 px-6">
                {company.active ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ativa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                    <XCircle className="w-3.5 h-3.5" /> Suspensa
                  </span>
                )}
              </td>
              <td className="py-4 px-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onImpersonate(company.id)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition"
                    title="Entrar no painel da empresa como Administrador"
                  >
                    Acessar Painel
                  </button>
                  <button
                    onClick={() => onToggleStatus(company.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                      company.active
                        ? 'bg-neutral-800 hover:bg-red-500/10 text-neutral-400 hover:text-red-400'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {company.active ? 'Suspender' : 'Reativar'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
