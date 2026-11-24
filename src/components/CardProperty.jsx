import { FaBath, FaCarAlt, FaWhatsapp, FaPen, FaTrash } from "react-icons/fa";
import { IoIosBed } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import { BANDEIRA, formatPrice, resolveImage } from "../utils/imovel";
import { useRevelar, useParallax } from "../utils/motion";

/**
 * Imóvel em duas formas:
 * - "prancha": linha editorial larga, foto de um lado e ficha do outro.
 * - "ficha": unidade de catálogo, usada na grade.
 * O admin reaproveita a ficha com os botões de gestão.
 */
export default function CardProperty({
  property,
  admin = false,
  handleOpen,
  formato = "ficha",
  lado = "esquerda",
  ordem = 0,
}) {
  const navigate = useNavigate();
  const fotoRef = useRevelar();
  const parallaxRef = useParallax(formato === "prancha" ? 0.05 : 0);

  const local = [property?.bairro, property?.cidade].filter(Boolean).join(", ");
  const endereco = property?.rua || "Endereço sob consulta";
  const enderecoCompleto = `${property?.rua}, ${property?.bairro} ${property?.cidade} ${property?.estado}`;
  const bandeira = BANDEIRA[property?.pais];

  const abrirWhatsapp = (e) => {
    e.stopPropagation();
    const message = `Olá, gostaria de saber mais sobre o imóvel do endereço ${enderecoCompleto} e do ID ${property?.ind}`;
    window.open(
      `https://wa.me/5567992609967?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener noreferrer"
    );
  };

  const verDetalhes = () => navigate(`/property/${property?.ind}`);

  const plural = (n, um, varios) => `${Number(n) || 0} ${Number(n) === 1 ? um : varios}`;

  const specs = (claro = false) => (
    <div
      className={`flex flex-wrap items-center gap-5 text-[14px] ${
        claro ? "text-white/70" : "text-muted"
      }`}
    >
      <span className="inline-flex items-center gap-1.5">
        <IoIosBed size={17} className="text-gold" />
        {plural(property?.quartos, "quarto", "quartos")}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <FaBath size={14} className="text-gold" />
        {plural(property?.banheiros, "banheiro", "banheiros")}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <FaCarAlt size={15} className="text-gold" />
        {plural(property?.vagas, "vaga", "vagas")}
      </span>
      {property?.area ? (
        <span className="tabular-nums">{property.area} m²</span>
      ) : null}
    </div>
  );

  const foto = (ratio) => (
    <div
      ref={fotoRef}
      style={{ "--i": ordem }}
      className={`cortina relative bg-navy-dark ${ratio}`}
    >
      <img
        ref={parallaxRef}
        src={resolveImage(property)}
        alt={`${property?.tipo || "Imóvel"} em ${local || enderecoCompleto}`}
        className="parallax h-full w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-saida)] group-hover:scale-[1.05]"
        loading="lazy"
        decoding="async"
      />
      <span className="carimbo absolute left-0 top-5 z-[3] border-l-0">
        {bandeira && (
          <img
            src={bandeira}
            alt=""
            className="h-[18px] w-[18px] shrink-0 rounded-full object-cover"
          />
        )}
        {property?.tipo || "Imóvel"}
      </span>
      {admin && (
        <span className="absolute right-0 top-5 z-[3] bg-white/90 px-2.5 py-1 text-[12px] font-bold tabular-nums text-navy">
          {property?.ind}
        </span>
      )}
    </div>
  );

  const acoes = (claro = false) =>
    admin ? (
      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          label="Ver detalhes"
          className="px-4 py-2.5 text-[14px]"
          onClick={verDetalhes}
        />
        <Button
          label="Editar"
          variant="gold"
          icon={<FaPen size={12} />}
          className="px-4 py-2.5 text-[14px]"
          onClick={() => handleOpen("edit", property?.ind)}
        />
        <Button
          label="Deletar"
          variant="danger"
          icon={<FaTrash size={12} />}
          className="px-4 py-2.5 text-[14px]"
          onClick={() => handleOpen("delete", property?.ind)}
        />
      </div>
    ) : (
      <div className="mt-6 flex items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-3 text-[14.5px] font-semibold ${
            claro ? "text-white" : "text-navy"
          }`}
        >
          Ver o imóvel
          <span aria-hidden="true" className="fio-cresce" />
        </span>
        <button
          type="button"
          onClick={abrirWhatsapp}
          aria-label={`Falar no WhatsApp sobre o imóvel em ${endereco}`}
          className={`grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-[2px] border transition-colors duration-300 ${
            claro
              ? "border-white/25 text-white hover:border-[#25d366] hover:bg-[#25d366] hover:text-navy-dark"
              : "border-line-strong text-[#1b7f4b] hover:border-[#25d366] hover:bg-[#25d366] hover:text-white"
          }`}
        >
          <FaWhatsapp size={19} />
        </button>
      </div>
    );

  // ── Prancha: abertura de catálogo, foto grande e ficha ao lado ─────────
  if (formato === "prancha") {
    const fotoDireita = lado === "direita";
    return (
      <article
        onClick={verDetalhes}
        className="group grid cursor-pointer grid-cols-[1.25fr_1fr] items-stretch gap-0 border-t border-line-strong max-[900px]:grid-cols-1"
      >
        <div
          className={`${fotoDireita ? "order-2 max-[900px]:order-1" : ""} overflow-hidden`}
        >
          {foto("aspect-[16/11] max-[900px]:aspect-[16/10]")}
        </div>

        <div
          className={`flex flex-col justify-center px-10 py-12 max-[1200px]:px-7 max-[900px]:order-2 max-[900px]:px-0 max-[900px]:py-8 ${
            fotoDireita ? "order-1 max-[900px]:order-2" : ""
          }`}
        >
          <p className="preco m-0 text-[clamp(30px,3vw,42px)] text-ink">
            {formatPrice(property?.valor, property?.pais)}
          </p>

          <h3 className="display-med m-0 mt-4 text-[clamp(20px,1.7vw,26px)] text-ink">
            {endereco}
          </h3>
          <p className="m-0 mt-1.5 text-[15px] text-muted">
            {local || property?.estado}
          </p>

          {property?.descricao && (
            <p className="m-0 mt-5 line-clamp-3 max-w-[46ch] text-[15px] leading-relaxed text-muted">
              {property.descricao}
            </p>
          )}

          <div className="mt-7 border-t border-line pt-4">
            {specs()}
          </div>

          {acoes()}
        </div>
      </article>
    );
  }

  // ── Ficha de catálogo ───────────────────────────────────────────────────
  return (
    <article
      onClick={admin ? undefined : verDetalhes}
      className={`group flex flex-col border-t border-line-strong ${
        admin ? "" : "cursor-pointer"
      }`}
    >
      <span
        aria-hidden="true"
        className="-mt-px h-px w-0 bg-gold transition-[width] duration-700 ease-[var(--ease-saida)] group-hover:w-full"
      />

      {foto("aspect-[4/3]")}

      <div className="flex flex-1 flex-col pt-5">
        <p className="preco m-0 text-[26px] text-ink">
          {formatPrice(property?.valor, property?.pais)}
        </p>

        <h3
          className="m-0 mt-2 truncate text-[16px] font-bold text-ink"
          title={enderecoCompleto}
        >
          {endereco}
        </h3>
        <p className="m-0 mt-0.5 truncate text-[14px] text-muted" title={local}>
          {local || property?.estado}
        </p>

        <div className="mt-auto pt-4">
          {specs()}
        </div>

        {acoes()}
      </div>
    </article>
  );
}
