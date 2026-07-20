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

      {/* Lista */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-neutral-900/50 border border-neutral-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/10 rounded-2xl border border-dashed border-neutral-800">
          <p className="text-neutral-500 font-medium">Nenhum produto cadastrado nesta categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3.5">
          {sortedProducts.map((p) => {
            const IconComponent = categoryIcon[p.category] || Utensils;
            return (
              <div
                key={p.id}
                className="group glass-card glass-card-hover rounded-2xl p-3 sm:p-4 flex flex-col justify-between gap-2.5 transition-all min-h-[165px]"
              >
                {/* Linha Superior: Ícone, Nome, Categoria e Preço */}
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 border border-neutral-800 flex items-center justify-center text-orange-400 shrink-0 shadow-inner">
                      <IconComponent size={15} />
                    </div>

                    <span className="text-orange-400 font-bold text-xs sm:text-sm whitespace-nowrap block">
                      R$ {Number(p.price).toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-white font-bold text-xs sm:text-sm leading-snug line-clamp-2">{p.name}</h3>
                    <p className="text-neutral-550 text-[9px] uppercase tracking-wider font-bold mt-0.5">
                      {categoryLabel[p.category]}
                    </p>
                  </div>

                  {/* Descrição */}
                  {p.description && (
                    <p className="text-neutral-400 text-[10px] leading-snug line-clamp-2 bg-neutral-950/30 p-1.5 rounded-lg border border-neutral-850/40">
                      {p.description}
                    </p>
                  )}
                </div>

                {/* Área Inferior: Badge Ocupando Largura Total + Botões Aparecendo no Hover */}
                <div className="flex flex-col gap-2 pt-2 border-t border-neutral-850/60 mt-0.5">
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
                    className={`w-full text-[9px] font-bold uppercase tracking-wider py-1 px-2 rounded-lg border transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                      p.available 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" 
                        : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${p.available ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <span>{p.available ? "Disponível" : "Indisponível"}</span>
                  </button>

                  <div className="flex items-center justify-center gap-1.5 w-full sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
                    <Button
                      variant="ghost"
                      onClick={() => openEdit(p)}
                      className="flex-1 text-[10px] py-1 px-2 border border-neutral-800 hover:border-neutral-700 text-center"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setDeleting(p.id)}
                      className="flex-1 text-[10px] py-1 px-2 text-red-450 hover:text-red-400 hover:bg-red-500/10 border border-red-500/20 text-center"
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
