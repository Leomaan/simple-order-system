import React, { useState } from "react";
import { useProducts } from "../../hooks/useProduct";
import ConfirmModal from "../ui/ConfirmModal";
import CategoryFilter from "../ui/CategoryFilter";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ErrorMessage from "../ui/ErrorMessage";
import { formatErrorMessage } from "../util/errorUtil";
import { Utensils, Beer, Popcorn, CakeSlice, Soup, Search, Plus, X, Edit2, Trash2 } from "lucide-react";

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
  const {
    products,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    totalPages,
    currentPage,
    setPage,
    category: filterCategory,
    search: searchQuery,
    setCategory,
    setSearch,
    isSaving,
    isDeleting,
  } = useProducts("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);

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
    }
  }

  async function handleDelete() {
    try {
      await deleteProduct(deleting);
      setDeleting(null);
    } catch (err) {
      setError(formatErrorMessage(err));
      setDeleting(null);
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
          loading={isDeleting}
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
          className="w-full sm:w-auto py-3 px-5 text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          <span>{showForm ? "Cancelar" : "Novo produto"}</span>
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
            <Button variant="ghost" onClick={closeForm} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSaving}>
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
          onChange={setCategory}
        />

        <div className="relative w-full md:max-w-xs select-none">
          <input
            type="text"
            placeholder="Buscar produto por nome..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-2 pl-9 pr-8 text-xs outline-none focus:border-orange-500 transition-colors"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-neutral-500" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2 text-neutral-500 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Lista de Produtos 100% de largura (1 item por linha) para Admin */}
      {loading ? (
        <div className="flex flex-col gap-2 w-full">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 bg-neutral-900/40 border border-neutral-800 rounded-xl animate-pulse w-full" />
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/10 rounded-2xl border border-dashed border-neutral-800 w-full">
          <p className="text-neutral-500 font-medium">Nenhum produto cadastrado nesta categoria.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full">
          {sortedProducts.map((p) => {
            const IconComponent = categoryIcon[p.category] || Utensils;
            return (
              <div
                key={p.id}
                className={`w-full group rounded-xl border px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-3 transition-all duration-150 ${
                  p.available
                    ? 'border-neutral-850 bg-neutral-950/70 hover:border-neutral-750 hover:bg-neutral-900/40'
                    : 'border-neutral-900 bg-neutral-950/30 opacity-60'
                }`}
              >
                {/* Lado Esquerdo: Ícone + Info do Produto */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                    p.available ? 'bg-neutral-900 border-neutral-800 text-orange-400' : 'bg-neutral-950 border-neutral-900 text-neutral-600'
                  }`}>
                    <IconComponent size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-bold text-sm leading-tight truncate group-hover:text-orange-400 transition-colors">
                        {p.name}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-400 border border-neutral-800 shrink-0">
                        {categoryLabel[p.category]}
                      </span>
                    </div>
                    {p.description && (
                      <p className="text-neutral-500 text-xs truncate mt-0.5 max-w-md hidden sm:block">
                        {p.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Lado Direito: Preço + Status + Ações */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <span className="text-sm sm:text-base font-extrabold text-white text-right sm:min-w-[85px]">
                    R$ {Number(p.price).toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await updateProduct(p.id, { available: !p.available });
                      } catch (err) {
                        setError(err.response?.data?.message || "Erro ao alterar disponibilidade");
                      }
                    }}
                    className={`text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                      p.available
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${p.available ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                    <span>{p.available ? "Disponível" : "Indisponível"}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="p-1.5 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors cursor-pointer"
                      title="Editar produto"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(p.id)}
                      className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Excluir produto"
                    >
                      <Trash2 size={13} />
                    </button>
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
