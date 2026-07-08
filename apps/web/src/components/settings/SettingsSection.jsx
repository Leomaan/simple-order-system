import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';
import { Building, ShieldCheck, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function SettingsSection() {
  const { settings, loading, error, success, setSuccess, updateSettings } = useSettings();
  
  const [restaurantName, setRestaurantName] = useState('');
  const [mercadoPagoAccessToken, setMercadoPagoAccessToken] = useState('');
  const [mercadoPagoWebhookSecret, setMercadoPagoWebhookSecret] = useState('');

  const [showToken, setShowToken] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (settings) {
      setRestaurantName(settings.restaurantName || '');
      setMercadoPagoAccessToken(settings.mercadoPagoAccessToken || '');
      setMercadoPagoWebhookSecret(settings.mercadoPagoWebhookSecret || '');
    }
  }, [settings]);

  // Clear success toast after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, setSuccess]);

  async function handleSubmit(e) {
    e.preventDefault();
    setUpdating(true);
    setLocalError('');
    try {
      await updateSettings({
        restaurantName,
        mercadoPagoAccessToken: mercadoPagoAccessToken || null,
        mercadoPagoWebhookSecret: mercadoPagoWebhookSecret || null,
      });
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Erro ao salvar configurações.');
    } finally {
      setUpdating(false);
    }
  }

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center min-h-[550px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500 border-r-2" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Configurações</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Gerencie as informações do estabelecimento e credenciais de pagamento.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* General Settings */}
        <div className="glass-panel rounded-2xl p-6 border border-neutral-800 bg-neutral-900/20 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-3 border-b border-neutral-800 pb-4 mb-6">
            <Building className="text-orange-500" size={20} />
            <h2 className="text-white font-bold text-lg">Informações Gerais</h2>
          </div>
          
          <div className="max-w-md">
            <Input
              label="Nome do Estabelecimento"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="Ex: Simple Order Pizzaria"
              required
            />
          </div>
        </div>

        {/* Mercado Pago Integration Settings */}
        <div className="glass-panel rounded-2xl p-6 border border-neutral-800 bg-neutral-900/20 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-3 border-b border-neutral-800 pb-4 mb-4">
            <ShieldCheck className="text-orange-500" size={20} />
            <h2 className="text-white font-bold text-lg">Integração Mercado Pago</h2>
          </div>
          
          <p className="text-neutral-450 text-xs leading-relaxed mb-6">
            Insira suas credenciais do Mercado Pago para habilitar o pagamento automático via PIX por QR Code. 
            Se deixadas em branco, o sistema rodará em <strong>Modo Demo (Simulação)</strong> de pagamento.
          </p>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5 w-full relative">
              <Input
                label="Access Token (Produção ou Teste)"
                type={showToken ? "text" : "password"}
                value={mercadoPagoAccessToken}
                onChange={(e) => setMercadoPagoAccessToken(e.target.value)}
                placeholder="APP_USR-..."
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3.5 top-[33px] text-neutral-500 hover:text-neutral-350 cursor-pointer"
              >
                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex flex-col gap-1.5 w-full relative">
              <Input
                label="Webhook Client Secret"
                type={showSecret ? "text" : "password"}
                value={mercadoPagoWebhookSecret}
                onChange={(e) => setMercadoPagoWebhookSecret(e.target.value)}
                placeholder="Sua chave secreta para validação"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3.5 top-[33px] text-neutral-500 hover:text-neutral-350 cursor-pointer"
              >
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        <ErrorMessage message={error || localError} />
        
        {success && (
          <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm animate-in fade-in duration-300">
            <CheckCircle size={16} />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end mt-2">
          <Button
            type="submit"
            loading={updating}
            variant="primary"
            className="w-full sm:w-auto px-8"
          >
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
