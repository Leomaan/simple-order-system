import React from 'react';
import { useProducts } from '../../hooks/useProduct';
import CategoryFilter from '../ui/CategoryFilter';
import Button from '../ui/Button';
import { Utensils, Beer, Popcorn, CakeSlice, Soup, Search, X } from 'lucide-react';

const CATEGORIES = ['FOOD', 'DRINK', 'SNACK', 'DESSERT', 'SIDE'];

const categoryLabel = {
  FOOD: 'Prato',
  DRINK: 'Bebida',
  SNACK: 'Petisco',
  DESSERT: 'Sobremesa',
  SIDE: 'Acompanhamento',
};

const categoryIcon = {
  FOOD: Utensils,
  DRINK: Beer,
  SNACK: Popcorn,
  DESSERT: CakeSlice,
  SIDE: Soup,
};

export default function ProductView() {
  const {
    products,
    loading,
    totalPages,
    currentPage,
    setPage,
    category: filterCategory,
    search: searchQuery,
    setCategory,
    setSearch,
  } = useProducts('');

  const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Cardápio</h2>
        <p className="text-neutral-550 text-sm font-medium">Visualize os itens disponíveis no restaurante</p>
      </header>

      {/* Filtros de categoria & Busca */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <CategoryFilter
          categories={CATEGORIES}
          selected={filterCategory}
          onChange={setCategory}
        />

        <div className="relative w-full md:max-w-xs select-none">
          <input
            type="text"
            placeholder="Buscar produto por nome..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-2 pl-9 pr-8 text-xs outline-none focus:border-orange-500 transition-colors"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-neutral-500" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2 text-neutral-500 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col gap-2 w-full">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-14 bg-neutral-900/40 border border-neutral-800 rounded-xl animate-pulse w-full" />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/10 rounded-2xl border border-dashed border-neutral-800 w-full">
            <p className="text-neutral-550 font-medium">Nenhum produto cadastrado nesta categoria.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            {sortedProducts.map((p) => {
              const IconComponent = categoryIcon[p.category] || Utensils;
              return (
                <div
                  key={p.id}
                  className={`w-full group rounded-xl border px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-3 transition-all ${
                    p.available
                      ? 'border-neutral-850 bg-neutral-950/70 hover:border-neutral-750'
                      : 'border-neutral-900 bg-neutral-950/30 opacity-60 select-none'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                      p.available ? 'bg-neutral-900 border-neutral-800 text-orange-400' : 'bg-neutral-950 border-neutral-900 text-neutral-600'
                    }`}>
                      <IconComponent size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-bold text-sm leading-tight truncate">
                          {p.name}
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-400 border border-neutral-800 shrink-0">
                          {categoryLabel[p.category]}
                        </span>
                      </div>
                      {p.description && (
                        <p className="text-neutral-450 text-xs truncate mt-0.5 max-w-md hidden sm:block">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-3">
                    <span className="text-sm sm:text-base font-extrabold text-white sm:min-w-[85px]">
                      R$ {Number(p.price).toFixed(2)}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg border ${
                      p.available 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {p.available ? 'Disponível' : 'Esgotado'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border border-neutral-850 bg-neutral-900/10 rounded-2xl px-5 py-4 mt-6">
          <p className="text-xs text-neutral-500 font-semibold select-none">
            Mostrando página <span className="text-neutral-350">{currentPage}</span> de <span className="text-neutral-350">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="text-xs py-1.5 px-4"
            >
              Anterior
            </Button>
            <Button
              variant="ghost"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="text-xs py-1.5 px-4"
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}