import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, X, QrCode } from 'lucide-react';
import { usePublicMenu } from '../hooks/usePublicMenu.js';
import { PublicProductCard } from '../components/menu/PublicProductCard.jsx';
import { QrCodeModal } from '../components/menu/QrCodeModal.jsx';
import { getMenuCanonicalUrl } from '../util/menuQrCode.js';
import CategoryFilter from '../components/ui/CategoryFilter.jsx';

const CATEGORIES = ['FOOD', 'DRINK', 'SNACK', 'DESSERT', 'SIDE'];

export default function MenuPage() {
  const { slug } = useParams();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const {
    products,
    loading,
    error,
    category,
    search,
    setCategory,
    setSearch,
    refetch,
  } = usePublicMenu('');

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [products]);

  const canonicalUrl = useMemo(() => getMenuCanonicalUrl(slug), [slug]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-orange-500/30">
      {/* Header Público */}
      <header className="sticky top-0 z-40 bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800/80 px-4 py-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-orange-400 font-semibold">
              Cardápio Digital
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {slug ? `Mesa: ${slug.toUpperCase()}` : 'Nosso Cardápio'}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs sm:text-sm font-medium transition duration-150 cursor-pointer"
            title="Ver QR Code do Cardápio"
          >
            <QrCode size={16} className="text-orange-400" />
            <span>QR Code</span>
          </button>
        </div>

        {/* Filtros de Categoria e Campo de Busca (mesmo padrão do Admin e Waiter) */}
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CategoryFilter
            categories={CATEGORIES}
            selected={category}
            onChange={setCategory}
          />

          <div className="relative w-full md:max-w-xs select-none">
            <input
              type="text"
              placeholder="Buscar produto por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl py-2 pl-9 pr-8 text-xs outline-none focus:border-orange-500 transition-colors"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-neutral-500" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2 text-neutral-500 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Grid de Itens */}
      <section className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-neutral-900/60 rounded-2xl border border-neutral-800/50" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-neutral-400 text-sm mb-4">
              Não foi possível carregar o cardápio no momento.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-medium transition cursor-pointer"
            >
              Tentar novamente
            </button>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-neutral-900/10 rounded-2xl border border-dashed border-neutral-800">
            <p className="text-neutral-400 text-sm font-medium">
              Nenhum produto encontrado com os filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedProducts.map((product) => (
              <PublicProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Modal QR Code */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        targetUrl={canonicalUrl}
        slug={slug}
      />
    </main>
  );
}
