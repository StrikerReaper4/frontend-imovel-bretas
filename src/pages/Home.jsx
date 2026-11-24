import { useEffect, useState, useRef, useCallback } from "react";
import {
  FaArrowUp,
  FaArrowLeft,
  FaArrowRight,
  FaWhatsapp,
} from "react-icons/fa";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import BarraBusca from "../components/BarraBusca";
import CardProperty from "../components/CardProperty";
import SkeletonCard from "../components/SkeletonCard";
import Button from "../components/Button";
import Revelar, { TituloLinhas } from "../components/Revelar";
import { listImoveis } from "../services/imovelService";
import { session } from "../utils/storage";
import {
  useArrastar,
  useLuzDoCursor,
  useParallax,
  useRolou,
} from "../utils/motion";

const PAGE_SIZE = 12;
const SESSION_KEY = "bretas_home_state";
const FROM_DETAIL_KEY = "cameFromDetail";

// Limite de páginas mantidas em memória no cache de prefetch.
// Sem isso, uma navegação longa acumularia imagens em base64 indefinidamente.
const MAX_PREFETCH_PAGES = 2;

// Quantos imóveis abrem a lista em formato de prancha, antes da grade.
const PRANCHAS = 2;

const GRADE =
  "grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-8 gap-y-16 max-[700px]:gap-y-12";

const PRACAS = [
  {
    pais: "Brasil",
    praças: "Campo Grande, São Paulo e litoral",
    nota: "Casas em condomínio, apartamentos e terrenos prontos para construir.",
    flag: "/Bandeira_Brasil.png",
    img: "/placeholder_house.jpg",
  },
  {
    pais: "Estados Unidos",
    praças: "Flórida e Nova York",
    nota: "Compra para morar ou para rentabilizar, com apoio em câmbio e documentação.",
    flag: "/Bandeira_EUA.png",
    img: "/placeholder_house_3.png",
  },
  {
    pais: "Portugal",
    praças: "Lisboa, Porto e Algarve",
    nota: "Imóveis no centro histórico e na costa, acompanhados por corretor local.",
    flag: "/Bandeira_Portugal.png",
    img: "/placeholder_house_2.jpg",
  },
];

const PASSOS = [
  {
    titulo: "Você diz o que procura",
    texto: "Cidade, faixa de preço e o que não pode faltar no imóvel.",
  },
  {
    titulo: "Um corretor da Bretas Imóveis visita",
    texto: "Fotos e informações do imóvel real, feitas por quem foi até lá.",
  },
  {
    titulo: "A gente acompanha o resto",
    texto: "Documentação, câmbio e escritura, com apoio de parceiros locais.",
  },
];

