import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaAngleLeft,
  FaAngleRight,
  FaArrowLeft,
  FaBath,
  FaCarAlt,
  FaExpand,
  FaRulerCombined,
  FaTimes,
  FaWhatsapp,
} from "react-icons/fa";
import { IoIosBed } from "react-icons/io";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import Loading from "../components/Loading";
import Revelar, { TituloLinhas } from "../components/Revelar";
import { BANDEIRA, formatPrice } from "../utils/imovel";
import { filterImoveis } from "../services/imovelService";
import { session } from "../utils/storage";
import { useParallax } from "../utils/motion";

const TELEFONE = "5567992609967";

function PropertySelected() {
  const location = useLocation();
  const navigate = useNavigate();
  const propertyId = location.pathname.split("/property/")[1];
  const fotoRef = useParallax(0.05);

  const [foto, setFoto] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [property, setProperty] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Busca o imóvel direto pelo ID — devolve só 1 registro.
  useEffect(() => {
    const fetchById = async () => {
      try {
        const id = parseInt(propertyId);
        if (!id) {
          setNotFound(true);
          return;
        }
        const data = await filterImoveis({ id_imovel: id }, 1, 1);
        if (data && data.length > 0) setProperty(data[0]);
        else setNotFound(true);
      } catch (err) {
        console.error("Erro ao buscar imóvel:", err);
        setNotFound(true);
      }
    };
    fetchById();
  }, [propertyId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Ao sair da página, sinaliza para a Home restaurar filtros e rolagem.
  useEffect(() => {
    return () => session.set("cameFromDetail", "true");
  }, []);

  // Título da aba — ajuda no compartilhamento e na busca.
  useEffect(() => {
    if (!property) return;
    document.title = `${property.tipo || "Imóvel"} em ${
      property.cidade || ""
    } — Bretas Imóveis`.replace(/\s+/g, " ");
    return () => {
      document.title =
        "Bretas Imóveis — Compra, Venda e Investimento de Imóveis";
    };
  }, [property]);

  if (notFound)
    return (
      <>
        <Header />
        <main className="mx-auto flex w-full max-w-[1320px] flex-col items-center justify-center px-6 py-32 text-center">
          <h1 className="display m-0 mb-4 text-[clamp(30px,4.2vw,52px)] text-ink">
            Imóvel não encontrado
          </h1>
          <p className="m-0 mb-8 text-muted">
            O imóvel que você procura não existe mais ou já foi vendido.
          </p>
          <Button label="Ver o catálogo" onClick={() => navigate("/")} />
        </main>
        <Footer />
      </>
    );

  if (!property) return <Loading />;

  let imagens = [];
  if (Array.isArray(property.imagem) && property.imagem.length > 0) {
    imagens = property.imagem.map((img) =>
      typeof img === "string" && img.startsWith("data:image")
        ? img
        : `data:image/jpeg;base64,${img}`
    );
  } else if (property.imagem && !Array.isArray(property.imagem)) {
    imagens = [`data:image/jpeg;base64,${property.imagem}`];
  } else {
    imagens = ["/placeholder_house.jpg"];
  }

  const atual = imagens[foto];
  const bandeira = BANDEIRA[property.pais];
  const local = [property.bairro, property.cidade, property.estado]
    .filter(Boolean)
    .join(" · ");
  const enderecoCompleto = `${property.rua}, ${property.bairro} ${property.cidade} ${property.estado}`;

  const trocar = (dir) =>
    setFoto((i) => (i + dir + imagens.length) % imagens.length);

  const abrirWhatsapp = () => {
    const message = `Olá, gostaria de saber mais sobre o imóvel do endereço ${enderecoCompleto} e do ID ${property.ind}`;
    window.open(
      `https://wa.me/${TELEFONE}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener noreferrer"
    );
  };

  const fichas = [
    { label: "Quartos", valor: property.quartos, icon: <IoIosBed size={19} /> },
    {
      label: "Banheiros",
      valor: property.banheiros,
      icon: <FaBath size={16} />,
    },
    { label: "Vagas", valor: property.vagas, icon: <FaCarAlt size={16} /> },
    {
      label: "Área (m²)",
      valor: property.area || "—",
      icon: <FaRulerCombined size={16} />,
    },
  ];

  // Ficha completa, agrupada por assunto. Só entra o campo que veio preenchido.
  const vazio = (v) =>
    v === undefined || v === null || v === "" || v === 0 || v === "0";

  const grupos = [
    {
      titulo: "Endereço",
      itens: [
        { label: "Rua", valor: property.rua },
        { label: "Número", valor: property.numero },
        { label: "Bairro", valor: property.bairro },
        { label: "Cidade", valor: property.cidade },
        { label: "Estado", valor: property.estado },
        { label: "CEP", valor: property.cep },
        { label: "País", valor: property.pais },
      ],
    },
    {
      titulo: "O imóvel",
      itens: [
        { label: "Tipo", valor: property.tipo },
        { label: "Área", valor: property.area ? `${property.area} m²` : "" },
        { label: "Quartos", valor: property.quartos },
        { label: "Suítes", valor: property.suites },
        { label: "Banheiros", valor: property.banheiros },
        { label: "Vagas de garagem", valor: property.vagas },
        { label: "Andar", valor: property.andar },
      ],
    },
    {
      titulo: "Negócio",
      itens: [
        { label: "Valor", valor: formatPrice(property.valor, property.pais) },
        {
          label: "Situação",
          // O banco guarda "venda" em caixa baixa; a tela mostra "Venda".
          valor: property.situacao
            ? property.situacao.charAt(0).toUpperCase() +
              property.situacao.slice(1)
            : "",
        },
        {
          label: "Disponibilidade",
          valor:
            property.disponivel === false ? "Indisponível" : "Disponível",
        },
        { label: "Código do imóvel", valor: property.ind },
      ],
    },
  ]
    .map((g) => ({ ...g, itens: g.itens.filter((i) => !vazio(i.valor)) }))
    .filter((g) => g.itens.length > 0);

  const seta =
    "grid h-12 w-12 cursor-pointer place-items-center rounded-[2px] border border-gold/50 bg-navy-dark/70 text-white backdrop-blur-sm transition-colors duration-300 hover:bg-gold hover:text-navy-dark";

  return (
    <>
      <Header />

      <main>
        {/* ── Abertura: foto ao fundo, endereço e preço na frente ──────── */}
        <section className="grao relative isolate overflow-hidden bg-navy-dark text-white">
          <img
            ref={fotoRef}
            src={atual}
            alt=""
            aria-hidden="true"
            className="parallax absolute inset-0 -z-20 h-[112%] w-full -translate-y-[6%] object-cover opacity-45"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(4,22,31,.96),rgba(4,22,31,.55))]"
          />

          <div className="mx-auto w-full max-w-[1320px] px-6 pb-14 pt-10 max-[700px]:px-4 max-[700px]:pb-10">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-10 inline-flex cursor-pointer items-center gap-3 text-[14.5px] text-white/70 transition-colors duration-300 hover:text-gold max-[700px]:mb-7"
            >
              <FaArrowLeft size={13} />
              Voltar para a busca
            </button>

            <Revelar
              as="p"
              className="etiqueta m-0 mb-5 flex items-center gap-3"
            >
              {bandeira && (
                <img
                  src={bandeira}
                  alt=""
                  className="h-[22px] w-[22px] rounded-full object-cover"
                />
              )}
              {property.tipo}
              <span aria-hidden="true" className="h-px w-6 bg-gold/60" />
              {property.pais}
            </Revelar>

            <h1 className="display m-0 max-w-[18ch] text-[clamp(30px,4.4vw,62px)] text-white">
              <TituloLinhas
                ordem={1}
                linhas={[property.rua || "Endereço sob consulta"]}
              />
            </h1>

            <Revelar
              as="p"
              ordem={2}
              className="m-0 mt-4 text-[16px] text-white/65"
            >
              {local}
            </Revelar>

            <Revelar
              ordem={3}
              className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-white/15 pt-6"
            >
              <p className="preco m-0 text-[clamp(32px,4vw,56px)] text-white">
                {formatPrice(property.valor, property.pais)}
              </p>
              <div className="flex flex-wrap gap-7 pb-2 text-[15px] text-white/70">
                {fichas.map((f) => (
                  <span key={f.label} className="flex items-center gap-2.5">
                    <span className="text-gold">{f.icon}</span>
                    <b className="font-semibold text-white">{f.valor}</b>
                    {f.label}
                  </span>
                ))}
              </div>
            </Revelar>
          </div>
        </section>

        {/* ── Galeria, descrição e mapa ────────────────────────────────── */}
        <div className="mx-auto grid w-full max-w-[1320px] grid-cols-[1.4fr_1fr] items-start gap-10 px-6 py-14 max-[1020px]:grid-cols-1 max-[700px]:px-4 max-[700px]:py-10">
          <div>
            <Revelar className="relative overflow-hidden border border-line-strong bg-navy-dark">
              <img
                src={atual}
                alt={`Foto ${foto + 1} do imóvel em ${local}`}
                className="aspect-[16/10] w-full object-cover"
                decoding="async"
              />

              <button
                type="button"
                onClick={() => setLightbox(true)}
                aria-label="Ampliar foto"
                className={`${seta} absolute right-4 top-4`}
              >
                <FaExpand size={15} />
              </button>

              {imagens.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => trocar(-1)}
                    aria-label="Foto anterior"
                    className={`${seta} absolute left-4 top-1/2 -translate-y-1/2`}
                  >
                    <FaAngleLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => trocar(1)}
                    aria-label="Próxima foto"
                    className={`${seta} absolute bottom-1/2 right-4 translate-y-1/2`}
                  >
                    <FaAngleRight size={20} />
                  </button>
                  <span className="carimbo absolute bottom-0 right-0 border-b-0 border-r-0 tabular-nums">
                    {foto + 1} de {imagens.length}
                  </span>
                </>
              )}
            </Revelar>

            {imagens.length > 1 && (
              <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2.5">
                {imagens.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFoto(i)}
                    aria-label={`Ver foto ${i + 1}`}
                    aria-current={i === foto}
                    className={`overflow-hidden border transition-colors duration-300 ${
                      i === foto
                        ? "border-gold"
                        : "border-line hover:border-line-strong"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      className={`aspect-[4/3] w-full cursor-pointer object-cover transition-opacity duration-300 ${
                        i === foto
                          ? "opacity-100"
                          : "opacity-75 hover:opacity-100"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}

            <Revelar className="mt-14">
              <div className="regua mb-6">
                <h2 className="display-med m-0 text-[26px] text-ink">
                  Sobre o imóvel
                </h2>
                <span className="shrink-0 text-[13.5px] tabular-nums text-muted">
                  Código {property.ind}
                </span>
              </div>

              <p className="m-0 max-w-[62ch] text-[17px] leading-[1.7] text-ink/80">
                {property.descricao ||
                  "Este imóvel ainda não tem descrição detalhada. Fale com a Bretas Imóveis pelo WhatsApp que mandamos mais fotos e informações."}
              </p>

              {/* Ficha completa: um bloco por assunto, com fio dourado no topo */}
              <div className="mt-10 grid grid-cols-2 gap-px bg-line-strong max-[760px]:grid-cols-1">
                {grupos.map((g, gi) => (
                  <section
                    key={g.titulo}
                    className={`bg-canvas p-6 max-[700px]:p-5 ${
                      gi === grupos.length - 1 && grupos.length % 2 === 1
                        ? "col-span-2 max-[760px]:col-span-1"
                        : ""
                    }`}
                  >
                    <h3 className="etiqueta m-0 mb-5 flex items-center gap-3 text-gold-ink">
                      {g.titulo}
                      <span
                        aria-hidden="true"
                        className="h-px flex-1 bg-gold/50"
                      />
                    </h3>

                    <dl
                      className={`m-0 grid gap-x-10 ${
                        gi === grupos.length - 1 && grupos.length % 2 === 1
                          ? "grid-cols-2 max-[760px]:grid-cols-1"
                          : ""
                      }`}
                    >
                      {g.itens.map((i) => (
                        <div
                          key={i.label}
                          className="flex items-baseline justify-between gap-4 border-b border-line py-3 last:border-b-0"
                        >
                          <dt className="m-0 text-[14px] text-muted">
                            {i.label}
                          </dt>
                          <dd className="m-0 text-right text-[15.5px] font-semibold text-ink">
                            {i.valor}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ))}
              </div>

              <p className="m-0 mt-5 flex items-center gap-3 text-[13.5px] text-muted">
                <span aria-hidden="true" className="h-px w-8 bg-line-strong" />
                Informações conferidas por um corretor da Bretas Imóveis antes
                da publicação.
              </p>
            </Revelar>

            <Revelar className="mt-14">
              <div className="regua mb-5">
                <h2 className="display-med m-0 text-[26px] text-ink">
                  Localização
                </h2>
                <span className="shrink-0 text-[14px] text-muted">
                  {property.bairro}
                </span>
              </div>
              <iframe
                title={`Mapa de ${enderecoCompleto}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  enderecoCompleto
                )}&z=16&output=embed`}
                className="h-[380px] w-full border border-line-strong max-[700px]:h-[260px]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Revelar>
          </div>

          {/* ── Coluna de contato ──────────────────────────────────────── */}
          <aside className="sticky top-[104px] border-t-2 border-gold bg-surface p-7 shadow-soft max-[1020px]:static max-[700px]:p-5">
            <p className="m-0 text-[13px] tracking-[.06em] text-muted">
              Valor do imóvel
            </p>
            <p className="preco m-0 mt-2 text-[clamp(28px,3vw,38px)] text-ink">
              {formatPrice(property.valor, property.pais)}
            </p>

            <p className="m-0 mt-6 border-t border-line pt-5 text-[15px] leading-relaxed text-muted">
              Um corretor da Bretas Imóveis acompanha a visita, a documentação e a
              negociação deste imóvel.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <Button
                label="Falar no WhatsApp"
                variant="gold"
                wid="full"
                icon={<FaWhatsapp size={18} />}
                onClick={abrirWhatsapp}
              />
              <Button
                label="Ver outros imóveis"
                variant="ghost"
                wid="full"
                onClick={() => navigate("/")}
              />
            </div>

            <p className="m-0 mt-5 border-t border-line pt-4 text-[13.5px] text-muted">
              Código do imóvel:{" "}
              <b className="tabular-nums text-ink">{property.ind}</b>
            </p>
          </aside>
        </div>
      </main>

      {/* ── Foto ampliada ─────────────────────────────────────────────── */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada"
          className="fixed inset-0 z-50 flex flex-col bg-navy-deep/95 p-6 max-[700px]:p-3"
          onKeyDown={(e) => e.key === "Escape" && setLightbox(false)}
        >
          <div className="flex justify-end">
            <button
              type="button"
              autoFocus
              onClick={() => setLightbox(false)}
              aria-label="Fechar foto ampliada"
              className={seta}
            >
              <FaTimes size={16} />
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center gap-5 overflow-hidden">
            {imagens.length > 1 && (
              <button
                type="button"
                onClick={() => trocar(-1)}
                aria-label="Foto anterior"
                className={`${seta} shrink-0`}
              >
                <FaAngleLeft size={20} />
              </button>
            )}
            <img
              src={atual}
              alt={`Foto ${foto + 1} do imóvel em ${local}`}
              className="max-h-full max-w-full object-contain"
            />
            {imagens.length > 1 && (
              <button
                type="button"
                onClick={() => trocar(1)}
                aria-label="Próxima foto"
                className={`${seta} shrink-0`}
              >
                <FaAngleRight size={20} />
              </button>
            )}
          </div>

          <p className="m-0 pt-4 text-center text-[14px] tabular-nums text-white/70">
            {foto + 1} de {imagens.length}
          </p>
        </div>
      )}

      <Footer />
    </>
  );
}

export default PropertySelected;
