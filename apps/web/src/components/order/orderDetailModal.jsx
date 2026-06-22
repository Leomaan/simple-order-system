import { useState, useEffect, useMemo } from 'react';
import api from '../../config/api';
import { useOrderItems } from '../../hooks/userOrderItems';
import CategoryFilter from '../ui/categoryFilter';
import QuantityControl from '../ui/quantityControl';
import CloseOrderButton from '../order/closeOrderButton';

export default function OrderDetailsModal({ order, products, onClose, onUpdate }) {
  const [orderDetails, setOrderDetails] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [error, setError] = useState('');
  const [changingQty, setChangingQty] = useState(null);

  const { addItem, removeItem, changeQuantity, loading } = useOrderItems();

  // Memórias para performance
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

  useEffect(() => { fetchDetails(); }, [order.id]);

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
    } finally { setChangingQty(null); }
  };

  const formatPrice = (val) => `R$ ${Number(val || 0).toFixed(2)}`;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white font-semibold text-lg">Mesa {order.table}</h3>
            <p className="text-neutral-500 text-xs mt-0.5">Pedido #{order.id}</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-2xl leading-none transition-colors">×</button>
        </header>

        {/* Listagem de Itens Atuais */}
        <section className="mb-4">
          {loadingDetails ? (
            <p className="text-neutral-500 text-sm">Carregando itens...</p>
          ) : orderDetails?.OrderItems?.length === 0 ? (
            <p className="text-neutral-500 text-sm">Nenhum item adicionado.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {orderDetails.OrderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-neutral-800 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-white text-sm font-medium">{item.Product?.name}</p>
                    <p className="text-neutral-500 text-[10px]">{formatPrice(item.unitPrice)} cada</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-orange-400 text-sm font-semibold">{formatPrice(item.totalPrice)}</span>
                    {order.status === 'OPEN' ? (
                      <QuantityControl
                        quantity={item.quantity}
                        onChange={(qty) => handleChangeQty(item, qty)}
                        disabled={changingQty === item.id}
                      />
                    ) : (
                      <span className="text-neutral-500 text-xs">{item.quantity}x</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Bloco de Total */}
              <div className="flex justify-between items-center pt-3 border-t border-neutral-800 mt-2">
                <span className="text-neutral-400 text-sm">Total</span>
                <span className="text-white font-bold text-lg">{formatPrice(orderDetails.total)}</span>
              </div>

              {/* Botão de Fechamento */}
              {order.status === 'OPEN' && orderDetails.OrderItems.length > 0 && (
                <CloseOrderButton
                  orderId={order.id}
                  onSuccess={() => { onUpdate?.(); onClose(); }}
                  onError={setError}
                />
              )}
            </div>
          )}
        </section>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mb-4">{error}</p>
        )}

        {/* Adicionar novos itens (Apenas se o pedido estiver aberto) */}
        {order.status === 'OPEN' && (
          <section className="border-t border-neutral-800 pt-4 space-y-3">
            <h4 className="text-white text-sm font-medium">Adicionar item</h4>

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
                  className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${
                    selectedProduct?.id === p.id
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-neutral-700 bg-neutral-800 hover:border-neutral-500'
                  }`}
                >
                  <p className="text-white text-[11px] font-medium truncate">{p.name}</p>
                  <p className="text-orange-400 text-[10px] mt-0.5">{formatPrice(p.price)}</p>
                </button>
              ))}
            </div>

            {/* Formulário de Quantidade do Produto Selecionado */}
            {selectedProduct && (
              <form onSubmit={handleAddItem} className="flex items-center gap-3 bg-neutral-800 rounded-lg px-4 py-3 animate-in fade-in">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{selectedProduct.name}</p>
                  <p className="text-neutral-500 text-[10px]">{formatPrice(selectedProduct.price)} cada</p>
                </div>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-14 bg-neutral-700 border border-neutral-600 text-white rounded-lg px-2 py-1.5 text-sm outline-none focus:border-orange-500 transition-colors text-center"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  {loading ? '...' : 'Adicionar'}
                </button>
              </form>
            )}
          </section>
        )}
      </div>
    </div>
  );
}