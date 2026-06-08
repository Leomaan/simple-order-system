import { useState, useEffect } from 'react';
import api from '../../config/api';
import { useOrderItems } from '../../hooks/userOrderItems';
import CategoryFilter from '../ui/categoryFilter';
import QuantityControl from '../ui/quantityControl';
import CloseOrderButton from '../order/closeOrderButton';

const categoryLabel = {
  FOOD: 'Prato',
  DRINK: 'Bebida',
  SNACK: 'Petisco',
  DESSERT: 'Sobremesa',
  SIDE: 'Acompanhamento',
};

export default function OrderDetailsModal({ order, products, onClose, onUpdate }) {
  const [orderDetails, setOrderDetails] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [error, setError] = useState('');
  const [changingQty, setChangingQty] = useState(null);

  const { addItem, removeItem, changeQuantity, loading } = useOrderItems();

  // produtos recebidos como prop — sem chamada extra à API
  const allAvailable = products.filter((p) => p.available);
  const categories = [...new Set(allAvailable.map((p) => p.category).filter(Boolean))];
  const availableProducts = (
    selectedCategory ? allAvailable.filter((p) => p.category === selectedCategory) : allAvailable
  ).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  async function fetchDetails() {
    setLoadingDetails(true);
    try {
      const res = await api.get(`/order/${order.id}`);
      setOrderDetails(res.data.data);
    } finally {
      setLoadingDetails(false);
    }
  }

  useEffect(() => {
    fetchDetails();
  }, []);

  function handleCategoryChange(cat) {
    setSelectedCategory(cat);
    setSelectedProduct(null);
  }

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
      setError(err.message);
    }
  }

  async function handleChangeQty(item, newQty) {
    setChangingQty(item.id);
    try {
      if (newQty <= 0) {
        await removeItem(item.id);
      } else {
        await changeQuantity(item.id, newQty);
      }
      await fetchDetails();
      onUpdate?.();
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Erro ao alterar quantidade');
    } finally {
      setChangingQty(null);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white font-semibold text-lg">Mesa {order.table}</h3>
            <p className="text-neutral-500 text-xs mt-0.5">Pedido #{order.id}</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        {/* Itens */}
        {loadingDetails ? (
          <p className="text-neutral-500 text-sm mb-4">Carregando itens...</p>
        ) : orderDetails?.OrderItems?.length === 0 ? (
          <p className="text-neutral-500 text-sm mb-4">Nenhum item adicionado.</p>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            {orderDetails?.OrderItems?.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-neutral-800 rounded-lg px-4 py-3">
                <div>
                  <p className="text-white text-sm font-medium">{item.Product?.name}</p>
                  <p className="text-neutral-500 text-xs">R$ {Number(item.unitPrice).toFixed(2)} cada</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-orange-400 text-sm font-semibold">
                    R$ {Number(item.totalPrice).toFixed(2)}
                  </span>
                  {order.status === 'OPEN' ? (
                    <QuantityControl
                      quantity={item.quantity}
                      onChange={(newQty) => handleChangeQty(item, newQty)}
                      disabled={changingQty === item.id}
                    />
                  ) : (
                    <span className="text-neutral-500 text-xs">{item.quantity}x</span>
                  )}
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="flex justify-between items-center pt-3 border-t border-neutral-800 mt-2">
              <span className="text-neutral-400 text-sm">Total</span>
              <span className="text-white font-bold text-lg">
                R$ {Number(orderDetails?.total || 0).toFixed(2)}
              </span>
            </div>

            {/* Fechar pedido */}
            {order.status === 'OPEN' && orderDetails?.OrderItems?.length > 0 && (
              <CloseOrderButton
                orderId={order.id}
                onSuccess={() => { onUpdate?.(); onClose(); }}
                onError={setError}
              />
            )}
          </div>
        )}

        {/* Erro */}
        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mb-4">{error}</p>
        )}

        {/* Adicionar item */}
        {order.status === 'OPEN' && (
          <div className="border-t border-neutral-800 pt-4 flex flex-col gap-3">
            <h4 className="text-white text-sm font-medium">Adicionar item</h4>

            {categories.length > 0 && (
              <CategoryFilter
                categories={categories}
                selected={selectedCategory}
                onChange={handleCategoryChange}
              />
            )}

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
                  <p className="text-white text-xs font-medium truncate">{p.name}</p>
                  <p className="text-orange-400 text-xs mt-0.5">R$ {Number(p.price).toFixed(2)}</p>
                </button>
              ))}
              {availableProducts.length === 0 && (
                <p className="text-neutral-500 text-xs col-span-2 py-2">Nenhum produto disponível.</p>
              )}
            </div>

            {selectedProduct && (
              <form onSubmit={handleAddItem} className="flex items-center gap-3 bg-neutral-800 rounded-lg px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{selectedProduct.name}</p>
                  <p className="text-neutral-500 text-xs">R$ {Number(selectedProduct.price).toFixed(2)} cada</p>
                </div>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-16 bg-neutral-700 border border-neutral-600 text-white rounded-lg px-2 py-1.5 text-sm outline-none focus:border-orange-500 transition-colors text-center"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                >
                  {loading ? '...' : 'Adicionar'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}