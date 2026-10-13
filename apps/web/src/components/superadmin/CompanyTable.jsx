import React from 'react';
import { Building2, ExternalLink, CheckCircle2, XCircle, UserCheck } from 'lucide-react';

export default function CompanyTable({ companies, onImpersonate, onToggleStatus }) {
  if (companies.length === 0) {
    return (
      <div className="p-12 text-center text-stone-500 dark:text-stone-400 text-sm">
        Nenhum estabelecimento cadastrado até o momento.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-[#f5f2ea] dark:bg-[#202026] text-stone-600 dark:text-stone-400 border-b border-[#e4ded4] dark:border-[#2e2e38]">
          <tr>
            <th className="py-3.5 px-5 font-semibold">Estabelecimento</th>
            <th className="py-3.5 px-5 font-semibold">Dono / Administrador</th>
            <th className="py-3.5 px-5 font-semibold">Cardápio Público</th>
            <th className="py-3.5 px-5 font-semibold">Estações KDS</th>
            <th className="py-3.5 px-5 font-semibold">Status</th>
            <th className="py-3.5 px-5 font-semibold text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e4ded4] dark:divide-[#2e2e38]">
          {companies.map((company) => {
            const owner = company.Users?.find(u => u.role === 'ADMIN') || company.Users?.[0];

            return (
              <tr key={company.id} className="hover:bg-[#f7f4ee]/70 dark:hover:bg-[#202028] transition">
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center font-bold text-orange-500 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[#1c1917] dark:text-white truncate">{company.name}</div>
                      <div className="text-stone-500 dark:text-stone-400 text-[11px] truncate">
                        CNPJ: {company.cnpj || 'Não informado'}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-5">
                  {owner ? (
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-orange-500/80 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-stone-800 dark:text-stone-200 text-xs truncate">
                          {owner.name}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                          {owner.email}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-stone-400 text-xs italic">Sem admin vinculado</span>
                  )}
                </td>

                <td className="py-3.5 px-5">
                  <a
                    href={`/cardapio/${company.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-stone-700 dark:text-stone-300 hover:text-[#1c1917] dark:hover:text-white bg-[#ede8df] hover:bg-[#e4ded3] dark:bg-[#26262e] dark:hover:bg-[#30303a] px-2.5 py-1 rounded-lg border border-[#d8d2c4] dark:border-[#3e3e4a] transition"
                  >
                    <span>/{company.slug}</span>
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                  </a>
                </td>

                <td className="py-3.5 px-5">
                  <div className="flex flex-wrap gap-1">
                    {company.ProductionStations?.map((st) => (
                      <span
                        key={st.id}
                        className="px-2 py-0.5 rounded text-[11px] text-stone-700 dark:text-stone-300 bg-[#ede8df] dark:bg-[#26262e] border border-[#d8d2c4] dark:border-[#3e3e4a]"
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
                      type="button"
                      onClick={() => onImpersonate(company.id)}
                      className="text-xs px-3.5 py-1.5 rounded-xl font-semibold bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white transition shadow-xs cursor-pointer active:scale-95"
                      title="Entrar no painel da empresa em modo suporte"
                    >
                      Acessar Loja
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(company.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl font-medium border transition cursor-pointer active:scale-95 ${
                        company.active
                          ? 'border-[#d8d2c4] dark:border-[#3e3e4a] hover:border-red-500/40 hover:bg-red-500/5 text-stone-600 dark:text-stone-400 hover:text-red-500'
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
