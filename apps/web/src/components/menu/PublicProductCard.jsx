import { memo, useState } from 'react';
import { Utensils, Beer, Popcorn, CakeSlice, Soup, Check } from 'lucide-react';

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
    <article className="w-full bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl p-3 sm:p-4 transition-all duration-200 flex items-center justify-between gap-3 sm:gap-4 shadow-sm hover:shadow-lg hover:shadow-black/20 group">
      {/* Bloco Esquerda + Centro */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Foto na Esquerda */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-neutral-950 border border-neutral-800 relative select-none">
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
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950 text-orange-400/80">
              <IconComponent size={24} />
            </div>
          )}
        </div>

        {/* Nome em cima, Infos/Descrição embaixo */}
        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm sm:text-base leading-snug group-hover:text-orange-400 transition-colors truncate">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs sm:text-sm text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 bg-neutral-950/80 px-2 py-0.5 rounded-md border border-neutral-800/80">
              {label}
            </span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              Disponível
            </span>
          </div>
        </div>
      </div>

      {/* Extremidade Direita: Valor */}
      <div className="shrink-0 text-right pl-2 sm:pl-4">
        <span className="text-amber-400 font-extrabold text-base sm:text-lg whitespace-nowrap block tracking-tight">
          {formatCurrency(product.price)}
        </span>
      </div>
    </article>
  );
});
