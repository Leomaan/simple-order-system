import React from 'react';

const categoryLabel = {
  FOOD: 'Pratos',
  DRINK: 'Bebidas',
  SNACK: 'Petiscos',
  DESSERT: 'Sobremesas',
  SIDE: 'Acompanhamentos',
};

export default function CategoryFilter({ categories, selected, onChange }) {
  return (
    <div className="flex gap-2.5 flex-wrap py-2 select-none">
      <button
        onClick={() => onChange('')}
        className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 ${
          selected === ''
            ? 'bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-500/10'
            : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
        }`}
      >
        <span>Todos</span>
      </button>
      {categories.map((cat) => {
        const catKey = typeof cat === 'object' ? (cat.slug || String(cat.id)) : cat;
        const catName = typeof cat === 'object' ? cat.name : (categoryLabel[cat] || cat);
        const isSelected = selected === catKey || (typeof cat === 'object' && selected === String(cat.id));
        return (
          <button
            key={catKey}
            onClick={() => onChange(catKey)}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 ${
              isSelected
                ? 'bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-500/10'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
            }`}
          >
            <span>{catName}</span>
          </button>
        );
      })}
    </div>
  );
}