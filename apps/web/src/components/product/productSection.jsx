import { useState } from "react";
import { useProducts } from "../../hooks/useProduct";
import confirmModal from "../ui/confirmModal";

const CATEGORIES = ["FOOD", "DRINK", "SNACK", "DESSERT", "SIDE"];

const categoryLabel = {
  FOOD: "Prato",
  DRINK: "Bebida",
  SNACK: "Petisco",
  DESSERT: "Sobremesa",
  SIDE: "Acompanhamento",
};

const emptyForm = { name: "", price: "", category: "FOOD", description: "" };

export default function productsSection() {
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

  // Filtra e ordena alfabeticamente
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
        Array.isArray(msg) ? msg.join(", ") : msg || "Erro ao salvar produto",
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
    <div className="p-8">
      {deleting &&
        confirmModal({
          message: "Tem certeza que deseja excluir este produto?",
          onConfirm: handleDelete,
          onCancel: () => setDeleting(null),
          loading: deleteLoading,
        })}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-bold">Produtos</h2>
        <button
          onClick={showForm ? closeForm : openCreate}
          className="bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? "Cancelar" : "+ Novo produto"}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6 flex flex-col gap-4"
        >
          <h3 className="text-white font-medium">
            {editing ? "Editar produto" : "Novo produto"}
          </h3>

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
                  <option key={c} value={c}>
                    {categoryLabel[c]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-neutral-400 text-sm">Descrição</label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Opcional"
                className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors placeholder:text-neutral-600"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* ✅ Troque o botão antigo por esses dois: */}
          <div className="flex gap-2 self-end">
            <button
              type="button"
              onClick={closeForm}
              className="text-neutral-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {saving
                ? "Salvando..."
                : editing
                  ? "Salvar alterações"
                  : "Criar produto"}
            </button>
          </div>
        </form>
      )}

      {/* Filtros de categoria */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={() => setFilterCategory("")}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            filterCategory === ""
              ? "bg-orange-500 border-orange-500 text-white"
              : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
          }`}
        >
          Todos
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              filterCategory === c
                ? "bg-orange-500 border-orange-500 text-white"
                : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
            }`}
          >
            {categoryLabel[c]}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-neutral-500 text-sm">Carregando...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-neutral-500 text-sm">Nenhum produto encontrado.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-4 flex items-center justify-between"
            >
              <div>
                <p className="text-white font-medium">{p.name}</p>
                <p className="text-neutral-500 text-xs mt-0.5">
                  {categoryLabel[p.category]} ·{" "}
                  {p.available ? "Disponível" : "Indisponível"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-orange-400 font-semibold text-sm">
                  R$ {Number(p.price).toFixed(2)}
                </span>
                <button
                  onClick={() => openEdit(p)}
                  className="text-neutral-400 hover:text-white text-xs transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => setDeleting(p.id)}
                  className="text-red-400 hover:text-red-300 text-xs transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
