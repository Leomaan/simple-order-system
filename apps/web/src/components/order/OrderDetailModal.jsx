import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/api';
import { useOrderItems } from '../../hooks/userOrderItems';
import CategoryFilter from '../ui/CategoryFilter';
import QuantityControl from '../ui/QuantityControl';
import CloseOrderButton from './CloseOrderButton';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';

export default function OrderDetailModal({ order, products, onClose, onUpdate }) {
  const [orderDetails, setOrderDetails] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [error, setError] = useState('');
  const [changingQty, setChangingQty] = useState(null);

  const { addItem, removeItem, changeQuantity, loading } = useOrderItems();

  const categories = useMemo(() => 
    [...new Set(products.filter(p => p.available).map(p => p.category).filter(Boolean))],
    [products]
  );

  const availableProducts = useMemo(() => {
    const all = products.filter(p => p.available);
    const filtered = selectedCategory ? all.filter(p => p.category === selectedCategory) : all;
    return filtered.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [products, selectedCategory]);

  const fetchDetails = async () => {
    setLoadingDetails(true);
    try {
      const res = await api.get(`/order/${order.id}`);
      setOrderDetails(res.data.data);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [order.id]);

  async function handleAddItem(e) {
    e.preventDefault();
    if (!selectedProduct) return;
    setError('');

    try {
      await addItem(order.id, selectedProduct.id, Number(quantity));
      setSelectedProduct(null);
      setQuantity(1);
      await fetchDetails();
      onUpdate?.();
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Erro ao adicionar item');
    }
  }

  const handleChangeQty = async (item, newQty) => {
    setChangingQty(item.id);
    try {
      if (newQty <= 0) await removeItem(item.id);
      else await changeQuantity(item.id, newQty);
      await fetchDetails();
      onUpdate?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar quantidade');
    } finally {
      setChangingQty(null);
    }
  };

  const formatPrice = (val) => `R$ ${Number(val || 0).toFixed(2)}`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col gap-6 animate-in scale-in duration-200">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <h3 className="text-white font-bold text-lg">Mesa {order.table}</h3>
            <p className="text-neutral-500 text-xs mt-0.5">Pedido #{order.id}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-neutral-450 hover:text-white text-3xl leading-none transition-colors cursor-pointer select-none"
          >
            &times;
          </button>
        </header>

        {/* Listagem de Itens Atuais */}
        <section className="flex flex-col gap-3">
          <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Itens Consumidos</h4>
          {loadingDetails ? (
            <p className="text-neutral-500 text-sm">Carregando itens...</p>
          ) : orderDetails?.OrderItems?.length === 0 ? (
            <p className="text-neutral-555 text-sm italic">Nenhum item adicionado à mesa ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {orderDetails.OrderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-neutral-950 border border-neutral-850 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-semibold">{item.Product?.name}</p>
                    <p className="text-neutral-550 text-[10px] uppercase tracking-wider mt-0.5">{formatPrice(item.unitPrice)} cada</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-orange-400 text-sm font-bold">{formatPrice(item.totalPrice)}</span>
                    {order.status === 'OPEN' ? (
                      <QuantityControl
                        quantity={item.quantity}
                        onChange={(qty) => handleChangeQty(item, qty)}
                        disabled={changingQty === item.id}
                      />
                    ) : (
                      <span className="text-neutral-500 text-xs font-bold bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-lg">{item.quantity}x</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Bloco de Total */}
              <div className="flex justify-between items-center pt-4 border-t border-neutral-800 mt-2">
                <span className="text-neutral-400 text-sm font-semibold">Total da Conta</span>
                <span className="text-white font-black text-xl">{formatPrice(orderDetails.total)}</span>
              </div>

              {/* Botão de Fechamento */}
              {order.status === 'OPEN' && orderDetails.OrderItems.length > 0 && (
                <div className="mt-2">
                  <CloseOrderButton
                    orderId={order.id}
                    onSuccess={() => { onUpdate?.(); onClose(); }}
                    onError={setError}
                  />
                </div>
              )}
            </div>
          )}
        </section>

        <ErrorMessage message={error} />

        {/* Adicionar novos itens (Apenas se o pedido estiver aberto) */}
        {order.status === 'OPEN' && (
          <section className="border-t border-neutral-800 pt-5 flex flex-col gap-4">
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider">Adicionar Consumo</h4>

            {categories.length > 0 && (
              <CategoryFilter
                categories={categories}
                selected={selectedCategory}
                onChange={(cat) => { setSelectedCategory(cat); setSelectedProduct(null); }}
              />
            )}

            {/* Grid de Produtos */}
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {availableProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProduct(selectedProduct?.id === p.id ? null : p)}
                  className={`text-left rounded-xl border p-3 transition-all duration-200 cursor-pointer active:scale-98 ${
                    selectedProduct?.id === p.id
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-neutral-850 bg-neutral-950 hover:border-neutral-700'
                  }`}
                >
                  <p className="text-white text-xs font-semibold truncate">{p.name}</p>
                  <p className="text-orange-400 text-[10px] font-bold mt-1">{formatPrice(p.price)}</p>
                </button>
              ))}
            </div>

            {/* Formulário de Quantidade do Produto Selecionado */}
            {selectedProduct && (
              <form onSubmit={handleAddItem} className="flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{selectedProduct.name}</p>
                  <p className="text-neutral-500 text-[10px]">{formatPrice(selectedProduct.price)} cada</p>
                </div>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-16 bg-neutral-900 border border-neutral-850 text-white rounded-lg px-2 py-2 text-sm outline-none focus:border-orange-500 transition-colors text-center font-bold"
                />
                <Button
                  type="submit"
                  loading={loading}
                  variant="primary"
                  className="text-xs py-2 px-4 shrink-0"
                >
                  Adicionar
                </Button>
              </form>
            )}
          </section>
        )}

        {/* Rodapé do Modal */}
        <div className="flex justify-end pt-4 border-t border-neutral-800 shrink-0 mt-2">
          <Button variant="secondary" onClick={onClose} className="w-full">
            Fechar Detalhes
          </Button>
        </div>
      </div>
    </div>
  );
}