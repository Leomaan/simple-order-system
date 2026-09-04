import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/api';
import { useOrderDetail } from '../../hooks/useOrderDetail';
import CategoryFilter from '../ui/CategoryFilter';
import QuantityControl from '../ui/QuantityControl';
import CloseOrderButton from './CloseOrderButton';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';
import { formatErrorMessage } from '../util/errorUtil';
import { Ticket, Plus, Copy, Check, Loader2, RefreshCw, RotateCcw, Banknote, CreditCard, CheckCircle2, Search, X } from 'lucide-react';

export default function OrderDetailModal({ order, products, onClose, onUpdate }) {
  const {
    orderDetails,
    loadingDetails,
    addItem,
    changeQuantity,
    removeItem,
    fetchDetails,
    isMutating,
  } = useOrderDetail(order.id);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('add'); // 'items' ou 'add'

  // Estados de Pagamento
  const [generatingPix, setGeneratingPix] = useState(false);
  const [simulatingConfirm, setSimulatingConfirm] = useState(false);
  const [processingManual, setProcessingManual] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [copied, setCopied] = useState(false);

  const categories = useMemo(() => 
    [...new Set(products.map(p => p.category).filter(Boolean))],
    [products]
  );

  const availableProducts = useMemo(() => {
    let list = products;
    if (selectedCategory) {
      list = list.filter(p => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      list = list.filter(p => {
        const nameNorm = (p.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return nameNorm.includes(q);
      });
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [products, selectedCategory, searchQuery]);

  useEffect(() => {
    let interval;
    if (orderDetails?.status === 'CLOSED' && orderDetails?.paymentId) {
      interval = setInterval(() => {
        // Consultar status ativo no Mercado Pago caso não seja mock
        if (!orderDetails.paymentId.startsWith('mock_')) {
          api.get(`/payment/check-status/${order.id}`)
            .then(res => {
              if (res.data.data?.status === 'PAID') {
                fetchDetails();
                onUpdate?.();
              }
            })
            .catch(() => {});
        } else {
          api.get(`/order/${order.id}`)
            .then(res => {
              if (res.data.data?.status === 'PAID') {
                fetchDetails();
                onUpdate?.();
              }
            })
            .catch(() => {});
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderDetails?.status, orderDetails?.paymentId, order.id, fetchDetails, onUpdate]);

  async function handleInstantAdd(product) {
    setError('');
    try {
      await addItem(product, 1);
      onUpdate?.();
    } catch (err) {
      setError(formatErrorMessage(err));
    }
  }

  const handleChangeQty = async (item, newQty) => {
    setError('');
    try {
      if (newQty <= 0) await removeItem(item.id);
      else await changeQuantity(item.id, newQty);
      onUpdate?.();
    } catch (err) {
      setError(formatErrorMessage(err));
    }
  };

  const handleGeneratePix = async () => {
    setGeneratingPix(true);
    setError('');
    try {
      await api.post('/payment/pix', { orderId: order.id });
      await fetchDetails();
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setGeneratingPix(false);
    }
  };

  const handleCheckStatus = async () => {
    setCheckingStatus(true);
    setError('');
    try {
      const res = await api.get(`/payment/check-status/${order.id}`);
      if (res.data.data?.status === 'PAID') {
        await fetchDetails();
        onUpdate?.();
      } else {
        setError(res.data.data?.message || 'Pagamento ainda em processamento pelo Mercado Pago.');
      }
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setCheckingStatus(false);
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
      setError(formatErrorMessage(err));
    } finally {
      setSimulatingConfirm(false);
    }
  };

  const handleReopen = async () => {
    setReopening(true);
    setError('');
    try {
      await api.patch(`/order/${order.id}/reopen`);
      await fetchDetails();
      onUpdate?.();
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setReopening(false);
    }
  };

  const handleManualPayment = async (method) => {
    setProcessingManual(method);
    setError('');
    try {
      await api.post('/payment/manual', { orderId: order.id, paymentMethod: method });
      await fetchDetails();
      onUpdate?.();
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setProcessingManual(null);
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
        <header className="flex flex-col gap-3 border-b border-neutral-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-black text-sm shrink-0">
                {order.table}
              </div>
              <div>
                <h3 className="text-white font-black text-xl tracking-tight leading-tight">Mesa {order.table}</h3>
                <p className="text-neutral-500 text-xs font-semibold">Pedido #{order.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentStatus === 'OPEN' && (
                <span className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-3 py-1 rounded-xl text-xs uppercase tracking-wider select-none animate-pulse">
                  ● Aberto
                </span>
              )}
              {currentStatus === 'CLOSED' && (
                <span className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold px-3 py-1 rounded-xl text-xs uppercase tracking-wider select-none animate-pulse">
                  ● Aguardando Pagamento
                </span>
              )}
              {currentStatus === 'PAID' && (
                <span className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold px-3 py-1 rounded-xl text-xs uppercase tracking-wider select-none">
                  ✓ Pago
                </span>
              )}
              <button 
                onClick={onClose} 
                className="text-neutral-450 hover:text-white text-3xl leading-none transition-colors cursor-pointer select-none p-1"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Sub-barra destacada com data e hora */}
          <div className="bg-neutral-950/80 border border-neutral-850/80 rounded-xl px-3.5 py-2 text-xs text-neutral-400">
            <span className="font-medium">Aberto em: <strong className="text-white font-semibold">{new Date(orderDetails?.createdAt || order.createdAt).toLocaleString('pt-BR')}</strong></span>
          </div>
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

            {/* Seção de Pagamento PIX e Métodos Alternativos */}
            {currentStatus === 'CLOSED' && orderDetails && (
              <div className="mt-2 border-t border-neutral-850 pt-5 flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Barra de Reabrir Mesa */}
                <div className="flex items-center justify-between bg-neutral-950/80 border border-neutral-850 p-3 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-white text-xs font-bold">Conta Fechada</span>
                    <span className="text-neutral-500 text-[11px]">Deseja lançar mais itens?</span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleReopen}
                    loading={reopening}
                    className="text-xs py-1.5 px-3 border border-neutral-750 text-neutral-300 hover:text-white hover:border-neutral-600 flex items-center gap-1.5 font-semibold"
                  >
                    <RotateCcw size={13} />
                    <span>Reabrir Mesa</span>
                  </Button>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="text-white text-xs font-bold uppercase tracking-wider text-neutral-450 flex items-center gap-1.5">
                    <span>Opção 1: Pagamento via PIX (Mercado Pago)</span>
                  </h4>
                  
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

                      <div className="flex items-center justify-center gap-2.5 bg-orange-500/5 border border-orange-500/15 p-3 rounded-xl">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        <span className="text-orange-300 text-xs font-medium">Aguardando confirmação do pagamento...</span>
                      </div>

                      {/* Botão de Verificação Ativa */}
                      <Button
                        onClick={handleCheckStatus}
                        loading={checkingStatus}
                        variant="primary"
                        className="w-full text-xs py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/15"
                      >
                        <RefreshCw size={14} className={checkingStatus ? 'animate-spin' : ''} />
                        <span>Verificar Pagamento</span>
                      </Button>

                      {import.meta.env.DEV && (
                        <Button
                          onClick={handleSimulatePayment}
                          loading={simulatingConfirm}
                          variant="secondary"
                          className="text-xs py-2 bg-neutral-950 border border-neutral-850 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-xl"
                        >
                          ⚡ Simular Confirmação de Pagamento (Dev)
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Métodos Manuais / Alternativos */}
                <div className="flex flex-col gap-2.5 pt-4 border-t border-neutral-850/60">
                  <h4 className="text-white text-xs font-bold uppercase tracking-wider text-neutral-450">
                    Opção 2: Receber Manualmente
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Button
                      variant="secondary"
                      onClick={() => handleManualPayment('CASH')}
                      loading={processingManual === 'CASH'}
                      className="py-3 text-xs font-bold uppercase tracking-wider bg-neutral-950 border border-neutral-850 hover:border-emerald-500/40 hover:text-emerald-400 flex items-center justify-center gap-2 rounded-xl"
                    >
                      <Banknote size={15} className="text-emerald-400" />
                      <span>Dinheiro</span>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleManualPayment('CARD')}
                      loading={processingManual === 'CARD'}
                      className="py-3 text-xs font-bold uppercase tracking-wider bg-neutral-950 border border-neutral-850 hover:border-blue-500/40 hover:text-blue-400 flex items-center justify-center gap-2 rounded-xl"
                    >
                      <CreditCard size={15} className="text-blue-400" />
                      <span>Cartão</span>
                    </Button>
                  </div>
                </div>
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
                <div className="bg-neutral-950 border border-neutral-850 rounded-2xl p-4 text-xs text-neutral-400 flex flex-col gap-2 text-left">
                  <div>
                    <span className="text-neutral-500 font-semibold">Forma de Pagamento: </span>
                    <strong className="text-white font-semibold">
                      {orderDetails.paymentMethod === 'PIX' ? 'PIX (Mercado Pago)' : orderDetails.paymentMethod === 'CARD' ? 'Cartão de Débito / Crédito' : orderDetails.paymentMethod === 'CASH' ? 'Dinheiro' : orderDetails.paymentMethod || 'PIX'}
                    </strong>
                  </div>
                  {orderDetails.paymentId && (
                    <div>
                      <span className="text-neutral-500 font-semibold">Código de Transação: </span>
                      <code className="bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-300">{orderDetails.paymentId}</code>
                    </div>
                  )}
                  <div>
                    <span className="text-neutral-500 font-semibold">Valor Total Pago: </span>
                    <strong className="text-emerald-400 font-bold">{formatPrice(orderDetails.total)}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Coluna da Direita: Adicionar Novos Consumos (Apenas Aberto) */}
          {currentStatus === 'OPEN' && (
            <div className={`md:col-span-7 border-t md:border-t-0 md:border-l border-neutral-850 pt-6 md:pt-0 md:pl-6 ${activeTab !== 'add' ? 'hidden md:flex' : 'flex'} flex-col gap-3.5`}>
              <div className="flex items-center justify-between">
                <h4 className="text-white text-xs font-bold uppercase tracking-wider text-neutral-450">Lançar Consumo</h4>
                <span className="text-[11px] text-neutral-500 font-semibold">
                  {availableProducts.length} {availableProducts.length === 1 ? 'produto' : 'produtos'}
                </span>
              </div>

              {/* Barra de Busca de Produtos */}
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar produto por nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-850 text-white rounded-xl py-2 pl-9 pr-8 text-xs outline-none focus:border-orange-500 transition-colors"
                />
                <Search size={14} className="absolute left-3 top-2.5 text-neutral-500" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-neutral-500 hover:text-white p-0.5 rounded cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Filtro de Categorias (Começa em Todos) */}
              {categories.length > 0 && (
                <CategoryFilter
                  categories={categories}
                  selected={selectedCategory}
                  onChange={setSelectedCategory}
                />
              )}

              {/* Lista de Produtos: w-full ocupando a área toda, um embaixo do outro */}
              {availableProducts.length === 0 ? (
                <div className="text-center py-12 bg-neutral-950 border border-dashed border-neutral-850 rounded-2xl w-full">
                  <p className="text-neutral-550 text-xs font-medium">Nenhum produto encontrado.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 w-full max-h-[50vh] md:max-h-[55vh] overflow-y-auto pr-1">
                  {availableProducts.map((p) => {
                    const canAdd = p.available;
                    return (
                      <div
                        key={p.id}
                        onClick={() => canAdd && handleInstantAdd(p)}
                        className={`w-full rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-3 transition-all duration-150 ${
                          !p.available 
                            ? 'border-neutral-900 bg-neutral-950/40 opacity-40 select-none cursor-not-allowed'
                            : 'border-neutral-850 bg-neutral-950 hover:border-orange-500/40 hover:bg-neutral-900/40 cursor-pointer active:scale-[0.99]'
                        }`}
                      >
                        {/* Lado Esquerdo: Nome + Categoria + Descrição */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-xs sm:text-sm font-bold truncate">
                              {p.name}
                            </span>
                            {p.category && (
                              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 shrink-0">
                                {p.category}
                              </span>
                            )}
                          </div>
                          {p.description && (
                            <p className="text-neutral-500 text-[11px] truncate mt-0.5 max-w-sm hidden sm:block">
                              {p.description}
                            </p>
                          )}
                        </div>

                        {/* Lado Direito: Preço + Botão Adicionar */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-orange-400 text-xs sm:text-sm font-extrabold whitespace-nowrap">
                            {formatPrice(p.price)}
                          </span>

                          {p.available ? (
                            <button
                              type="button"
                              disabled={!canAdd}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInstantAdd(p);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-orange-500 hover:bg-orange-500 hover:text-white text-orange-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                            >
                              <Plus size={13} />
                              <span className="hidden sm:inline">Adicionar</span>
                            </button>
                          ) : (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-1 rounded-md">
                              Sem Estoque
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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