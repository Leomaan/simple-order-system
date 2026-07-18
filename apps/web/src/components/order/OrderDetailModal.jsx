import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/api';
import { useOrderItems } from '../../hooks/useOrderItems';
import CategoryFilter from '../ui/CategoryFilter';
import QuantityControl from '../ui/QuantityControl';
import CloseOrderButton from './CloseOrderButton';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';
import { Ticket, Plus, Copy, Check, Loader2, RefreshCw } from 'lucide-react';

export default function OrderDetailModal({ order, products, onClose, onUpdate }) {
  const [orderDetails, setOrderDetails] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [error, setError] = useState('');
  const [changingQty, setChangingQty] = useState(null);
  const [addingProductId, setAddingProductId] = useState(null);
  const [activeTab, setActiveTab] = useState('add'); // 'items' ou 'add'

  // Estados de Pagamento
  const [generatingPix, setGeneratingPix] = useState(false);
  const [simulatingConfirm, setSimulatingConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const { addItem, removeItem, changeQuantity, loading } = useOrderItems();

  const categories = useMemo(() => 
    [...new Set(products.map(p => p.category).filter(Boolean))],
    [products]
  );

  const availableProducts = useMemo(() => {
    const all = products;
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

  useEffect(() => {
    let interval;
    if (orderDetails?.status === 'CLOSED' && orderDetails?.paymentId) {
      interval = setInterval(() => {
        api.get(`/order/${order.id}`)
          .then(res => {
            const updated = res.data.data;
            if (updated.status === 'PAID') {
              setOrderDetails(updated);
              onUpdate?.();
            }
          })
          .catch(() => {});
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderDetails?.status, orderDetails?.paymentId, order.id]);

  async function handleInstantAdd(product) {
    setAddingProductId(product.id);
    setError('');
    try {
      // Se o item já existir no pedido, aumentamos a quantidade em 1.
      const existingItem = orderDetails?.OrderItems?.find(item => item.productId === product.id);
      if (existingItem) {
        await changeQuantity(existingItem.id, existingItem.quantity + 1);
      } else {
        await addItem(order.id, product.id, 1);
      }
      await fetchDetails();
      onUpdate?.();
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Erro ao adicionar item');
    } finally {
      setAddingProductId(null);
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

  const handleGeneratePix = async () => {
    setGeneratingPix(true);
    setError('');
    try {
      await api.post('/payment/pix', { orderId: order.id });
      await fetchDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao gerar PIX');
    } finally {
      setGeneratingPix(false);
    }
  };

  const handleSimulatePayment = async () => {
    setSimulatingConfirm(true);
    setError('');
    try {
      await api.post('/payment/simulate-confirm', { paymentId: orderDetails?.paymentId });
      await fetchDetails();
      onUpdate?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao simular confirmação');
    } finally {
      setSimulatingConfirm(false);
    }
  };

  const handleCopy = () => {
    if (orderDetails?.paymentQrCodeCopy) {
      navigator.clipboard.writeText(orderDetails.paymentQrCodeCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatPrice = (val) => `R$ ${Number(val || 0).toFixed(2)}`;
  const currentStatus = orderDetails?.status || order.status;  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 md:px-4 animate-in fade-in duration-200">
      <div 
        className={`bg-neutral-900 p-4 md:p-6 w-full h-full max-h-screen md:h-auto md:max-h-[90vh] md:rounded-3xl border-none md:border border-neutral-800 overflow-y-auto shadow-2xl flex flex-col gap-5 md:gap-6 animate-in scale-in duration-200 transition-all ${
          currentStatus === 'OPEN' ? 'md:max-w-6xl' : 'md:max-w-lg'
        }`}
      >
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-white font-bold text-xl tracking-tight">Mesa {order.table}</h3>
              {currentStatus === 'OPEN' && (
                <span className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider select-none animate-pulse">
                  ● Aberto
                </span>
              )}
              {currentStatus === 'CLOSED' && (
                <span className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider select-none animate-pulse">
                  ● Aguardando Pagamento
                </span>
              )}
              {currentStatus === 'PAID' && (
                <span className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider select-none">
                  ✓ Pago
                </span>
              )}
            </div>
            <p className="text-neutral-550 text-xs mt-1">Pedido #{order.id} · Aberto em {new Date(orderDetails?.createdAt || order.createdAt).toLocaleString('pt-BR')}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-neutral-450 hover:text-white text-3xl leading-none transition-colors cursor-pointer select-none"
          >
            &times;
          </button>
        </header>

        {/* Tabs de navegação no mobile (Apenas se o pedido estiver aberto) */}
        {currentStatus === 'OPEN' && (
          <div className="flex md:hidden border border-neutral-800 p-1 bg-neutral-950/60 rounded-2xl select-none shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Adicionar Itens
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('items')}
              className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer relative ${
                activeTab === 'items'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Ver Consumo ({orderDetails?.OrderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0})
            </button>
          </div>
        )}

        {/* Corpo do Modal em Grid (POS Style) */}
        <div className={`grid grid-cols-1 gap-6 md:gap-8 ${currentStatus === 'OPEN' ? 'md:grid-cols-12' : 'md:grid-cols-1'}`}>
          
          {/* Coluna da Esquerda: Consumo e Totais */}
          <div className={`${currentStatus === 'OPEN' ? 'md:col-span-5' : 'w-full'} ${currentStatus === 'OPEN' && activeTab !== 'items' ? 'hidden md:flex' : 'flex'} flex-col gap-5`}>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 select-none text-neutral-450">
                <Ticket size={12} /> Itens Consumidos
              </h4>
              
              {loadingDetails ? (
                <div className="flex items-center gap-2 text-neutral-500 py-6">
                  <Loader2 size={16} className="animate-spin text-orange-500" />
                  <span className="text-sm">Carregando itens...</span>
                </div>
              ) : orderDetails?.OrderItems?.length === 0 ? (
                <div className="text-center py-10 bg-neutral-950 border border-dashed border-neutral-850 rounded-2xl">
                  <p className="text-neutral-550 text-sm font-medium">Nenhum item adicionado à mesa ainda.</p>
                  {currentStatus === 'OPEN' && (
                    <p className="text-neutral-600 text-xs mt-1">Toque nos produtos ao lado para adicionar</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[50vh] md:max-h-[40vh] overflow-y-auto pr-1">
                  {orderDetails.OrderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-neutral-950/60 border border-neutral-850 rounded-xl px-4 py-3 hover:border-neutral-800 transition-colors">
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{item.Product?.name}</p>
                        <p className="text-neutral-550 text-[10px] uppercase tracking-wider mt-0.5">{formatPrice(item.unitPrice)} cada</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-orange-400 text-sm font-bold whitespace-nowrap">{formatPrice(item.totalPrice)}</span>
                        {currentStatus === 'OPEN' ? (
                          <QuantityControl
                            quantity={item.quantity}
                            onChange={(qty) => handleChangeQty(item, qty)}
                            disabled={changingQty === item.id}
                          />
                        ) : (
                          <span className="text-neutral-550 text-xs font-bold bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-lg">{item.quantity}x</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recibo Totais */}
            {orderDetails && (
              <div className="bg-neutral-950/40 border border-neutral-850 rounded-2xl p-4 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-sm font-semibold">Subtotal</span>
                  <span className="text-neutral-350 font-bold text-sm">{formatPrice(orderDetails.total)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-neutral-850/60 mt-3">
                  <span className="text-neutral-350 text-sm font-bold">Total da Conta</span>
                  <span className="text-white font-black text-xl tracking-tight">{formatPrice(orderDetails.total)}</span>
                </div>

                {/* Botão de Fechamento */}
                {currentStatus === 'OPEN' && orderDetails.OrderItems.length > 0 && (
                  <div className="mt-4">
                    <CloseOrderButton
                      orderId={order.id}
                      onSuccess={() => { onUpdate?.(); fetchDetails(); }}
                      onError={setError}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Seção de Pagamento PIX */}
            {currentStatus === 'CLOSED' && orderDetails && (
              <div className="mt-2 border-t border-neutral-850 pt-5 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h4 className="text-white text-xs font-bold uppercase tracking-wider text-neutral-450">Pagamento</h4>
                
                {!orderDetails.paymentId ? (
                  <Button
                    onClick={handleGeneratePix}
                    loading={generatingPix}
                    variant="primary"
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 shadow-lg shadow-orange-500/10 text-xs tracking-wider uppercase rounded-xl"
                  >
                    Gerar QR Code PIX ({formatPrice(orderDetails.total)})
                  </Button>
                ) : (
                  <div className="flex flex-col gap-4 text-center">
                    {orderDetails.paymentQrCode && (
                      <div className="bg-white p-3 rounded-2xl inline-block mx-auto shadow-md">
                        <img 
                          src={orderDetails.paymentQrCode} 
                          alt="PIX QR Code" 
                          className="w-44 h-44 rounded-lg block"
                        />
                      </div>
                    )}
                    
                    <div className="text-left flex flex-col gap-2">
                      <label className="text-neutral-550 text-[10px] uppercase font-bold tracking-wider">Código PIX Copia e Cola</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={orderDetails.paymentQrCodeCopy || ''}
                          className="flex-1 bg-neutral-950 border border-neutral-850 text-neutral-300 rounded-xl px-3 py-2.5 text-xs outline-none truncate"
                        />
                        <button
                          type="button"
                          onClick={handleCopy}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            copied 
                              ? 'bg-green-500/15 border border-green-500/30 text-green-400' 
                              : 'bg-neutral-850 border border-neutral-750 text-white hover:bg-neutral-800'
                          }`}
                        >
                          {copied ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2.5 mt-2 bg-orange-500/5 border border-orange-500/15 p-3.5 rounded-xl">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                      </span>
                      <span className="text-orange-300 text-xs font-medium">Aguardando confirmação do pagamento...</span>
                    </div>

                    {import.meta.env.DEV && (
                      <Button
                        onClick={handleSimulatePayment}
                        loading={simulatingConfirm}
                        variant="secondary"
                        className="text-xs py-2.5 bg-neutral-950 border border-neutral-850 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-xl"
                      >
                        ⚡ Simular Confirmação de Pagamento (Dev)
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Pedido Pago com Sucesso */}
            {currentStatus === 'PAID' && orderDetails && (
              <div className="mt-2 border-t border-neutral-850 pt-5 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-5 flex flex-col gap-2.5 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-lg font-black shadow-inner">✓</div>
                  <h4 className="text-white font-bold text-sm tracking-tight">Pedido Pago com Sucesso!</h4>
                  <p className="text-neutral-500 text-xs leading-relaxed">Mesa quitada e pronta para liberação/fechamento.</p>
                </div>
                {orderDetails.paymentId && (
                  <div className="bg-neutral-950 border border-neutral-850 rounded-2xl p-4 text-xs text-neutral-400 flex flex-col gap-2 text-left">
                    <div><span className="text-neutral-500">Forma de Pagamento:</span> PIX</div>
                    <div><span className="text-neutral-500">Código de Transação:</span> <code className="bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-300">{orderDetails.paymentId}</code></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Coluna da Direita: Adicionar Novos Consumos (Apenas Aberto) */}
          {currentStatus === 'OPEN' && (
            <div className={`md:col-span-7 border-t md:border-t-0 md:border-l border-neutral-850 pt-6 md:pt-0 md:pl-6 ${activeTab !== 'add' ? 'hidden md:flex' : 'flex'} flex-col gap-4`}>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider text-neutral-450">Lançar Consumo</h4>

              {categories.length > 0 && (
                <CategoryFilter
                  categories={categories}
                  selected={selectedCategory}
                  onChange={setSelectedCategory}
                />
              )}

              {/* Grid de Produtos */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[55vh] md:max-h-[58vh] overflow-y-auto pr-1">
                {availableProducts.map((p) => {
                  const isAdding = addingProductId === p.id;
                  const canAdd = p.available && !isAdding;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={!canAdd}
                      onClick={() => handleInstantAdd(p)}
                      className={`text-left rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between min-h-[96px] md:min-h-[112px] h-auto group relative overflow-hidden ${
                        !p.available 
                          ? 'border-neutral-900 bg-neutral-950/40 opacity-40 select-none cursor-not-allowed'
                          : 'border-neutral-850 bg-neutral-950 hover:border-orange-500/30 cursor-pointer active:scale-98'
                      }`}
                    >
                      {/* Efeito hover de fundo */}
                      {p.available && (
                        <span className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-colors" />
                      )}

                      <p className="text-white text-xs sm:text-sm font-bold line-clamp-2 w-full relative z-10 leading-snug">{p.name}</p>
                      <div className="flex items-center justify-between w-full mt-2.5 relative z-10">
                        {p.available ? (
                          <>
                            <span className="text-orange-400 text-xs sm:text-sm font-bold">{formatPrice(p.price)}</span>
                            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white group-hover:scale-105 transition-all duration-200 shrink-0">
                              {isAdding ? (
                                <Loader2 size={14} className="animate-spin text-white" />
                              ) : (
                                <Plus size={14} />
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-neutral-550 text-xs sm:text-sm font-bold">{formatPrice(p.price)}</span>
                            <span className="text-[9px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-1 rounded-md">
                              Sem Estoque
                            </span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <ErrorMessage message={error} />

        {/* Rodapé do Modal */}
        <div className="flex justify-end pt-4 border-t border-neutral-800 shrink-0 mt-2">
          <Button variant="secondary" onClick={onClose} className="w-full text-xs font-bold tracking-wider uppercase py-2.5">
            Fechar Detalhes
          </Button>
        </div>
      </div>
    </div>
  );
}