import React, { useState } from "react";
import { useProducts } from "../../hooks/useProduct";
import ConfirmModal from "../ui/ConfirmModal";
import CategoryFilter from "../ui/CategoryFilter";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ErrorMessage from "../ui/ErrorMessage";
import { formatErrorMessage } from "../util/errorUtil";
import { Utensils, Beer, Popcorn, CakeSlice, Soup, Search } from "lucide-react";

const CATEGORIES = ["FOOD", "DRINK", "SNACK", "DESSERT", "SIDE"];

const categoryLabel = {
  FOOD: "Prato",
  DRINK: "Bebida",
  SNACK: "Petisco",
  DESSERT: "Sobremesa",
  SIDE: "Acompanhamento",
};

const categoryIcon = {
  FOOD: Utensils,
  DRINK: Beer,
  SNACK: Popcorn,
  DESSERT: CakeSlice,
  SIDE: Soup,
};

const emptyForm = { name: "", price: "", category: "FOOD", description: "", available: true };

export default function ProductSection() {
  const [filterCategory, setFilterCategory] = useState("FOOD");
  const [searchQuery, setSearchQuery] = useState("");
  const { products, loading, createProduct, updateProduct, deleteProduct, totalPages, currentPage, setPage, fetchProducts } =
    useProducts("FOOD");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || "",
      available: product.available,
    });
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = { 
        ...form, 
        price: Number(form.price), 
        available: Boolean(form.available) 
      };
      if (editing) {
        await updateProduct(editing.id, data);
      } else {
        await createProduct(data);
      }
      closeForm();
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await deleteProduct(deleting);
      setDeleting(null);
    } catch (err) {
      setError(formatErrorMessage(err));
      setDeleting(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {deleting && (
        <ConfirmModal
          title="Excluir produto?"
          message="Esta ação é permanente e o produto será removido do cardápio. Deseja continuar?"
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={deleteLoading}
        />
      )}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Cardápio & Produtos</h2>
          <p className="text-neutral-500 text-sm">Gerencie os itens disponíveis para venda</p>
        </div>
        <Button
          onClick={showForm ? closeForm : openCreate}
          variant={showForm ? "secondary" : "primary"}
          className="w-full sm:w-auto py-3 text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-500/10"
        >
          {showForm ? "Cancelar" : "+ Novo produto"}
        </Button>
      </header>

      {/* Form Criar / Editar */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="glass-panel border border-neutral-800 rounded-2xl p-6 mb-8 flex flex-col gap-5 animate-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-white font-bold text-base">
              {editing ? "Editar Produto" : "Novo Produto"}
            </h3>
            <button
              type="button"
              onClick={closeForm}
              className="text-neutral-500 hover:text-white text-xl"
            >
              &times;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome do produto"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Ex: Coca-Cola 350ml"
            />
            <Input
              label="Preço (R$)"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              placeholder="Ex: 6.50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Categoria
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl p-3 text-xs outline-none focus:border-orange-500 transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabel[cat]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Input
                label="Descrição (opcional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ex: Lata 350ml trincando de gelada"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="available"
              checked={form.available}
              onChange={(e) => setForm({ ...form, available: e.target.checked })}
              className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
            />
            <label htmlFor="available" className="text-xs font-semibold text-neutral-300 cursor-pointer select-none">
              Produto disponível para venda imediata
            </label>
          </div>

          <ErrorMessage message={error} />

          <div className="flex gap-3 justify-end mt-2">
            <Button variant="ghost" onClick={closeForm} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? "Salvar alterações" : "Criar produto"}
            </Button>
          </div>
        </form>
      )}

      {/* Filtros de categoria & Busca */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <CategoryFilter
          categories={CATEGORIES}
          selected={filterCategory}
          onChange={(cat) => {
            setFilterCategory(cat);
            fetchProducts(cat, searchQuery);
          }}
        />

        <div className="relative w-full md:max-w-xs select-none">
          <input
            type="text"
            placeholder="Buscar produto por nome..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              fetchProducts(filterCategory, e.target.value);
            }}
            className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-2.5 pl-9 pr-4 text-xs outline-none focus:border-orange-500 transition-colors"
          />
          <Search size={14} className="absolute left-3 top-3 text-neutral-500" />
        </div>
      </div>

      {/* Lista de Produtos (Cards estilo iFood para Gerenciamento Admin) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-neutral-900/50 border border-neutral-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/10 rounded-2xl border border-dashed border-neutral-800">
          <p className="text-neutral-500 font-medium">Nenhum produto cadastrado nesta categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedProducts.map((p) => {
            const IconComponent = categoryIcon[p.category] || Utensils;
            const categoryGradient = {
              FOOD: "from-orange-500/20 via-amber-500/10 to-neutral-900 text-orange-400 border-orange-500/30",
              DRINK: "from-cyan-500/20 via-blue-500/10 to-neutral-900 text-cyan-400 border-cyan-500/30",
              SNACK: "from-amber-500/20 via-yellow-500/10 to-neutral-900 text-amber-400 border-amber-500/30",
              DESSERT: "from-pink-500/20 via-rose-500/10 to-neutral-900 text-pink-400 border-pink-500/30",
              SIDE: "from-emerald-500/20 via-teal-500/10 to-neutral-900 text-emerald-400 border-emerald-500/30",
            }[p.category] || "from-neutral-800 to-neutral-900 text-orange-400 border-neutral-800";

            return (
              <div
                key={p.id}
                className={`group relative glass-card rounded-2xl overflow-hidden flex flex-col justify-between border transition-all duration-300 shadow-xl ${
                  p.available
                    ? 'border-neutral-800 hover:border-orange-500/50 hover:shadow-orange-500/5'
                    : 'border-neutral-900 opacity-60 bg-neutral-950/40'
                }`}
              >
                {/* Top Banner Ilustrado / Imagem iFood Style */}
                <div className={`h-28 w-full relative bg-gradient-to-b ${categoryGradient} flex items-center justify-center overflow-hidden border-b border-neutral-850/50`}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-900/80 border border-neutral-750 flex items-center justify-center shadow-lg backdrop-blur-md">
                        <IconComponent size={24} />
                      </div>
                    </div>
                  )}

                  {/* Badge de Categoria */}
                  <span className="absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-neutral-950/80 text-neutral-300 border border-neutral-800 backdrop-blur-md shadow-md">
                    {categoryLabel[p.category]}
                  </span>

                  {/* Preço em Destaque no Header */}
                  <span className="absolute bottom-3 right-3 text-sm font-extrabold px-3 py-1 rounded-xl bg-orange-500/90 text-white shadow-lg backdrop-blur-md">
                    R$ {Number(p.price).toFixed(2)}
                  </span>
                </div>

                {/* Corpo do Card: Nome e Descrição */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="text-white font-bold text-base leading-tight mb-1.5 group-hover:text-orange-400 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-neutral-400 text-xs leading-relaxed line-clamp-2 min-h-[32px]">
                      {p.description || "Sem descrição informada."}
                    </p>
                  </div>

                  {/* Painel de Controle de Admin (Status + Editar + Excluir) */}
                  <div className="flex flex-col gap-2 pt-3 border-t border-neutral-850">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await updateProduct(p.id, { available: !p.available });
                          } catch (err) {
                            setError(err.response?.data?.message || "Erro ao alterar disponibilidade");
                          }
                        }}
                        className={`flex-1 text-[10px] font-extrabold uppercase tracking-wider py-1.5 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          p.available
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${p.available ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                        <span>{p.available ? "Disponível" : "Indisponível"}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          onClick={() => openEdit(p)}
                          className="text-xs py-1.5 px-3 border border-neutral-800 hover:border-neutral-700 font-semibold"
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setDeleting(p.id)}
                          className="text-xs py-1.5 px-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 font-semibold"
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border border-neutral-850 bg-neutral-900/10 rounded-2xl px-5 py-4 mt-6">
          <p className="text-xs text-neutral-500 font-semibold select-none">
            Mostrando página <span className="text-neutral-350">{currentPage}</span> de <span className="text-neutral-350">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="text-xs py-1.5 px-4"
            >
              Anterior
            </Button>
            <Button
              variant="ghost"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="text-xs py-1.5 px-4"
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
