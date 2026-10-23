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

export const PublicProductCard = memo(function PublicProductCard({ product, onAddToCart }) {
  const [imageError, setImageError] = useState(false);
  const IconComponent = categoryIcon[product.category] || Utensils;
  const label = categoryLabel[product.category] || product.category;

  const hasImage = Boolean(product.imageUrl) && !imageError;

  return (
    <article className="w-full bg-white hover:bg-[#faf8f4] dark:bg-neutral-900/90 dark:hover:bg-neutral-900 border border-[#e4ded4] hover:border-[#cfc7b8] dark:border-neutral-800 dark:hover:border-neutral-700/80 rounded-2xl p-3 sm:p-4 transition-all duration-200 flex items-center justify-between gap-3 sm:gap-4 shadow-xs hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20 group">
      {/* Bloco Esquerda + Centro */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Foto na Esquerda */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-[#f5f0e6] dark:bg-neutral-950 border border-[#e4ded4] dark:border-neutral-800 relative select-none">
          {hasImage ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f5f0e6] to-[#e8e0d2] dark:from-neutral-900 dark:to-neutral-950 text-orange-500 dark:text-orange-400/80">
              <IconComponent size={24} />
            </div>
          )}
        </div>

        {/* Nome em cima, Infos/Descrição embaixo */}
        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="font-bold text-[#1c1917] dark:text-white text-sm sm:text-base leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs sm:text-sm text-stone-600 dark:text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-600 dark:text-neutral-400 bg-[#f5f0e6] dark:bg-neutral-950/80 px-2 py-0.5 rounded-md border border-[#e4ded4] dark:border-neutral-800/80">
              {label}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 inline-block animate-pulse" />
              Disponível
            </span>
          </div>
        </div>
      </div>

      {/* Extremidade Direita: Valor e Botão Adicionar */}
      <div className="shrink-0 flex flex-col items-end gap-2 pl-2 sm:pl-4">
        <span className="text-orange-600 dark:text-amber-400 font-extrabold text-base sm:text-lg whitespace-nowrap block tracking-tight">
          {formatCurrency(product.price)}
        </span>
        {onAddToCart && (
          <button
            onClick={() => onAddToCart(product)}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
          >
            Adicionar +
          </button>
        )}
      </div>
    </article>
  );
});
