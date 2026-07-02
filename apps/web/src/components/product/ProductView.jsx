import React, { useState } from 'react';
import { useProducts } from '../../hooks/useProduct';
import CategoryFilter from '../ui/CategoryFilter';
import Button from '../ui/Button';
import { Utensils, Beer, Popcorn, CakeSlice, Soup, Search } from 'lucide-react';

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
  const [filterCategory, setFilterCategory] = useState('FOOD');
  const [searchQuery, setSearchQuery] = useState('');
  const { products, loading, totalPages, currentPage, setPage, fetchProducts } = useProducts('FOOD');

  const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Cardápio</h2>
        <p className="text-neutral-550 text-sm font-medium">Visualize os itens disponíveis no restaurante</p>
      </header>

      {/* Filtros de categoria & Busca */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <CategoryFilter
          categories={CATEGORIES}
          selected={filterCategory}
          onChange={(cat) => {
            setFilterCategory(cat);
            fetchProducts(cat, searchQuery);
          }}
        />

        <div className="relative w-full md:max-w-xs select-none">
          <input
            type="text"
            placeholder="Buscar produto por nome..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              fetchProducts(filterCategory, e.target.value);
            }}
            className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-orange-500 transition-colors"
          />
          <Search size={14} className="absolute left-3 top-3 text-neutral-500" />
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 4].map((i) => (
              <div key={i} className="h-24 bg-neutral-900/50 border border-neutral-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/10 rounded-2xl border border-dashed border-neutral-800">
            <p className="text-neutral-550 font-medium">Nenhum produto cadastrado nesta categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedProducts.map((p) => {
              const IconComponent = categoryIcon[p.category] || Utensils;
              return (
                <div
                  key={p.id}
                  className={`glass-card rounded-2xl px-5 py-4 transition-all duration-200 ${
                    p.available
                      ? 'border-neutral-850 hover:border-neutral-700'
                      : 'border-neutral-900/55 opacity-40 select-none'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Miniature Thumbnail */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 border border-neutral-800 flex items-center justify-center text-orange-400 shrink-0 shadow-inner">
                      <IconComponent size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold truncate">{p.name}</p>
                        {!p.available && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/10 px-1.5 py-0.5 rounded">
                            Indisponível
                          </span>
                        )}
                      </div>
                      {p.description && (
                        <p className="text-neutral-450 text-xs mt-1 leading-relaxed line-clamp-2">
                          {p.description}
                        </p>
                      )}
                      <p className="text-neutral-550 text-[10px] uppercase tracking-wider mt-2 font-bold">
                        {categoryLabel[p.category]}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-orange-400 font-bold text-base">
                        R$ {Number(p.price).toFixed(2)}
                      </p>
                    </div>
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