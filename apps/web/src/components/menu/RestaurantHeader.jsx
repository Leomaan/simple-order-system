import { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  Phone, 
  Share2, 
  Check, 
  QrCode, 
  MessageCircle,
  ExternalLink 
} from 'lucide-react';
import { restaurantConfig } from '../../config/restaurantInfo.js';

export function RestaurantHeader({ 
  customConfig = {}, 
  slug = '', 
  onOpenQrModal 
}) {
  const [copied, setCopied] = useState(false);
  const config = { ...restaurantConfig, ...customConfig };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: config.share?.title || config.name,
      text: config.share?.text || config.description,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Se o usuário cancelou o compartilhamento nativo, não faz nada
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: Copiar para área de transferência
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Se clipboard falhar, abre o modal de QR code como fallback visual
      if (onOpenQrModal) onOpenQrModal();
    }
  };

  return (
    <header className="w-full max-w-4xl mx-auto px-4 pt-6 pb-4 sm:pt-8 sm:pb-6">
      <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Glow decorativo de fundo */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-6 relative z-10">
          {/* Informações Principais */}
          <div className="flex-1 min-w-0">
            {/* Status Aberto/Fechado + Horários */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  config.isOpen
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    config.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                />
                {config.isOpen ? config.statusOpenText : config.statusClosedText}
              </span>

              {/* Horário ao lado do status */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <Clock size={13} className="text-orange-400 shrink-0" />
                <span>{config.hours}</span>
              </div>
            </div>

            {/* Nome do Restaurante */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {config.name}
            </h1>

            {/* Mesa (se aplicável) */}
            {slug && (
              <div className="mt-1 inline-block">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-lg border border-orange-500/20">
                  Mesa {slug.toUpperCase()}
                </span>
              </div>
            )}

            {/* Descrição */}
            {config.description && (
              <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed max-w-xl">
                {config.description}
              </p>
            )}

            {/* Linha de Endereço (abaixo do horário) */}
            {config.address && (
              <div className="mt-3.5 flex items-center gap-2 text-xs sm:text-sm text-neutral-300">
                <MapPin size={14} className="text-orange-400 shrink-0" />
                {config.mapsUrl ? (
                  <a
                    href={config.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-orange-400 transition-colors underline-offset-2 hover:underline truncate"
                  >
                    {config.address}
                  </a>
                ) : (
                  <span className="truncate">{config.address}</span>
                )}
              </div>
            )}

            {/* Telefone e Ações de Contato / Compartilhar */}
            <div className="mt-4 pt-4 border-t border-neutral-800/80 flex flex-wrap items-center gap-3">
              {/* Telefone / WhatsApp */}
              {config.phone && (
                <a
                  href={`tel:${config.phoneRaw || config.phone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 hover:text-white transition-colors"
                >
                  <Phone size={13} className="text-orange-400" />
                  <span>{config.phone}</span>
                </a>
              )}

              {config.whatsapp && (
                <a
                  href={`https://wa.me/${config.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950/80 border border-neutral-800 hover:border-emerald-600/50 text-xs text-neutral-300 hover:text-emerald-400 transition-colors"
                  title="Falar no WhatsApp"
                >
                  <MessageCircle size={13} className="text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              )}

              {/* Botão Compartilhar Cardápio */}
              <button
                type="button"
                onClick={handleShare}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  copied
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20'
                }`}
                title="Compartilhar este cardápio"
              >
                {copied ? <Check size={13} /> : <Share2 size={13} />}
                <span>{copied ? 'Link copiado!' : 'Compartilhar cardápio'}</span>
              </button>

              {/* Botão QR Code */}
              {onOpenQrModal && (
                <button
                  type="button"
                  onClick={onOpenQrModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Abrir QR Code"
                >
                  <QrCode size={13} className="text-orange-400" />
                  <span>QR Code</span>
                </button>
              )}
            </div>
          </div>

          {/* Foto à Direita */}
          {config.photoUrl && (
            <div className="shrink-0 self-center sm:self-start">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-neutral-800 shadow-xl bg-neutral-950 relative group">
                <img
                  src={config.photoUrl}
                  alt={config.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="eager"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
