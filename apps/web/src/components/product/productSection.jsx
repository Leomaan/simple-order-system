import { useState } from 'react';
import { useProducts } from '../../hooks/useProduct';

const CATEGORIES = ['FOOD', 'DRINK', 'SNACK', 'DESSERT', 'SIDE'];

const categoryLabel = {
  FOOD: 'Prato',
  DRINK: 'Bebida',
  SNACK: 'Petisco',
  DESSERT: 'Sobremesa',
  SIDE: 'Acompanhamento',
};

export default function productsSection() {
  const { products, loading, createProduct } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', category: 'FOOD', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createProduct({ ...form, price: Number(form.price) });
      setForm({ name: '', price: '', category: 'FOOD', description: '' });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar produto');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-bold">Produtos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Novo produto'}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6 flex flex-col gap-4">
          <h3 className="text-white font-medium">Novo produto</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-neutral-400 text-sm">Nome</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Ex: X-Burguer"
                className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors placeholder:text-neutral-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-neutral-400 text-sm">Preço</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                placeholder="0.00"
                className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors placeholder:text-neutral-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-neutral-400 text-sm">Categoria</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{categoryLabel[c]}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-neutral-400 text-sm">Descrição</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Opcional"
                className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors placeholder:text-neutral-600"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {Array.isArray(error) ? error.join(', ') : error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors self-end"
          >
            {saving ? 'Salvando...' : 'Salvar produto'}
          </button>
        </form>
      )}

      {/* Lista */}
      {loading ? (
        <p className="text-neutral-500 text-sm">Carregando...</p>
      ) : products.length === 0 ? (
        <p className="text-neutral-500 text-sm">Nenhum produto cadastrado.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {products.map((p) => (
            <div key={p.id} className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{p.name}</p>
                <p className="text-neutral-500 text-xs mt-0.5">{categoryLabel[p.category]} · {p.available ? 'Disponível' : 'Indisponível'}</p>
              </div>
              <span className="text-orange-400 font-semibold text-sm">
                R$ {Number(p.price).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}