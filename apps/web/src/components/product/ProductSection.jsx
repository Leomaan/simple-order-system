import React, { useState } from "react";
import { useProducts } from "../../hooks/useProduct";
import ConfirmModal from "../ui/ConfirmModal";
import CategoryFilter from "../ui/CategoryFilter";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ErrorMessage from "../ui/ErrorMessage";
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
      const msg = err.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg.join(", ") : msg || "Erro ao salvar produto"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await deleteProduct(deleting);
      setDeleting(null);
    } catch {
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

      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Cardápio & Produtos</h2>
          <p className="text-neutral-500 text-sm">Gerencie os itens disponíveis para venda</p>
        </div>
        <Button
          onClick={showForm ? closeForm : openCreate}
          variant={showForm ? "secondary" : "primary"}
        >
          {showForm ? "Cancelar" : "+ Novo produto"}
        </Button>
      </header>

      {/* Formulário */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="glass-panel border border-neutral-800 rounded-2xl p-6 mb-8 flex flex-col gap-5 animate-in slide-in-from-top-4 duration-300"
        >
          <h3 className="text-white font-bold text-lg">
            {editing ? "Editar Produto" : "Novo Produto"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome do Produto"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Ex: X-Burguer Artesanal"
            />

            <Input
              label="Preço (R$)"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              placeholder="0.00"
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-neutral-450 text-xs font-bold uppercase tracking-wider select-none">
                Categoria
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-2.5 px-4 text-sm outline-none focus:border-orange-500 transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabel[c]}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Descrição (Ingredientes/Detalhes)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: Pão brioche, blend 150g, queijo cheddar, maionese"
            />

            <div className="flex flex-col gap-1.5 justify-center mt-4 md:mt-6">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-800 bg-neutral-900 text-orange-500 focus:ring-0 focus:ring-offset-0 outline-none cursor-pointer"
                />
                <span className="text-white text-xs font-bold uppercase tracking-wider">
                  Disponível para Venda
                </span>
              </label>
            </div>
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
            className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-orange-500 transition-colors"
          />
          <Search size={14} className="absolute left-3 top-3 text-neutral-500" />
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-neutral-900/50 border border-neutral-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/10 rounded-2xl border border-dashed border-neutral-800">
          <p className="text-neutral-500 font-medium">Nenhum produto cadastrado nesta categoria.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedProducts.map((p) => {
            const IconComponent = categoryIcon[p.category] || Utensils;
            return (
              <div
                key={p.id}
                className="glass-card glass-card-hover rounded-2xl px-5 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Miniature Thumbnail */}
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 border border-neutral-800 flex items-center justify-center text-orange-400 shrink-0 shadow-inner">
                    <IconComponent size={18} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold">{p.name}</p>
                      <button
                        type="button"
                        title="Clique para alternar a disponibilidade"
                        onClick={async () => {
                          try {
                            await updateProduct(p.id, { available: !p.available });
                          } catch (err) {
                            setError(err.response?.data?.message || "Erro ao alterar disponibilidade");
                          }
                        }}
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                          p.available 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" 
                            : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                        }`}
                      >
                        {p.available ? "Disponível" : "Indisponível"}
                      </button>
                    </div>
                    {p.description && (
                      <p className="text-neutral-450 text-xs mt-1 leading-relaxed max-w-lg truncate">
                        {p.description}
                      </p>
                    )}
                    <p className="text-neutral-550 text-[10px] uppercase tracking-wider mt-1.5 font-bold">
                      {categoryLabel[p.category]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <span className="text-orange-400 font-bold text-base whitespace-nowrap">
                    R$ {Number(p.price).toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      onClick={() => openEdit(p)}
                      className="text-xs py-1 px-3"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setDeleting(p.id)}
                      className="text-xs py-1 px-3 text-red-450 hover:text-red-400 hover:bg-red-500/5"
                    >
                      Excluir
                    </Button>
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
