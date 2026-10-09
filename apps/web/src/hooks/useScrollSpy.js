import { useState, useEffect, useRef } from 'react';

/**
 * Hook customizado para monitorar seções visíveis na tela (ScrollSpy)
 * e sincronizar com o menu de navegação de categorias.
 *
 * @param {string[]} sectionIds - Lista de IDs das seções para observar
 * @param {number} offsetTop - Deslocamento para compensar barras de navegação fixas (padrão: 120)
 * @returns {{ activeId: string, scrollToSection: (id: string) => void }}
 */
export function useScrollSpy(sectionIds = [], offsetTop = 120) {
  const [activeId, setActiveId] = useState(sectionIds[0] || '');
  const isClickScrolling = useRef(false);
  const clickTimeout = useRef(null);

  useEffect(() => {
    if (!sectionIds.length) return;

    function handleScroll() {
      if (isClickScrolling.current) return;

      const scrollPosition = window.scrollY + offsetTop;

      // Percorre as seções de baixo para cima para encontrar a seção ativa mais relevante
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const element = document.getElementById(id);
        if (element) {
          const elementTop = element.offsetTop;
          if (scrollPosition >= elementTop - 20) {
            setActiveId(id);
            return;
          }
        }
      }

      // Se estiver acima da primeira seção
      if (sectionIds.length > 0) {
        setActiveId(sectionIds[0]);
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Checa inicialmente

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (clickTimeout.current) clearTimeout(clickTimeout.current);
    };
  }, [sectionIds, offsetTop]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (!element) return;

    setActiveId(id);
    isClickScrolling.current = true;

    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const targetPosition = Math.max(0, elementPosition - offsetTop + 10);

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    });

    if (clickTimeout.current) clearTimeout(clickTimeout.current);
    clickTimeout.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 700);
  };

  return { activeId, scrollToSection };
}
