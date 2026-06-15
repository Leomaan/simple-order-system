import { useState } from 'react';
import { useProducts } from '../../hooks/useProduct';
import CategoryFilter from '../ui/categoryFilter';

const CATEGORIES = ['FOOD', 'DRINK', 'SNACK', 'DESSERT', 'SIDE'];

const categoryLabel = {
  FOOD: 'Prato',
  DRINK: 'Bebida',
  SNACK: 'Petisco',
  DESSERT: 'Sobremesa',
  SIDE: 'Acompanhamento',
};

export default function ProductsView() {
  const { products, loading } = useProducts();
  const [filterCategory, setFilterCategory] = useState('');

  const filtered = (filterCategory
    ? products.filter((p) => p.category === filterCategory)
    : products
  ).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return (
    <div className="p-8">
      <h2 className="text-white text-xl font-bold mb-6">Cardápio</h2>

      <CategoryFilter
        categories={CATEGORIES}
        selected={filterCategory}
        onChange={setFilterCategory}
      />

      <div className="mt-4">
        {loading ? (
          <p className="text-neutral-500 text-sm">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-neutral-500 text-sm">Nenhum produto encontrado.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {filtered.map((p) => (
              <div key={p.id} className={`bg-neutral-900 border rounded-xl px-5 py-4 ${p.available ? 'border-neutral-800' : 'border-neutral-800 opacity-50'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-medium">{p.name}</p>
                    {p.description && <p className="text-neutral-500 text-xs mt-0.5">{p.description}</p>}
                    <p className="text-neutral-600 text-xs mt-1">{categoryLabel[p.category]}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-400 font-bold">R$ {Number(p.price).toFixed(2)}</p>
                    {!p.available && <p className="text-red-400 text-xs mt-1">Indisponível</p>}
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