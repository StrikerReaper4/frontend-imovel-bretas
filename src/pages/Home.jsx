import Header from "../components/Header";
import FilterCard from "../components/FilterCard";
import Footer from "../components/Footer";
import CardProperty from "../components/CardProperty";
import SkeletonCard from "../components/SkeletonCard";
import { useEffect, useState, useRef, useCallback } from "react";
import { FaArrowUp } from "react-icons/fa";
import { getImoveis, filterImoveis } from "../services/imovelService";
import Loading from "../components/Loading";

const PAGE_SIZE = 10;
const SESSION_KEY = "bretas_home_state";

function Home() {
  const [showExtra, setShowExtra] = useState(false);
  const [properties, setProperties] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // isLoading   → só para o carregamento INICIAL (exibe <Loading /> fullscreen)
  // isFiltering → quando o filtro é aplicado (skeleton no lugar dos cards,
  //               FilterCard permanece montado com estado visual intacto)
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [activeFilter, setActiveFilter] = useState(null);

  const sentinelRef = useRef(null);
  const prefetchCache = useRef({}); // { [pageNumber]: [...items] }
  const pendingScrollY = useRef(null); // posição de scroll a restaurar

  // ── Salva estado no sessionStorage sempre que muda ─────────────────────────
  useEffect(() => {
    if (!isLoading && properties.length > 0) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ properties, page, hasMore, activeFilter, scrollY: window.scrollY })
      );
    }
  }, [properties, page, hasMore, activeFilter, isLoading]);

  // ── Prefetch silencioso da próxima página ──────────────────────────────────
  const prefetchPage = useCallback(
    async (nextPage, filter) => {
      if (prefetchCache.current[nextPage]) return; // já prefetched
      try {
        const data = filter
          ? await filterImoveis(filter, nextPage, PAGE_SIZE)
          : await getImoveis(nextPage, PAGE_SIZE);
        prefetchCache.current[nextPage] = data;
      } catch (_) {
        // silencioso — prefetch é best-effort
      }
    },
    []
  );

  // ── Carregamento inicial ou restauração de estado ──────────────────────────
  useEffect(() => {
    const cameFromDetail = sessionStorage.getItem("cameFromDetail") === "true";

    if (cameFromDetail) {
      // Volta da página de detalhe — restaura estado salvo
      sessionStorage.removeItem("cameFromDetail");
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        try {
          const state = JSON.parse(saved);
          setProperties(state.properties || []);
          setPage(state.page || 1);
          setHasMore(state.hasMore ?? false);
          setActiveFilter(state.activeFilter || null);
          pendingScrollY.current = state.scrollY || 0;
          setIsLoading(false);
          return; // não faz fetch novo
        } catch (_) {}
      }
    }

    // Carga normal (primeira visita ou reload)
    sessionStorage.removeItem(SESSION_KEY);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchFirst = async () => {
      try {
        setIsLoading(true);
        const data = await getImoveis(1, PAGE_SIZE);
        setProperties(Array.isArray(data) ? data : []);
        setHasMore(data.length === PAGE_SIZE);
        setPage(1);
        // Prefetch página 2 em background
        if (data.length === PAGE_SIZE) prefetchPage(2, null);
      } catch (err) {
        console.error("Erro ao pegar imóveis:", err);
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFirst();
  }, []);

  // ── Restaura posição de scroll após renderizar os cards ────────────────────
  useEffect(() => {
    if (!isLoading && pendingScrollY.current !== null) {
      const y = pendingScrollY.current;
      pendingScrollY.current = null;
      // setTimeout garante que todos os cards já estejam no DOM
      setTimeout(() => window.scrollTo({ top: y, behavior: "instant" }), 80);
    }
  }, [isLoading]);

  // ── Carrega mais imóveis (próxima página) ─────────────────────────────────
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      let data;

      // Usa cache de prefetch se disponível — resposta instantânea
      if (prefetchCache.current[nextPage]) {
        data = prefetchCache.current[nextPage];
        delete prefetchCache.current[nextPage];
      } else {
        data = activeFilter
          ? await filterImoveis(activeFilter, nextPage, PAGE_SIZE)
          : await getImoveis(nextPage, PAGE_SIZE);
      }

      if (data.length === 0) {
        setHasMore(false);
      } else {
        setProperties((prev) => [...prev, ...data]);
        setPage(nextPage);
        const more = data.length === PAGE_SIZE;
        setHasMore(more);
        // Prefetch a página seguinte em background
        if (more) prefetchPage(nextPage + 1, activeFilter);
      }
    } catch (err) {
      console.error("Erro ao carregar mais:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, activeFilter, prefetchPage]);

  // ── IntersectionObserver ──────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore, isLoading]);

  // ── Filtro aplicado pelo FilterCard ───────────────────────────────────────
  const recieveFilterProperties = async (filtro) => {
    try {
      prefetchCache.current = {}; // limpa cache ao trocar filtro
      setIsFiltering(true);
      setActiveFilter(filtro);
      const data = await filterImoveis(filtro, 1, PAGE_SIZE);
      setProperties(Array.isArray(data) ? data : []);
      setHasMore(data.length === PAGE_SIZE);
      setPage(1);
      // Prefetch página 2 do novo filtro
      if (data.length === PAGE_SIZE) prefetchPage(2, filtro);
    } catch (err) {
      console.error("Erro ao filtrar:", err);
    } finally {
      setIsFiltering(false);
    }
  };

  // ── Botão "Voltar ao topo" ────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setShowExtra(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToFilters = () => {
    setShowExtra(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Carregamento inicial ───────────────────────────────────────────────────
  if (isLoading) return <Loading />;

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

          {isFiltering ? (
            /* Skeleton durante filtragem */
            <div className="flex flex-wrap gap-4 justify-center items-center">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : properties.length === 0 ? (
            /* Sem resultados — FilterCard continua visível ao lado */
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                Nenhum imóvel encontrado
              </h2>
              <p className="text-gray-500">
                Tente ajustar os filtros ao lado.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-4 justify-center items-center">
                {properties.map((property, index) => (
                  <CardProperty
                    key={`${property.ind}-${index}`}
                    property={property}
                  />
                ))}
              </div>

              {/* Sentinela */}
              <div ref={sentinelRef} className="h-4 w-full" />

              {/* Skeleton de "carregando mais" — no lugar do spinner */}
              {isLoadingMore && (
                <div className="flex flex-wrap gap-4 justify-center items-center mt-2">
                  {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {/* Fim da lista */}
              {!hasMore && properties.length > 0 && (
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
