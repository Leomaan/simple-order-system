import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../config/api';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import ErrorMessage from '../ui/ErrorMessage';

const TABS = [
  { key: 'products', label: 'Produtos' },
  { key: 'orders', label: 'Pedidos' },
  { key: 'users', label: 'Usuários' },
];

export default function TrashSection() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('products');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // States for actions
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(null);

  async function fetchDeletedItems() {
    setLoading(true);
    setError('');
    try {
      let endpoint = '';
      if (activeTab === 'products') endpoint = '/product?onlyDeleted=true';
      else if (activeTab === 'orders') endpoint = '/order?onlyDeleted=true';
      else if (activeTab === 'users') endpoint = '/user?onlyDeleted=true';

      const res = await api.get(endpoint);
      setItems(res.data.data || []);
    } catch (err) {
      setError('Erro ao carregar itens da lixeira.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDeletedItems();
  }, [activeTab]);

  async function handleRestore(item) {
    setActionLoading(true);
    setError('');
    try {
      let endpoint = '';
      if (activeTab === 'products') endpoint = `/product/${item.id}/restore`;
      else if (activeTab === 'orders') endpoint = `/order/${item.id}/restore`;
      else if (activeTab === 'users') endpoint = `/user/${item.id}/restore`;

      await api.patch(endpoint);
      setItems((prev) => prev.filter((i) => i.id !== item.id));

      // Invalidate query caches to force list refresh on respective screens
      if (activeTab === 'products') {
        queryClient.invalidateQueries({ queryKey: ['products'] });
      } else if (activeTab === 'orders') {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || 'Erro ao restaurar item.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePermanentDelete() {
    if (!confirmingDelete) return;
    setActionLoading(true);
    setError('');
    try {
      let endpoint = '';
      if (activeTab === 'products') endpoint = `/product/${confirmingDelete.id}/permanent`;
      else if (activeTab === 'orders') endpoint = `/order/${confirmingDelete.id}/permanent`;
      else if (activeTab === 'users') endpoint = `/user/${confirmingDelete.id}/permanent`;

      await api.delete(endpoint);
      setItems((prev) => prev.filter((i) => i.id !== confirmingDelete.id));
      setConfirmingDelete(null);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || 'Erro ao excluir permanentemente.');
      setConfirmingDelete(null);
    } finally {
      setActionLoading(false);
    }
  }

  function getDeletedLabel(item) {
    if (activeTab === 'products') return item.name;
    if (activeTab === 'users') return `${item.name} (${item.email})`;
    if (activeTab === 'orders') return `Pedido #${item.id} - Mesa ${item.table}`;
    return '';
  }

  const getEntityName = () => {
    if (activeTab === 'products') return 'produto';
    if (activeTab === 'users') return 'usuário';
    if (activeTab === 'orders') return 'pedido';
    return 'item';
  };

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
      {confirmingDelete && (
        <ConfirmModal
          title={`Excluir ${getEntityName()} permanentemente?`}
          message={`Esta ação é irreversível. O ${getEntityName()} "${getDeletedLabel(confirmingDelete)}" será removido permanentemente do banco de dados.`}
          confirmLabel="Excluir Definitivamente"
          onConfirm={handlePermanentDelete}
          onCancel={() => setConfirmingDelete(null)}
          loading={actionLoading}
        />
      )}

      {/* Header */}
      <header className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Lixeira Geral</h2>
          <p className="text-neutral-500 text-sm">Gerencie os registros excluídos temporariamente do sistema</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-850 pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 px-4 text-sm font-bold tracking-wide uppercase transition-all relative cursor-pointer ${
              activeTab === tab.key
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-neutral-500 hover:text-neutral-350'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ErrorMessage message={error} />

      {/* Main List */}
      <main className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl animate-pulse" />
          ))
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/10 rounded-3xl border border-dashed border-neutral-800">
            <p className="text-neutral-550 font-medium">Nenhum item encontrado na lixeira.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="glass-card glass-card-hover rounded-2xl px-5 py-4 flex items-center justify-between"
              >
                {/* Meta details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <p className="text-white font-semibold truncate">{getDeletedLabel(item)}</p>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-md">
                      Excluído
                    </span>
                  </div>
                  <p className="text-neutral-500 text-xs mt-1.5 leading-relaxed">
                    {activeTab === 'products' && (
                      <>
                        Preço: <span className="text-neutral-400 font-semibold">R$ {Number(item.price).toFixed(2)}</span> · Categoria: <span className="text-neutral-400 font-semibold">{item.category}</span>
                      </>
                    )}
                    {activeTab === 'users' && (
                      <>
                        Cargo: <span className="text-neutral-400 font-semibold">{item.role}</span> · Cadastro em: <span className="text-neutral-400 font-semibold">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                      </>
                    )}
                    {activeTab === 'orders' && (
                      <>
                        Total: <span className="text-neutral-400 font-semibold">R$ {Number(item.total || 0).toFixed(2)}</span> · Status no momento: <span className="text-neutral-400 font-semibold">{item.status}</span>
                      </>
                    )}
                    {item.deletedAt && (
                      <>
                        {' · '}Excluído em:{' '}
                        <span className="text-neutral-450 font-semibold">
                          {new Date(item.deletedAt).toLocaleString('pt-BR')}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 shrink-0 ml-4">
                  <Button
                    variant="ghost"
                    onClick={() => handleRestore(item)}
                    disabled={actionLoading}
                    className="text-xs py-1.5 px-3 hover:bg-emerald-500/5 text-emerald-450 hover:text-emerald-400 border border-transparent hover:border-emerald-500/10"
                  >
                    Restaurar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setConfirmingDelete(item)}
                    disabled={actionLoading}
                    className="text-xs py-1.5 px-3 text-red-450 hover:text-red-400 hover:bg-red-500/5"
                  >
                    Excluir Definitivamente
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
