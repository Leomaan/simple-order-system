import { useRef, useEffect } from 'react';
import { Search, X, Utensils, Beer, Popcorn, CakeSlice, Soup, Sparkles } from 'lucide-react';

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

export function CategoryNav({
  categories = [],
  activeCategory = '',
  onSelectCategory,
  search = '',
  onSearchChange,
  counts = {},
}) {
  const scrollContainerRef = useRef(null);

  // Garante que o botão ativo fique visível dentro do container de scroll horizontal
  useEffect(() => {
    if (!scrollContainerRef.current || !activeCategory) return;
    const activeButton = scrollContainerRef.current.querySelector(
      `[data-category="${activeCategory}"]`
    );
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeCategory]);

  return (
    <nav className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-md border-y border-neutral-800/80 py-2.5 px-4 shadow-md transition-all">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Barra de Categorias Horizontal */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-2 px-2"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const Icon = categoryIcons[cat] || Sparkles;
            const label = categoryLabels[cat] || cat;
            const count = counts[cat];

            return (
              <button
                key={cat}
                type="button"
                data-category={cat}
                onClick={() => onSelectCategory(cat)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 border select-none ${
                  isActive
                    ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20 scale-[1.02]'
                    : 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-orange-400'} />
                <span>{label}</span>
                {typeof count === 'number' && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-orange-600/60 text-white'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative w-full sm:max-w-xs shrink-0 select-none">
          <input
            type="text"
            placeholder="Buscar no cardápio..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 rounded-xl py-1.5 pl-8 pr-7 text-xs outline-none focus:border-orange-500 transition-colors"
          />
          <Search size={13} className="absolute left-2.5 top-2.5 text-neutral-500 pointer-events-none" />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1.5 text-neutral-500 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
