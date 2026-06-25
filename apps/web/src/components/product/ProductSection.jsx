import React, { useState } from "react";
import { useProducts } from "../../hooks/useProduct";
import ConfirmModal from "../ui/ConfirmModal";
import CategoryFilter from "../ui/CategoryFilter";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ErrorMessage from "../ui/ErrorMessage";

const CATEGORIES = ["FOOD", "DRINK", "SNACK", "DESSERT", "SIDE"];

const categoryLabel = {
  FOOD: "Prato",
  DRINK: "Bebida",
  SNACK: "Petisco",
  DESSERT: "Sobremesa",
  SIDE: "Acompanhamento",
};

const emptyForm = { name: "", price: "", category: "FOOD", description: "" };

export default function ProductSection() {
  const { products, loading, createProduct, updateProduct, deleteProduct } =
    useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");

  const filteredProducts = (
    filterCategory
      ? products.filter((p) => p.category === filterCategory)
      : products
  ).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

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
      const data = { ...form, price: Number(form.price) };
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
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
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

      {/* Filtros de categoria */}
      <div className="mb-6">
        <CategoryFilter
          categories={CATEGORIES}
          selected={filterCategory}
          onChange={setFilterCategory}
        />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-neutral-900/50 border border-neutral-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/10 rounded-2xl border border-dashed border-neutral-800">
          <p className="text-neutral-500 font-medium">Nenhum produto cadastrado nesta categoria.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="glass-card glass-card-hover rounded-2xl px-5 py-4 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold">{p.name}</p>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    p.available 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {p.available ? "Disponível" : "Indisponível"}
                  </span>
                </div>
                {p.description && (
                  <p className="text-neutral-450 text-xs mt-1 leading-relaxed max-w-lg">
                    {p.description}
                  </p>
                )}
                <p className="text-neutral-500 text-[10px] uppercase tracking-wider mt-1.5">
                  {categoryLabel[p.category]}
                </p>
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
                    className="text-xs py-1 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/5"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
