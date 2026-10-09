import { memo } from 'react';
import { Utensils, Beer, Popcorn, CakeSlice, Soup, Sparkles } from 'lucide-react';
import { PublicProductCard } from './PublicProductCard.jsx';

const categoryLabels = {
  FOOD: 'Pratos Principais',
  DRINK: 'Bebidas',
  SNACK: 'Petiscos',
  DESSERT: 'Sobremesas',
  SIDE: 'Acompanhamentos',
};

const categoryIcons = {
  FOOD: Utensils,
  DRINK: Beer,
  SNACK: Popcorn,
  DESSERT: CakeSlice,
  SIDE: Soup,
};

export const ProductCategorySection = memo(function ProductCategorySection({
  categoryKey,
  products = [],
}) {
  if (!products.length) return null;

  const Icon = categoryIcons[categoryKey] || Sparkles;
  const title = categoryLabels[categoryKey] || categoryKey;

  return (
    <section
      id={`category-${categoryKey}`}
      className="scroll-mt-24 pt-6 pb-2 first:pt-2"
    >
      {/* Título da Categoria */}
      <div className="flex items-center gap-3 mb-4 pb-2 border-b border-neutral-800/80">
        <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
          <Icon size={16} />
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            {title}
          </h2>
          <span className="text-xs font-semibold text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-full">
            {products.length} {products.length === 1 ? 'item' : 'itens'}
          </span>
        </div>
      </div>

      {/* Grid de Cards Horizontais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {products.map((product) => (
          <PublicProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
});
