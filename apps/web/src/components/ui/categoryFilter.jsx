const categoryLabel = {
  FOOD: 'Prato',
  DRINK: 'Bebida',
  SNACK: 'Petisco',
  DESSERT: 'Sobremesa',
  SIDE: 'Acompanhamento',
};

export default function CategoryFilter({ categories, selected, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => onChange('')}
        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
          selected === ''
            ? 'bg-orange-500 border-orange-500 text-white'
            : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
        }`}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            selected === cat
              ? 'bg-orange-500 border-orange-500 text-white'
              : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
          }`}
        >
          {categoryLabel[cat] || cat}
        </button>
      ))}
    </div>
  );
}