import React, { useState } from 'react';
import { useProducts } from '../../hooks/useProduct';
import CategoryFilter from '../ui/CategoryFilter';

const CATEGORIES = ['FOOD', 'DRINK', 'SNACK', 'DESSERT', 'SIDE'];

const categoryLabel = {
  FOOD: 'Prato',
  DRINK: 'Bebida',
  SNACK: 'Petisco',
  DESSERT: 'Sobremesa',
  SIDE: 'Acompanhamento',
};

export default function ProductView() {
  const { products, loading } = useProducts();
  const [filterCategory, setFilterCategory] = useState('');

  const filtered = (filterCategory
    ? products.filter((p) => p.category === filterCategory)
    : products
  ).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Cardápio</h2>
        <p className="text-neutral-500 text-sm">Visualize todos os itens disponíveis no restaurante</p>
      </header>

      <CategoryFilter
        categories={CATEGORIES}
        selected={filterCategory}
        onChange={setFilterCategory}
      />

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 4].map((i) => (
              <div key={i} className="h-24 bg-neutral-900/50 border border-neutral-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/10 rounded-2xl border border-dashed border-neutral-800">
            <p className="text-neutral-500 font-medium">Nenhum produto cadastrado nesta categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((p) => (
              <div
                key={p.id}
                className={`glass-card rounded-2xl px-5 py-4 transition-all duration-200 ${
                  p.available
                    ? 'border-neutral-800 hover:border-neutral-700'
                    : 'border-neutral-900/50 opacity-40 select-none'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold truncate">{p.name}</p>
                      {!p.available && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/10 px-1.5 py-0.5 rounded">
                          Indisponível
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <p className="text-neutral-400 text-xs mt-1 leading-relaxed line-clamp-2">
                        {p.description}
                      </p>
                    )}
                    <p className="text-neutral-550 text-[10px] uppercase tracking-wider mt-2">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}