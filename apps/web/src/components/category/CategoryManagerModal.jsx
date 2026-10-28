import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCategory } from '../../hooks/useCategory';
import api from '../../config/api';
import { X, Edit2, Trash2, Layers, ChefHat } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ErrorMessage from '../ui/ErrorMessage';
import { formatErrorMessage } from '../util/errorUtil';

export default function CategoryManagerModal({ isOpen, onClose }) {
  const { categories, loading, createCategory, updateCategory, deleteCategory, isSaving } = useCategory();

  const { data: stations = [] } = useQuery({
    queryKey: ['kds-stations'],
    queryFn: async () => {
      const res = await api.get('/company/current/stations').catch(() => ({ data: { data: [] } }));
      return res.data.data || [];
    },
    enabled: isOpen,
  });

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [stationId, setStationId] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  if (!isOpen) return null;

  function resetForm() {
    setEditingId(null);
    setName('');
    setStationId('');
    setOrderIndex(0);
    setError('');
  }

  function startEdit(cat) {
    setEditingId(cat.id);
    setName(cat.name);
    setStationId(cat.stationId ? String(cat.stationId) : '');
    setOrderIndex(cat.orderIndex || 0);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Informe o nome da categoria');
      return;
    }

    const parsedStationId = stationId ? Number(stationId) : null;

    try {
      if (editingId) {
        await updateCategory({
          id: editingId,
          data: {
            name: name.trim(),
            stationId: parsedStationId,
            orderIndex: Number(orderIndex),
          },
        });
      } else {
        await createCategory({
          name: name.trim(),
          stationId: parsedStationId,
          orderIndex: Number(orderIndex),
        });
      }
      resetForm();
    } catch (err) {
      setError(formatErrorMessage(err));
    }
  }

  async function handleDelete(id) {
    setError('');
    setDeletingId(id);
    try {
      await deleteCategory(id);
      if (editingId === id) resetForm();
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#1a1a20] border border-[#e4ded4] dark:border-[#2e2e38] text-[#1c1917] dark:text-[#ececf0] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#e4ded4] dark:border-[#2e2e38] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1c1917] dark:text-white tracking-tight">Gerenciar Categorias</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">Vincule categorias às estações de preparo do KDS</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            type="button"
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-lg hover:bg-stone-200/50 dark:hover:bg-[#26262e] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-[#f7f4ee]/70 dark:bg-[#15151a] border border-[#e4ded4] dark:border-[#2e2e38] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                {editingId ? 'Editar Categoria' : 'Nova Categoria'}
              </span>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-stone-500 dark:text-stone-400 hover:text-orange-500 underline cursor-pointer"
                >
                  Cancelar edição
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Nome da Categoria"
                  name="name"
                  filter="text"
                  placeholder="Ex: Bebidas Lata, Porções, Drinks..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  label="Ordem (Índice)"
                  name="orderIndex"
                  filter="number"
                  type="text"
                  placeholder="0"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Estação de Destino no KDS
              </label>
              <select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="w-full bg-[#fdfdfc] dark:bg-[#26262e] border border-[#d8d2c4] dark:border-[#3e3e4a] text-[#1c1917] dark:text-[#ececf0] rounded-xl p-2.5 text-xs outline-none focus:border-orange-500/80 transition"
              >
                <option value="">Sem estação padrão (definir por produto)</option>
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            <ErrorMessage message={error} />

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                loading={isSaving}
                variant="primary"
                className="text-xs py-2 px-4"
              >
                {editingId ? 'Salvar Alterações' : 'Adicionar Categoria'}
              </Button>
            </div>
          </form>

          {/* List of categories */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-neutral-400 uppercase tracking-wider">
              <span>Categorias Cadastradas ({categories.length})</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-sm text-stone-500 dark:text-neutral-500 animate-pulse">
                Carregando categorias...
              </div>
            ) : categories.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-[#d8d2c4] dark:border-neutral-800 text-center text-sm text-stone-500 dark:text-neutral-500">
                Nenhuma categoria customizada cadastrada. Crie uma acima!
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => {
                  const stationObj =
                    cat.ProductionStation ||
                    stations.find((s) => String(s.id) === String(cat.stationId));
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-3.5 bg-[#f7f4ee] dark:bg-neutral-950/40 border border-[#e4ded4] dark:border-neutral-800 rounded-xl hover:border-[#cfc7b8] dark:hover:border-neutral-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-[#eee9df] dark:bg-neutral-800 text-stone-600 dark:text-neutral-400 text-xs font-mono flex items-center justify-center">
                          {cat.orderIndex ?? 0}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-[#1c1917] dark:text-white">{cat.name}</p>
                            {stationObj && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20">
                                <ChefHat className="w-3 h-3" />
                                {stationObj.name}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-neutral-500 font-mono">slug: {cat.slug || cat.id}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEdit(cat)}
                          className="p-1.5 text-stone-500 hover:text-[#1c1917] hover:bg-[#eee9df] dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id)}
                          disabled={deletingId === cat.id}
                          className="p-1.5 text-stone-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#f7f4ee] dark:bg-neutral-950/40 border-t border-[#e4ded4] dark:border-neutral-800 flex justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-xs py-2 px-4"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
