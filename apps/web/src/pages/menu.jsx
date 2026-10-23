import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { usePublicMenu } from '../hooks/usePublicMenu.js';
import { useCart } from '../hooks/useCart.js';
import { RestaurantHeader } from '../components/menu/RestaurantHeader.jsx';
import { CategoryNav } from '../components/menu/CategoryNav.jsx';
import { ProductCategorySection } from '../components/menu/ProductCategorySection.jsx';
import { QrCodeModal } from '../components/menu/QrCodeModal.jsx';
import CartModal from '../components/menu/CartModal.jsx';
import { getMenuCanonicalUrl } from '../util/menuQrCode.js';
import { useScrollSpy } from '../hooks/useScrollSpy.js';
import { ShoppingBag } from 'lucide-react';

export default function MenuPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get('mesa') || searchParams.get('table') || '';

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const {
    products,
    company,
    customCategories,
    loading,
    error,
    search,
    setSearch,
    refetch,
  } = usePublicMenu('', slug);

  const {
    cart,
    total,
    totalItems,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart(slug, tableParam);

  // Lista dinâmica de categorias definidas pela empresa (ou fallback dos produtos)
  const categoryKeys = useMemo(() => {
    if (customCategories && customCategories.length > 0) {
      return customCategories.map((c) => c.name);
    }
    const extracted = [...new Set(products.map((p) => p.category).filter(Boolean))];
    return extracted.length > 0 ? extracted : ['Geral'];
  }, [customCategories, products]);

  // Agrupa os produtos disponíveis pelas categorias da empresa
  const productsByCategory = useMemo(() => {
    const map = {};
    for (const cat of categoryKeys) {
      map[cat] = [];
    }

    const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    for (const prod of sorted) {
      const targetCategory = prod.category || 'Geral';
      if (!map[targetCategory]) {
        map[targetCategory] = [];
      }
      map[targetCategory].push(prod);
    }

    return map;
  }, [categoryKeys, products]);

  // Lista de categorias que possuem pelo menos 1 produto ativo
  const availableCategories = useMemo(() => {
    return categoryKeys.filter((cat) => productsByCategory[cat]?.length > 0);
  }, [categoryKeys, productsByCategory]);

  // IDs das seções para o ScrollSpy
  const sectionIds = useMemo(() => {
    return availableCategories.map((cat) => `category-${cat}`);
  }, [availableCategories]);

  // ScrollSpy para monitorar e selecionar a categoria conforme o usuário desce a página
  const { activeId, scrollToSection } = useScrollSpy(sectionIds, 120);
  const activeCategory = activeId ? activeId.replace('category-', '') : availableCategories[0] || '';

  // Contagem de itens por categoria para exibição no menu de categorias
  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const cat of availableCategories) {
      counts[cat] = productsByCategory[cat]?.length || 0;
    }
    return counts;
  }, [availableCategories, productsByCategory]);

  const canonicalUrl = useMemo(() => getMenuCanonicalUrl(slug), [slug]);

  const handleSelectCategory = (cat) => {
    scrollToSection(`category-${cat}`);
  };

  return (
    <main className="min-h-screen bg-[#f7f4ee] dark:bg-[#121215] text-[#1c1917] dark:text-[#ececf0] flex flex-col selection:bg-orange-500/30 transition-colors">
      {/* 1. Topo Centralizado: Informações do Restaurante */}
      <RestaurantHeader
        slug={slug}
        onOpenQrModal={() => setIsQrModalOpen(true)}
      />

      {/* 2. Menu de Categorias Sticky (com seleção automática por rolagem) */}
      {!loading && !error && availableCategories.length > 0 && (
        <CategoryNav
          categories={availableCategories}
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          search={search}
          onSearchChange={setSearch}
          counts={categoryCounts}
        />
      )}

      {/* 3. Seção Principal com Todos os Produtos Agrupados por Categoria */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8">
        {loading ? (
          /* Esqueletos de carregamento no formato horizontal */
          <div className="flex flex-col gap-4 animate-pulse">
            <div className="h-7 w-48 bg-[#e5dfd3] dark:bg-neutral-900/80 rounded-xl mb-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-full h-28 bg-white dark:bg-neutral-900/60 rounded-2xl border border-[#e4ded4] dark:border-neutral-800/50 p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-20 h-20 bg-[#eee9df] dark:bg-neutral-800/60 rounded-xl shrink-0" />
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="h-4 bg-[#e5dfd3] dark:bg-neutral-800/80 rounded-md w-3/4" />
                      <div className="h-3 bg-[#eee9df] dark:bg-neutral-800/40 rounded-md w-full" />
                      <div className="h-3 bg-[#eee9df] dark:bg-neutral-800/40 rounded-md w-1/2" />
                    </div>
                  </div>
                  <div className="w-16 h-5 bg-[#e5dfd3] dark:bg-neutral-800/80 rounded-md shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          /* Estado de Erro */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-stone-600 dark:text-neutral-400 text-sm mb-4">
              Não foi possível carregar o cardápio no momento.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-medium transition cursor-pointer shadow-lg shadow-orange-600/20"
            >
              Tentar novamente
            </button>
          </div>
        ) : products.length === 0 ? (
          /* Estado de Nenhum Produto Encontrado (busca ou vazio) */
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-neutral-900/20 rounded-3xl border border-dashed border-[#d8d2c4] dark:border-neutral-800 p-8">
            <p className="text-[#1c1917] dark:text-neutral-300 font-medium mb-1">
              Nenhum produto encontrado
            </p>
            <p className="text-stone-500 dark:text-neutral-500 text-xs mb-4">
              {search
                ? `Não encontramos itens que correspondam a "${search}".`
                : 'Não há itens disponíveis no momento.'}
            </p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="px-4 py-2 bg-[#eee9df] hover:bg-[#e5dfd3] text-[#1c1917] dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          /* Listagem Contínua de Todas as Categorias e Produtos */
          <div className="flex flex-col gap-8">
            {availableCategories.map((cat) => (
              <ProductCategorySection
                key={cat}
                categoryKey={cat}
                products={productsByCategory[cat]}
                onAddToCart={(product) => addItem(product, 1)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Botão Flutuante do Carrinho */}
      {totalItems > 0 && (
        <aside aria-label="Ações do carrinho" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md animate-in slide-in-from-bottom-5">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-4 px-5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-2xl flex items-center justify-between shadow-2xl shadow-orange-600/40 border border-orange-400/30 active:scale-98 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-black/20 flex items-center justify-center text-xs font-black">
                {totalItems}
              </span>
              <span className="text-sm">Ver Pedido</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base font-black">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
              </span>
              <ShoppingBag className="w-5 h-5 opacity-80" />
            </div>
          </button>
        </aside>
      )}

      {/* Rodapé sutil */}
      <footer className="mt-auto border-t border-[#e4ded4] dark:border-neutral-900 py-6 text-center text-xs text-stone-500 dark:text-neutral-600 pb-24 sm:pb-6">
        <p>{company?.name || 'Simple Order'} • Cardápio Digital</p>
      </footer>

      {/* Modal QR Code */}
      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        targetUrl={canonicalUrl}
        slug={slug}
      />

      {/* Modal do Carrinho */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        total={total}
        totalItems={totalItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
        tableNumber={tableParam}
        companySlug={slug}
      />
    </main>
  );
}
