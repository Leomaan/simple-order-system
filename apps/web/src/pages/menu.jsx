import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePublicMenu } from '../hooks/usePublicMenu.js';
import { RestaurantHeader } from '../components/menu/RestaurantHeader.jsx';
import { CategoryNav } from '../components/menu/CategoryNav.jsx';
import { ProductCategorySection } from '../components/menu/ProductCategorySection.jsx';
import { QrCodeModal } from '../components/menu/QrCodeModal.jsx';
import { getMenuCanonicalUrl } from '../util/menuQrCode.js';
import { useScrollSpy } from '../hooks/useScrollSpy.js';

const CATEGORIES = ['FOOD', 'DRINK', 'SNACK', 'DESSERT', 'SIDE'];

export default function MenuPage() {
  const { slug } = useParams();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const {
    products,
    loading,
    error,
    search,
    setSearch,
    refetch,
  } = usePublicMenu('');

  // Agrupa os produtos disponíveis por categoria
  const productsByCategory = useMemo(() => {
    const map = {};
    for (const cat of CATEGORIES) {
      map[cat] = [];
    }

    const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    for (const prod of sorted) {
      if (!map[prod.category]) {
        map[prod.category] = [];
      }
      map[prod.category].push(prod);
    }

    return map;
  }, [products]);

  // Lista de categorias que possuem pelo menos 1 produto ativo
  const availableCategories = useMemo(() => {
    return CATEGORIES.filter((cat) => productsByCategory[cat]?.length > 0);
  }, [productsByCategory]);

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
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-orange-500/30">
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
            <div className="h-7 w-48 bg-neutral-900/80 rounded-xl mb-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-full h-28 bg-neutral-900/60 rounded-2xl border border-neutral-800/50 p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-20 h-20 bg-neutral-800/60 rounded-xl shrink-0" />
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                      <div className="h-4 bg-neutral-800/80 rounded-md w-3/4" />
                      <div className="h-3 bg-neutral-800/40 rounded-md w-full" />
                      <div className="h-3 bg-neutral-800/40 rounded-md w-1/2" />
                    </div>
                  </div>
                  <div className="w-16 h-5 bg-neutral-800/80 rounded-md shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          /* Estado de Erro */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-neutral-400 text-sm mb-4">
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
          <div className="flex flex-col items-center justify-center py-20 text-center bg-neutral-900/20 rounded-3xl border border-dashed border-neutral-800 p-8">
            <p className="text-neutral-300 font-medium mb-1">
              Nenhum produto encontrado
            </p>
            <p className="text-neutral-500 text-xs mb-4">
              {search
                ? `Não encontramos itens que correspondam a "${search}".`
                : 'Não há itens disponíveis no momento.'}
            </p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold transition cursor-pointer"
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
              />
            ))}
          </div>
        )}
      </div>

      {/* Rodapé sutil */}
      <footer className="mt-auto border-t border-neutral-900 py-6 text-center text-xs text-neutral-600">
        <p>Simple Order • Cardápio Digital</p>
      </footer>

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
