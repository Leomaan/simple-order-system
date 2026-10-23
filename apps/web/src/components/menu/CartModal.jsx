import React, { useState } from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2, Send, CheckCircle2 } from 'lucide-react';
import { publicApi } from '../../config/public/publicApi';

export default function CartModal({
  isOpen,
  onClose,
  cart,
  total,
  totalItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  tableNumber,
  companySlug,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const formatPrice = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const handleSendOrder = async () => {
    if (!tableNumber) {
      setErrorMsg('Número da mesa não identificado no QR Code');
      return;
    }

    if (cart.length === 0) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Cria ou recupera o pedido aberto para a mesa
      const orderRes = await publicApi.post('/order', {
        table: Number(tableNumber),
        slug: companySlug,
      });

      const orderId = orderRes.data?.data?.id;

      // 2. Adiciona os itens com as observações
      for (const item of cart) {
        await publicApi.post('/order-item', {
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes || null,
        });
      }

      setSuccess(true);
      onClearCart();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Falha ao enviar pedido. Chame o garçom.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-neutral-900 border border-[#e4ded4] dark:border-neutral-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#e4ded4] dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 dark:text-orange-400 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#1c1917] dark:text-white text-base">Seu Pedido</h3>
              <p className="text-stone-500 dark:text-neutral-400 text-xs">
                Mesa {tableNumber ? String(tableNumber).padStart(2, '0') : 'Balcão'} • {totalItems} {totalItems === 1 ? 'item' : 'itens'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-[#1c1917] dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 dark:text-emerald-400 animate-bounce" />
              <h4 className="text-xl font-bold text-[#1c1917] dark:text-white">Pedido Enviado com Sucesso!</h4>
              <p className="text-stone-500 dark:text-neutral-400 text-xs max-w-xs">
                O garçom já foi notificado e seu pedido logo entrará em preparo na cozinha.
              </p>
            </div>
          ) : cart.length === 0 ? (
            <div className="py-12 text-center text-stone-500 dark:text-neutral-500 text-sm">
              Seu carrinho está vazio. Escolha pratos e bebidas no cardápio!
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={`${item.productId}-${index}`}
                className="bg-[#f7f4ee] dark:bg-neutral-950/70 border border-[#e4ded4] dark:border-neutral-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-[#1c1917] dark:text-white text-sm truncate">{item.name}</h4>
                  <p className="text-orange-600 dark:text-orange-400 text-xs font-bold mt-0.5">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  {item.notes && (
                    <p className="text-stone-600 dark:text-neutral-400 text-[11px] mt-1 bg-white dark:bg-neutral-900 border border-[#e4ded4] dark:border-neutral-800 px-2 py-0.5 rounded-md inline-block">
                      Obs: {item.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white dark:bg-neutral-900 border border-[#d8d2c4] dark:border-neutral-800 rounded-xl p-1 gap-1">
                    <button
                      onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                      className="p-1 text-stone-500 hover:text-[#1c1917] dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-neutral-800 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-[#1c1917] dark:text-white px-1.5">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                      className="p-1 text-stone-500 hover:text-[#1c1917] dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-neutral-800 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(index)}
                    className="p-2 text-stone-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 rounded-xl hover:bg-red-500/10 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé e Botão de Ação */}
        {!success && cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#e4ded4] dark:border-neutral-800 bg-[#f7f4ee] dark:bg-neutral-950/80 space-y-3">
            {errorMsg && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl text-center">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-600 dark:text-neutral-400 font-medium">Subtotal</span>
              <span className="text-xl font-extrabold text-[#1c1917] dark:text-white">{formatPrice(total)}</span>
            </div>

            <button
              onClick={handleSendOrder}
              disabled={submitting}
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm transition shadow-lg shadow-orange-600/25 active:scale-98 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Enviando Pedido...' : 'Enviar Pedido para a Cozinha'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
