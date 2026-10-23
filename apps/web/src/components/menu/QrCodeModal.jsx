import { memo } from 'react';
import { generateQrCodeImageUrl } from '../../util/menuQrCode.js';

export const QrCodeModal = memo(function QrCodeModal({ isOpen, onClose, targetUrl, slug }) {
  if (!isOpen) return null;

  const qrImageUrl = generateQrCodeImageUrl(targetUrl, 260);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(targetUrl);
      alert('Link copiado com sucesso!');
    } catch {
      // Fallback simples
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 border border-[#e4ded4] dark:border-neutral-800 rounded-3xl p-6 max-w-sm w-full flex flex-col items-center text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-[#1c1917] dark:text-white mb-1">QR Code do Cardápio</h3>
        <p className="text-xs text-stone-500 dark:text-neutral-400 mb-5">
          {slug ? `Mesa / Identificador: ${slug}` : 'Acesse o cardápio público escaneando o código'}
        </p>

        <div className="bg-white p-3 rounded-2xl border border-[#e4ded4] dark:border-transparent shadow-inner mb-5">
          <img
            src={qrImageUrl}
            alt="QR Code do Cardápio"
            className="w-56 h-56 object-contain"
            loading="lazy"
          />
        </div>

        <div className="w-full flex flex-col gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full py-2.5 px-4 bg-[#eee9df] hover:bg-[#e5dfd3] text-[#1c1917] dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 rounded-xl text-sm font-medium transition duration-150 cursor-pointer"
          >
            Copiar Link Estável
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-medium transition duration-150 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
});
