import Header from "../components/Header";
import FilterCard from "../components/FilterCard";
import Footer from "../components/Footer";
import CardProperty from "../components/CardProperty";
import SkeletonCard from "../components/SkeletonCard";
import { useEffect, useState, useRef, useCallback } from "react";
import { FaArrowUp } from "react-icons/fa";
import { listImoveis } from "../services/imovelService";
import { session } from "../utils/storage";

const PAGE_SIZE = 12;
const SESSION_KEY = "bretas_home_state";
const FROM_DETAIL_KEY = "cameFromDetail";

// Limite de páginas mantidas em memória no cache de prefetch.
// Sem isso, uma navegação longa acumularia imagens em base64 indefinidamente.
const MAX_PREFETCH_PAGES = 2;

function Home() {
  const [showExtra, setShowExtra] = useState(false);
  const [properties, setProperties] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(null);

  // isLoading   → carregamento inicial (skeletons no lugar dos cards)
  // isFiltering → filtro aplicado (FilterCard segue montado, estado intacto)
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const [activeFilter, setActiveFilter] = useState(null);

  const sentinelRef = useRef(null);
  const prefetchCache = useRef({}); // { [pageNumber]: { items, total } }
  const pendingScrollY = useRef(null);

  // ── Persistência do estado de navegação ───────────────────────────────────
  // IMPORTANTE: aqui vai APENAS estado leve — página, filtro e scroll.
  // Nunca gravar `properties`, que carrega imagens em base64 e estoura a quota
  // do sessionStorage (era exatamente o que derrubava a página).
  useEffect(() => {
    if (isLoading || properties.length === 0) return;
    session.setJSON(SESSION_KEY, {
      page,
      activeFilter,
      scrollY: window.scrollY,
    });
  }, [page, activeFilter, properties.length, isLoading]);

  // Salva a posição de scroll ao sair da página (o efeito acima só dispara
  // quando página/filtro mudam, e rolar não muda nenhum dos dois).
  useEffect(() => {
    const saveScroll = () => {
      if (isLoading || properties.length === 0) return;
      session.setJSON(SESSION_KEY, {
        page,
        activeFilter,
        scrollY: window.scrollY,
      });
    };
    window.addEventListener("pagehide", saveScroll);
    return () => {
      window.removeEventListener("pagehide", saveScroll);
      saveScroll();
    };
  }, [page, activeFilter, properties.length, isLoading]);

  // ── Prefetch silencioso da próxima página ─────────────────────────────────
  const prefetchPage = useCallback(async (nextPage, filter) => {
    if (prefetchCache.current[nextPage]) return;
    try {
      const result = await listImoveis(filter, nextPage, PAGE_SIZE);
      const keys = Object.keys(prefetchCache.current);
      if (keys.length >= MAX_PREFETCH_PAGES) {
        delete prefetchCache.current[keys[0]];
      }
      prefetchCache.current[nextPage] = result;
    } catch {
      // Prefetch é best-effort — falhar aqui não afeta o usuário.
    }
  }, []);

  // Decide se ainda há mais páginas. Com `total` a conta é exata; sem ele
  // (API antiga), cai no palpite pelo tamanho do lote.
  const computeHasMore = useCallback((loadedCount, totalCount, batchSize) => {
    if (typeof totalCount === "number") return loadedCount < totalCount;
    return batchSize === PAGE_SIZE;
  }, []);

  // ── Carregamento inicial / restauração ao voltar do detalhe ───────────────
  useEffect(() => {
    const cameFromDetail = session.get(FROM_DETAIL_KEY) === "true";
    session.remove(FROM_DETAIL_KEY);

    const saved = cameFromDetail ? session.getJSON(SESSION_KEY) : null;

    // Ao restaurar, refaz UMA requisição com limit = páginas já vistas.
    // A ordenação do backend é estável (ORDER BY id DESC), então os itens
    // voltam idênticos — sem precisar guardar nada pesado no storage.
    const restoredPage = saved?.page > 0 ? saved.page : 1;
    const restoredFilter = saved?.activeFilter || null;

    if (!saved) {
      session.remove(SESSION_KEY);
      window.scrollTo({ top: 0, behavior: "instant" });
    } else {
      pendingScrollY.current = saved.scrollY || 0;
      setActiveFilter(restoredFilter);
      setPage(restoredPage);
    }

    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError(false);

        const { items, total: totalCount } = await listImoveis(
          restoredFilter,
          1,
          restoredPage * PAGE_SIZE
        );
        if (cancelled) return;

        setProperties(items);
        setTotal(totalCount);

        const more = computeHasMore(items.length, totalCount, items.length);
        setHasMore(more);

        // Se a restauração trouxe menos itens do que o esperado (imóveis
        // removidos nesse meio-tempo), reajusta a página para não pular lotes.
        const realPage = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
        setPage(realPage);

        if (more) prefetchPage(realPage + 1, restoredFilter);
      } catch (err) {
        if (cancelled) return;
        console.error("Erro ao pegar imóveis:", err);
        setProperties([]);
        setHasMore(false);
        setLoadError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // Executa uma única vez, na montagem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Restaura a posição de scroll depois que os cards entram no DOM ────────
  useEffect(() => {
    if (isLoading || pendingScrollY.current === null) return;
    const y = pendingScrollY.current;
    pendingScrollY.current = null;
    const timer = setTimeout(() => window.scrollTo({ top: y }), 80);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // ── Carrega a próxima página ──────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading || isFiltering) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      let result;
      if (prefetchCache.current[nextPage]) {
        result = prefetchCache.current[nextPage];
        delete prefetchCache.current[nextPage];
      } else {
        result = await listImoveis(activeFilter, nextPage, PAGE_SIZE);
      }

      const { items, total: totalCount } = result;

      if (items.length === 0) {
        setHasMore(false);
        return;
      }

      let loadedCount = 0;
      setProperties((prev) => {
        // Protege contra duplicatas caso um imóvel entre/saia entre as páginas.
        const seen = new Set(prev.map((p) => p.ind));
        const novos = items.filter((p) => !seen.has(p.ind));
        loadedCount = prev.length + novos.length;
        return novos.length > 0 ? [...prev, ...novos] : prev;
      });

      setPage(nextPage);
      if (typeof totalCount === "number") setTotal(totalCount);

      const more = computeHasMore(loadedCount, totalCount, items.length);
      setHasMore(more);
      if (more) prefetchPage(nextPage + 1, activeFilter);
    } catch (err) {
      console.error("Erro ao carregar mais:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    hasMore,
    isLoading,
    isFiltering,
    page,
    activeFilter,
    prefetchPage,
    computeHasMore,
  ]);

  // ── IntersectionObserver (rolagem infinita) ───────────────────────────────
  useEffect(() => {
    if (isLoading) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, isLoading]);

  // ── Filtro aplicado pelo FilterCard ───────────────────────────────────────
  const recieveFilterProperties = async (filtro) => {
    prefetchCache.current = {};
    setIsFiltering(true);
    setLoadError(false);
    setActiveFilter(filtro);
    try {
      const { items, total: totalCount } = await listImoveis(
        filtro,
        1,
        PAGE_SIZE
      );
      setProperties(items);
      setTotal(totalCount);
      setPage(1);
      const more = computeHasMore(items.length, totalCount, items.length);
      setHasMore(more);
      if (more) prefetchPage(2, filtro);
    } catch (err) {
      console.error("Erro ao filtrar:", err);
      setProperties([]);
      setHasMore(false);
      setLoadError(true);
    } finally {
      setIsFiltering(false);
    }
  };

  // ── Botão "Voltar ao topo" ────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setShowExtra(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToFilters = () => {
    setShowExtra(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showSkeletons = isLoading || isFiltering;

  return (
    <>
      <Header />

      {showExtra && (
        <div className="max-[710px]:flex hidden justify-center fixed top-4 z-50 w-full">
          <button
            onClick={scrollToFilters}
            className="bg-[#80703c] text-white text-center py-2 px-6 rounded-full font-bold shadow-md align-middle"
          >
            <FaArrowUp className="inline-block mr-2" />
            Voltar aos Filtros
          </button>
        </div>
      )}

      <div className="bg-[#F3F3F3] grid grid-cols-[400px_3fr] max-[870px]:grid-cols-1 p-4 pb-28">
        {/* FilterCard SEMPRE visível — nunca desmontado */}
        <div className="sticky top-4 self-start max-[870px]:static max-[710px]:mb-8">
          <FilterCard admin={false} onFilter={recieveFilterProperties} />
        </div>

        <div className="space-y-1 items-center justify-center text-center">
          <h2 className="text-3xl mb-4 title">Destaques</h2>

          {!showSkeletons && !loadError && typeof total === "number" && total > 0 && (
            <p className="text-gray-500 text-sm mb-4">
              {total} {total === 1 ? "imóvel encontrado" : "imóveis encontrados"}
            </p>
          )}

          {showSkeletons ? (
            <div className="flex flex-wrap gap-4 justify-center items-center">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                Não conseguimos carregar os imóveis
              </h2>
              <p className="text-gray-500 mb-6">
                Verifique sua conexão e tente novamente.
              </p>
              <button
                onClick={() => recieveFilterProperties(activeFilter)}
                className="bg-[#80703c] text-white py-2 px-6 rounded-full font-bold shadow-md hover:bg-[#6b5e33] transition"
              >
                Tentar novamente
              </button>
            </div>
          ) : properties.length === 0 ? (
            /* Sem resultados — FilterCard continua visível ao lado */
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                Nenhum imóvel encontrado
              </h2>
              <p className="text-gray-500">Tente ajustar os filtros ao lado.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-4 justify-center items-center">
                {properties.map((property) => (
                  <CardProperty key={property.ind} property={property} />
                ))}
              </div>

              {/* Sentinela da rolagem infinita */}
              <div ref={sentinelRef} className="h-4 w-full" />

              {isLoadingMore && (
                <div className="flex flex-wrap gap-4 justify-center items-center mt-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {!hasMore && (
                <p className="text-gray-400 text-sm py-6">
                  ✅ Todos os imóveis foram carregados.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Home;
