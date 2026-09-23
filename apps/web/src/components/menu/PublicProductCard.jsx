import { memo } from 'react';

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export const PublicProductCard = memo(function PublicProductCard({ product }) {
  return (
    <article className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between hover:border-neutral-700 transition duration-200">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start gap-3">
          <h3 className="font-semibold text-white text-lg leading-tight">
            {product.name}
          </h3>
          <span className="text-amber-400 font-bold whitespace-nowrap text-base">
            {formatCurrency(product.price)}
          </span>
        </div>

        {product.description && (
          <p className="text-sm text-neutral-400 leading-relaxed line-clamp-3">
            {product.description}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
        <span className="uppercase tracking-wider font-medium text-[11px] text-neutral-400">
          {product.category}
        </span>
        <span className="text-emerald-400/90 flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
          Disponível
        </span>
      </div>
    </article>
  );
});