function Home() {
  const [properties, setProperties] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(null);

  // isLoading   → carregamento inicial (esqueletos no lugar dos imóveis)
  // isFiltering → filtro aplicado (a barra segue montada, estado intacto)
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const [activeFilter, setActiveFilter] = useState(null);

  const navigate = useNavigate();
  const mostrarTopo = useRolou(900);

  // País vindo das bandeiras do cabeçalho e do trilho do herói (?pais=Brasil)
  const [searchParams] = useSearchParams();
  const paisParam = searchParams.get("pais") || "";
  const paisParamMounted = useRef(false);

  const sentinelRef = useRef(null);
  const prefetchCache = useRef({}); // { [pageNumber]: { items, total } }
  const pendingScrollY = useRef(null);

  const luzPassos = useLuzDoCursor();
  const { ref: trilhoRef, rolar } = useArrastar();
  const fotoChamada = useParallax(0.08);

  // ── Persistência do estado de navegação ───────────────────────────────────
  // IMPORTANTE: aqui vai APENAS estado leve — página, filtro e scroll.
  // Nunca gravar `properties`, que carrega imagens em base64 e estoura a quota
  // do sessionStorage (era exatamente o que derrubava a página).
  useEffect(() => {
    if (isLoading || properties.length === 0) return;
    // Só página e filtro: a rolagem tem o próprio guardião abaixo, senão este
    // efeito gravaria scrollY = 0 logo depois de restaurar.
    const atual = session.getJSON(SESSION_KEY) || {};
    session.setJSON(SESSION_KEY, { ...atual, page, activeFilter });
  }, [page, activeFilter, properties.length, isLoading]);

  // Salva a posição de scroll ao sair da página (o efeito acima só dispara
  // quando página/filtro mudam, e rolar não muda nenhum dos dois).
  useEffect(() => {
    const saveScroll = () => {
      if (isLoading || properties.length === 0) return;
      const atual = session.getJSON(SESSION_KEY) || {};
      session.setJSON(SESSION_KEY, {
        ...atual,
        page,
        activeFilter,
        scrollY: window.scrollY,
      });
    };
    window.addEventListener("pagehide", saveScroll);
    // Nada de salvar no unmount: quando a pessoa abre um imóvel, a página de
    // detalhe já rolou para o topo e gravaríamos scrollY = 0 por cima do ponto
    // certo. O guardião de rolagem abaixo mantém o valor sempre atualizado.
    return () => window.removeEventListener("pagehide", saveScroll);
  }, [page, activeFilter, properties.length, isLoading]);

  // Guarda a rolagem enquanto a pessoa navega — sem isso, recarregar perde o
  // ponto em que ela estava.
  useEffect(() => {
    if (isLoading || properties.length === 0) return;
    let frame = 0;
    const aoRolar = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const atual = session.getJSON(SESSION_KEY) || {};
        session.setJSON(SESSION_KEY, { ...atual, scrollY: window.scrollY });
      });
    };
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => {
      // Sem cancelar o quadro pendente, ele rodaria depois da saída da página
      // e gravaria scrollY = 0 — perdendo o ponto em que a pessoa estava.
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", aoRolar);
    };
  }, [isLoading, properties.length]);

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
    // Vale tanto ao voltar do detalhe quanto ao recarregar a página: a
    // posição e o filtro ficam no sessionStorage e são retomados aqui.
    session.remove(FROM_DETAIL_KEY);
    const saved = session.getJSON(SESSION_KEY);

    // Ao restaurar, refaz UMA requisição com limit = páginas já vistas.
    // A ordenação do backend é estável (ORDER BY id DESC), então os itens
    // voltam idênticos — sem precisar guardar nada pesado no storage.
    const restoredPage = saved?.page > 0 ? saved.page : 1;
    const restoredFilter =
      saved?.activeFilter || (paisParam ? { pais: paisParam } : null);

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

  // ── Restaura a posição de scroll depois que os imóveis entram no DOM ─────
  useEffect(() => {
    if (isLoading || pendingScrollY.current === null) return;
    const y = pendingScrollY.current;
    pendingScrollY.current = null;

    // As fotos entram depois e empurram o layout: insiste algumas vezes até a
    // página ficar alta o bastante para chegar na posição salva.
    let tentativas = 0;
    const tentar = () => {
      window.scrollTo({ top: y, behavior: "instant" });
      tentativas += 1;
      if (Math.abs(window.scrollY - y) > 4 && tentativas < 12) {
        setTimeout(tentar, 120);
      }
    };
    const timer = setTimeout(tentar, 60);
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
      { root: null, rootMargin: "300px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, isLoading]);

  // ── Filtro aplicado pela barra de busca ───────────────────────────────────
  const recieveFilterProperties = async (filtro) => {
    prefetchCache.current = {};
    setIsFiltering(true);
    setLoadError(false);
    setActiveFilter(filtro);
    try {
      const { items, total: totalCount } = await listImoveis(filtro, 1, PAGE_SIZE);
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

  // ── Filtro por país vindo da URL ──────────────────────────────────────────
  // O carregamento inicial já considera o ?pais=; aqui só reage a mudanças.
  useEffect(() => {
    if (!paisParamMounted.current) {
      paisParamMounted.current = true;
      return;
    }
    recieveFilterProperties(paisParam ? { pais: paisParam } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paisParam]);

  const mostrarEsqueletos = isLoading || isFiltering;
  const pranchas = properties.slice(0, PRANCHAS);
  const fichas = properties.slice(PRANCHAS);

  return (
    <>
      <Header />

      <main>
        <Hero />

        {/* A barra só acompanha o catálogo: fora dele, para de grudar. */}
        <div className="relative">
          <BarraBusca
            externalPais={paisParam}
            onFilter={recieveFilterProperties}
            total={loadError ? null : total}
          />

        {/* ── Catálogo ──────────────────────────────────────────────────── */}
        <section
          id="imoveis"
          className="mx-auto w-full max-w-[1320px] scroll-mt-32 px-6 pb-24 pt-16 max-[700px]:px-4 max-[700px]:pb-16 max-[700px]:pt-10"
        >
          <Revelar className="regua mb-12 max-[700px]:mb-8">
            <h2 className="display m-0 text-[clamp(28px,3.6vw,52px)] text-ink">
              Seleção da semana
            </h2>
            <p className="m-0 shrink-0 text-[14.5px] tabular-nums text-muted">
              {mostrarEsqueletos
                ? "Carregando imóveis…"
                : typeof total === "number" && total > 0
                ? `${total} ${
                    total === 1 ? "imóvel disponível" : "imóveis disponíveis"
                  }`
                : "Imóveis acompanhados por um corretor da Bretas Imóveis"}
            </p>
          </Revelar>

          {mostrarEsqueletos ? (
            <div className={GRADE}>
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center border-y border-line-strong px-6 py-24 text-center">
              <h3 className="display-med m-0 mb-3 text-[26px] text-ink">
                Não conseguimos carregar os imóveis
              </h3>
              <p className="m-0 mb-7 text-muted">
                Verifique sua conexão e tente novamente.
              </p>
              <Button
                label="Tentar novamente"
                onClick={() => recieveFilterProperties(activeFilter)}
              />
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center border-y border-line-strong px-6 py-24 text-center">
              <h3 className="display-med m-0 mb-3 text-[26px] text-ink">
                Nenhum imóvel com esses filtros
              </h3>
              <p className="m-0 mb-7 text-muted">
                Tente ampliar a faixa de preço ou trocar o bairro.
              </p>
              <Button
                label="Ver todos os imóveis"
                variant="ghost"
                onClick={() => recieveFilterProperties(null)}
              />
            </div>
          ) : (
            <>
              <div className="mb-16 max-[700px]:mb-12">
                {pranchas.map((property, i) => (
                  <CardProperty
                    key={property.ind}
                    property={property}
                    formato="prancha"
                    lado={i % 2 === 0 ? "esquerda" : "direita"}
                  />
                ))}
              </div>

              <div className={GRADE}>
                {fichas.map((property, i) => (
                  <CardProperty
                    key={property.ind}
                    property={property}
                    ordem={i % 4}
                  />
                ))}
              </div>

              {/* Sentinela da rolagem infinita */}
              <div ref={sentinelRef} className="h-4 w-full" />

              {isLoadingMore && (
                <div className={`mt-16 ${GRADE}`}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {!hasMore && (
                <p className="mt-14 flex items-center justify-center gap-5 text-center text-[13.5px] text-muted">
                  <span aria-hidden="true" className="h-px w-12 bg-line-strong" />
                  Fim da seleção
                  <span aria-hidden="true" className="h-px w-12 bg-line-strong" />
                </p>
              )}
            </>
          )}
          </section>
        </div>

        {/* ── Praças: trilho horizontal com encaixe ─────────────────────── */}
        <section className="overflow-hidden border-t border-line-strong bg-canvas pb-24 pt-16 max-[700px]:pb-16 max-[700px]:pt-10">
          <div className="mx-auto w-full max-w-[1320px] px-6 max-[700px]:px-4">
            <Revelar className="regua mb-10">
              <h2 className="display m-0 text-[clamp(28px,3.6vw,52px)] text-ink">
                Onde a Bretas Imóveis atua
              </h2>
              <span className="flex shrink-0 items-center gap-3">
                <span className="text-[14.5px] text-muted max-[700px]:hidden">
                  Arraste ou use as setas
                </span>
                <button
                  type="button"
                  onClick={() => rolar(-1)}
                  aria-label="Praça anterior"
                  className="grid h-11 w-11 cursor-pointer place-items-center rounded-[2px] border border-line-strong text-navy transition-colors duration-300 hover:border-navy hover:bg-navy hover:text-white"
                >
                  <FaArrowLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => rolar(1)}
                  aria-label="Próxima praça"
                  className="grid h-11 w-11 cursor-pointer place-items-center rounded-[2px] border border-line-strong text-navy transition-colors duration-300 hover:border-navy hover:bg-navy hover:text-white"
                >
                  <FaArrowRight size={14} />
                </button>
              </span>
            </Revelar>
          </div>

          <div
            ref={trilhoRef}
            tabIndex={0}
            aria-label="Praças onde a Bretas atua"
            className="trilho cursor-grab gap-5 px-6 pb-2 max-[700px]:px-4"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                rolar(1);
                e.preventDefault();
              }
              if (e.key === "ArrowLeft") {
                rolar(-1);
                e.preventDefault();
              }
            }}
          >
            {PRACAS.map((p, i) => (
              <Revelar
                key={p.pais}
                ordem={i}
                tipo="escala"
                className="w-[min(860px,88vw)] shrink-0"
              >
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/?pais=${encodeURIComponent(p.pais)}`);
                    document
                      .getElementById("imoveis")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="group grao relative isolate flex h-[560px] w-full cursor-pointer flex-col justify-end overflow-hidden bg-navy-dark p-10 text-left max-[900px]:h-[460px] max-[700px]:h-[380px] max-[700px]:p-6"
                >
                  <img
                    src={p.img}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="absolute inset-0 -z-20 h-full w-full object-cover opacity-50 transition-[transform,opacity] duration-[1200ms] ease-[var(--ease-saida)] group-hover:scale-105 group-hover:opacity-70"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(4,22,31,.94),rgba(4,22,31,.2))]"
                  />

                  <img
                    src={p.flag}
                    alt=""
                    className="absolute left-10 top-10 h-12 w-12 rounded-full object-cover ring-1 ring-gold/70 max-[700px]:left-6 max-[700px]:top-6 max-[700px]:h-10 max-[700px]:w-10"
                  />

                  <span className="display block text-[clamp(34px,4.4vw,62px)] text-white">
                    {p.pais}
                  </span>
                  <span className="mt-4 block border-t border-white/20 pt-4 text-[16px] text-white/70">
                    {p.praças}
                  </span>
                  <span className="mt-4 block max-w-[52ch] text-[15.5px] leading-relaxed text-white/60">
                    {p.nota}
                  </span>
                  <span className="mt-6 flex items-center gap-3 text-[14px] font-semibold text-gold">
                    Ver imóveis
                    <span aria-hidden="true" className="fio-cresce" />
                  </span>
                </button>
              </Revelar>
            ))}
          </div>
        </section>

        {/* ── Como funciona ─────────────────────────────────────────────── */}
        <section
          ref={luzPassos}
          className="grao luz relative isolate overflow-hidden bg-navy-dark py-24 text-white max-[700px]:py-16"
        >
          <div className="mx-auto grid w-full max-w-[1320px] grid-cols-[1.05fr_.95fr] items-center gap-16 px-6 max-[1020px]:grid-cols-1 max-[1020px]:gap-10 max-[700px]:px-4">
            <div>
              <Revelar as="p" className="etiqueta m-0 mb-6">
                Como a Bretas Imóveis trabalha
              </Revelar>

              <h2 className="display m-0 text-[clamp(28px,3.8vw,52px)] text-white">
                <TituloLinhas
                  ordem={1}
                  linhas={["Da primeira conversa", "até a chave na mão."]}
                />
              </h2>

              <Revelar
                as="p"
                ordem={3}
                className="m-0 mt-7 max-w-[48ch] text-[16px] leading-relaxed text-white/65"
              >
                Comprar num país que não é o seu dá insegurança — e com razão.
                Por isso cada etapa tem alguém que conhece a praça do lado de lá.
              </Revelar>

              <ol className="relative m-0 mt-11 list-none border-l border-white/20 p-0">
                {PASSOS.map((p, i) => (
                  <Revelar
                    as="li"
                    key={p.titulo}
                    ordem={i}
                    tipo="lado"
                    className="relative pb-9 pl-9 last:pb-0"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -left-[4.5px] top-2 h-2 w-2 rotate-45 bg-gold"
                    />
                    <b className="display-med block text-[20px] text-white">
                      {p.titulo}
                    </b>
                    <p className="m-0 mt-2 max-w-[42ch] text-[15px] text-white/60">
                      {p.texto}
                    </p>
                  </Revelar>
                ))}
              </ol>
            </div>

            <Revelar
              ordem={2}
              className="cortina relative aspect-[4/5] w-full max-[1020px]:order-first max-[1020px]:aspect-[16/9]"
            >
              <img
                src="/placeholder_house_2.jpg"
                alt="Sala integrada com vista para a varanda"
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-4 -right-4 left-6 top-6 border border-gold/60 max-[700px]:hidden"
              />
            </Revelar>
          </div>
        </section>

        {/* ── Chamada final ─────────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0 -z-20 overflow-hidden">
            <img
              ref={fotoChamada}
              src="/placeholder_house_3.png"
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="parallax h-[120%] w-full -translate-y-[8%] object-cover"
            />
          </div>
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-navy-deep/85"
          />

          <div className="mx-auto grid w-full max-w-[1320px] grid-cols-[1.2fr_auto] items-end gap-10 px-6 py-28 max-[760px]:grid-cols-1 max-[760px]:gap-7 max-[700px]:px-4 max-[700px]:py-20">
            <div>
              <h2 className="display m-0 text-[clamp(28px,4.2vw,60px)] text-white">
                <TituloLinhas linhas={["Não achou o que", "você procurava?"]} />
              </h2>
              <Revelar
                as="p"
                ordem={2}
                className="m-0 mt-6 max-w-[46ch] text-[16px] leading-relaxed text-white/70"
              >
                Conte o que você precisa. Um corretor da Bretas Imóveis monta uma lista
                à mão e manda no seu WhatsApp.
              </Revelar>
            </div>

            <Revelar ordem={3} className="shrink-0">
              <Button
                label="Falar no WhatsApp"
                variant="gold"
                icon={<FaWhatsapp size={18} />}
                onClick={() =>
                  window.open(
                    "https://wa.me/5567992609967?text=" +
                      encodeURIComponent(
                        "Olá! Gostaria de ajuda para encontrar um imóvel."
                      ),
                    "_blank",
                    "noopener noreferrer"
                  )
                }
              />
            </Revelar>
          </div>
        </section>
      </main>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Voltar ao topo"
        className={`fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-[2px] border border-gold/60 bg-navy text-white transition-[opacity,transform,background-color] duration-500 ease-[var(--ease-saida)] hover:bg-gold hover:text-navy-dark ${
          mostrarTopo
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <FaArrowUp />
      </button>

      <Footer />
    </>
  );
}

export default Home;
