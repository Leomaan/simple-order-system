import React from 'react';
import { Building2, ExternalLink, CheckCircle2, XCircle, UserCheck } from 'lucide-react';

export default function CompanyTable({ companies, onImpersonate, onToggleStatus }) {
  if (companies.length === 0) {
    return (
      <div className="p-12 text-center text-neutral-500 dark:text-neutral-400 text-sm">
        Nenhum estabelecimento cadastrado até o momento.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-neutral-50 dark:bg-neutral-950/60 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
          <tr>
            <th className="py-3.5 px-5 font-semibold">Estabelecimento</th>
            <th className="py-3.5 px-5 font-semibold">Dono / Administrador</th>
            <th className="py-3.5 px-5 font-semibold">Cardápio Público</th>
            <th className="py-3.5 px-5 font-semibold">Estações KDS</th>
            <th className="py-3.5 px-5 font-semibold">Status</th>
            <th className="py-3.5 px-5 font-semibold text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {companies.map((company) => {
            const owner = company.Users?.find(u => u.role === 'ADMIN') || company.Users?.[0];

            return (
              <tr key={company.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-850/40 transition">
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-750 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-300 shrink-0">
                      <Building2 className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-neutral-900 dark:text-white truncate">{company.name}</div>
                      <div className="text-neutral-500 dark:text-neutral-400 text-[11px] truncate">
                        CNPJ: {company.cnpj || 'Não informado'}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-5">
                  {owner ? (
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-neutral-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-neutral-800 dark:text-neutral-200 text-xs truncate">
                          {owner.name}
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                          {owner.email}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-neutral-400 text-xs italic">Sem admin vinculado</span>
                  )}
                </td>

                <td className="py-3.5 px-5">
                  <a
                    href={`/cardapio/${company.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700"
                  >
                    <span>/{company.slug}</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </a>
                </td>

                <td className="py-3.5 px-5">
                  <div className="flex flex-wrap gap-1">
                    {company.ProductionStations?.map((st) => (
                      <span
                        key={st.id}
                        className="px-2 py-0.5 rounded text-[11px] text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                      >
                        {st.name}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="py-3.5 px-5">
                  {company.active ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ativa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                      <XCircle className="w-3.5 h-3.5" /> Suspensa
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onImpersonate(company.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 transition shadow-sm cursor-pointer"
                      title="Entrar no painel da empresa em modo suporte"
                    >
                      Acessar Loja
                    </button>
                    <button
                      onClick={() => onToggleStatus(company.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border transition cursor-pointer ${
                        company.active
                          ? 'border-neutral-200 dark:border-neutral-700 hover:border-red-500/30 hover:bg-red-500/5 text-neutral-600 dark:text-neutral-400 hover:text-red-500'
                          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {company.active ? 'Suspender' : 'Reativar'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
