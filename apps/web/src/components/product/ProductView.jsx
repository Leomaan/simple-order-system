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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedProducts.map((p) => {
              const IconComponent = categoryIcon[p.category] || Utensils;
              const categoryGradient = {
                FOOD: "from-orange-500/20 via-amber-500/10 to-neutral-900 text-orange-400 border-orange-500/30",
                DRINK: "from-cyan-500/20 via-blue-500/10 to-neutral-900 text-cyan-400 border-cyan-500/30",
                SNACK: "from-amber-500/20 via-yellow-500/10 to-neutral-900 text-amber-400 border-amber-500/30",
                DESSERT: "from-pink-500/20 via-rose-500/10 to-neutral-900 text-pink-400 border-pink-500/30",
                SIDE: "from-emerald-500/20 via-teal-500/10 to-neutral-900 text-emerald-400 border-emerald-500/30",
              }[p.category] || "from-neutral-800 to-neutral-900 text-orange-400 border-neutral-800";

              return (
                <div
                  key={p.id}
                  className={`group relative glass-card rounded-2xl overflow-hidden flex flex-col justify-between border transition-all duration-300 shadow-xl ${
                    p.available
                      ? 'border-neutral-800 hover:border-orange-500/50 hover:shadow-orange-500/5'
                      : 'border-neutral-900 opacity-60 bg-neutral-950/40 select-none'
                  }`}
                >
                  {/* Top Banner Ilustrado / Imagem iFood Style */}
                  <div className={`h-28 w-full relative bg-gradient-to-b ${categoryGradient} flex items-center justify-center overflow-hidden border-b border-neutral-850/50`}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-900/80 border border-neutral-750 flex items-center justify-center shadow-lg backdrop-blur-md">
                          <IconComponent size={24} />
                        </div>
                      </div>
                    )}

                    {/* Badge de Categoria */}
                    <span className="absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-neutral-950/80 text-neutral-300 border border-neutral-800 backdrop-blur-md shadow-md">
                      {categoryLabel[p.category]}
                    </span>

                    {/* Preço em Destaque no Header */}
                    <span className="absolute bottom-3 right-3 text-sm font-extrabold px-3 py-1 rounded-xl bg-orange-500/90 text-white shadow-lg backdrop-blur-md">
                      R$ {Number(p.price).toFixed(2)}
                    </span>
                  </div>

                  {/* Corpo do Card: Nome e Descrição */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <h3 className="text-white font-bold text-base leading-tight mb-1.5 group-hover:text-orange-400 transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-neutral-400 text-xs leading-relaxed line-clamp-2 min-h-[32px]">
                        {p.description || "Sem descrição informada."}
                      </p>
                    </div>

                    {!p.available && (
                      <div className="pt-2 border-t border-neutral-850">
                        <span className="w-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5">
                          ● Indisponível no momento
                        </span>
                      </div>
                    )}
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