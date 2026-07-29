import Header from "../components/Header";
import FilterCard from "../components/FilterCard";
import Footer from "../components/Footer";
import CardProperty from "../components/CardProperty";
import { useEffect, useState, useRef, useCallback } from "react";
import { FaArrowUp } from "react-icons/fa";
import { getImoveis, filterImoveis } from "../services/imovelService";
import Loading from "../components/Loading";

const PAGE_SIZE = 20;

function Home() {
  const [showExtra, setShowExtra] = useState(false);
  const [properties, setProperties] = useState([]);
  const [page, setPage] = useState(1);

  // CORREÇÃO: inicia como FALSE para garantir que o setHasMore(true)
  // após o fetch dispare uma mudança de estado real e recrie o observer
  const [hasMore, setHasMore] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

  const sentinelRef = useRef(null);

  // ── Busca inicial (página 1, sem filtro) ──────────────────────────────────
  useEffect(() => {
    const fetchFirst = async () => {
      try {
        setIsLoading(true);
        const data = await getImoveis(1, PAGE_SIZE);
        setProperties(Array.isArray(data) ? data : []);
        setHasMore(data.length === PAGE_SIZE); // true se veio 20 = há mais
        setPage(1);
      } catch (err) {
        console.error("Erro ao pegar imóveis:", err);
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFirst();
  }, []);

  // ── Carrega mais imóveis (próxima página) ─────────────────────────────────
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = activeFilter
        ? await filterImoveis(activeFilter, nextPage, PAGE_SIZE)
        : await getImoveis(nextPage, PAGE_SIZE);

      if (data.length === 0) {
        setHasMore(false);
      } else {
        setProperties((prev) => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error("Erro ao carregar mais imóveis:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, activeFilter]);

  // ── IntersectionObserver ──────────────────────────────────────────────────
  // CORREÇÃO: adicionado `isLoading` nas dependências.
  // O observer só é criado DEPOIS que o carregamento inicial termina,
  // garantindo que o sentinelRef.current já existe no DOM.
  useEffect(() => {
    if (isLoading) return; // aguarda o carregamento inicial terminar

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
      setIsLoading(true);
      setActiveFilter(filtro);
      const data = await filterImoveis(filtro, 1, PAGE_SIZE);
      setProperties(Array.isArray(data) ? data : []);
      setHasMore(data.length === PAGE_SIZE);
      setPage(1);
    } catch (err) {
      console.error("Erro ao filtrar:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Botão "Voltar ao topo" ────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setShowExtra(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToFilters = () => {
    setShowExtra(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Estados de UI ─────────────────────────────────────────────────────────
  if (isLoading) return <Loading />;

  if (!isLoading && properties.length === 0)
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">
            Nenhum imóvel encontrado
          </h2>
          <p className="text-gray-500 mb-8">
            Tente ajustar os filtros ou cadastrar um novo imóvel.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#80703c] text-white py-2 px-6 rounded-full font-bold shadow-md"
          >
            Recarregar Página
          </button>
        </div>
        <Footer />
      </>
    );

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
        <div className="sticky top-4 self-start max-[870px]:static max-[710px]:mb-8">
          <FilterCard admin={false} onFilter={recieveFilterProperties} />
        </div>

        <div className="space-y-1 items-center justify-center text-center">
          <h2 className="text-3xl mb-4 title">Destaques</h2>

          <div className="flex flex-wrap gap-4 justify-center items-center">
            {properties.map((property, index) => (
              <CardProperty key={`${property.ind}-${index}`} property={property} />
            ))}
          </div>

          {/* Sentinela — o IntersectionObserver monitora este elemento */}
          <div ref={sentinelRef} className="h-4 w-full" />

          {/* Spinner */}
          {isLoadingMore && (
            <div className="flex justify-center items-center py-6">
              <div className="w-8 h-8 border-4 border-[#80703c] border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-500 font-medium">
                Carregando mais imóveis...
              </span>
            </div>
          )}

          {/* Fim da lista */}
          {!hasMore && properties.length > 0 && (
            <p className="text-gray-400 text-sm py-6">
              ✅ Todos os imóveis foram carregados.
            </p>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Home;
