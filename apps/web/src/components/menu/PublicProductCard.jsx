import { memo, useState } from 'react';
import { Utensils, Beer, Popcorn, CakeSlice, Soup } from 'lucide-react';

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

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

export const PublicProductCard = memo(function PublicProductCard({ product }) {
  const [imageError, setImageError] = useState(false);
  const IconComponent = categoryIcon[product.category] || Utensils;
  const label = categoryLabel[product.category] || product.category;

  const hasImage = Boolean(product.imageUrl) && !imageError;

  return (
    <article className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition duration-200 shadow-md group">
      {hasImage ? (
        <div className="w-full h-44 bg-neutral-950 overflow-hidden relative border-b border-neutral-800/60">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent pointer-events-none" />
          <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-neutral-950/75 backdrop-blur-md text-orange-400 border border-neutral-800">
            {label}
          </span>
        </div>
      ) : (
        <div className="w-full h-32 bg-gradient-to-br from-neutral-900 to-neutral-950 flex items-center justify-center border-b border-neutral-800/60 relative">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-orange-400/80 shadow-inner">
            <IconComponent size={24} />
          </div>
          <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-neutral-900/80 text-neutral-400 border border-neutral-800">
            {label}
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col justify-between flex-1">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start gap-3">
            <h3 className="font-bold text-white text-lg leading-tight group-hover:text-orange-400 transition-colors">
              {product.name}
            </h3>
            <span className="text-amber-400 font-extrabold whitespace-nowrap text-base">
              {formatCurrency(product.price)}
            </span>
          </div>

          {product.description && (
            <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
          <span className="uppercase tracking-wider font-medium text-[11px] text-neutral-400">
            {label}
          </span>
          <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            Disponível
          </span>
        </div>
      </div>
    </article>
  );
});
