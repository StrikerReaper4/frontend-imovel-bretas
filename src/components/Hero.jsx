import { useNavigate, useSearchParams } from "react-router-dom";
import Revelar, { TituloLinhas } from "./Revelar";
import { useLuzDoCursor, useParallax, useRevelar } from "../utils/motion";

const PAISES = [
  { pais: "Brasil", praças: "Campo Grande, São Paulo e litoral", src: "/Bandeira_Brasil.png" },
  { pais: "Estados Unidos", praças: "Flórida e Nova York", src: "/Bandeira_EUA.png" },
  { pais: "Portugal", praças: "Lisboa, Porto e Algarve", src: "/Bandeira_Portugal.png" },
];

/**
 * Abertura do site. A foto sangra pela direita e se move em parallax; o título
 * entra linha a linha; o trilho de países é índice e filtro ao mesmo tempo.
 */
export default function Hero() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paisAtivo = searchParams.get("pais") || "";

  const luzRef = useLuzDoCursor();
  const fotoRef = useParallax(0.06);
  const cortinaRef = useRevelar();

  const escolher = (pais) => {
    navigate(pais === paisAtivo ? "/" : `/?pais=${encodeURIComponent(pais)}`);
    document
      .getElementById("imoveis")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      ref={luzRef}
      className="grao luz relative isolate overflow-hidden bg-navy-dark text-white"
    >
      {/* Foto sangrando pela direita */}
      <div
        ref={cortinaRef}
        className="cortina absolute inset-y-0 right-0 w-[44vw] max-[1020px]:static max-[1020px]:h-[46vh] max-[1020px]:w-full"
      >
        <img
          ref={fotoRef}
          src="/placeholder_house.jpg"
          alt="Residência contemporânea iluminada ao anoitecer"
          className="parallax h-[112%] w-full -translate-y-[6%] object-cover"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-navy-dark)_0%,rgba(6,31,46,.55)_28%,rgba(6,31,46,.08)_70%)] max-[1020px]:bg-[linear-gradient(to_top,var(--color-navy-dark)_4%,rgba(6,31,46,.2)_70%)]"
        />
        <figcaption className="carimbo absolute bottom-6 right-6 max-[1020px]:bottom-4 max-[1020px]:right-4">
          Campo Grande · Lisboa · Orlando
        </figcaption>
      </div>

      <div className="relative z-10 mx-auto grid min-h-[86svh] w-full max-w-[1320px] grid-cols-[minmax(0,.62fr)_minmax(0,.38fr)] items-center px-6 pb-16 pt-20 max-[1020px]:min-h-0 max-[1020px]:grid-cols-1 max-[1020px]:py-14 max-[700px]:px-4 max-[700px]:py-10">
        <div>
          <Revelar as="p" className="etiqueta m-0 mb-7 flex flex-wrap items-center gap-3">
            Brasil
            <span aria-hidden="true" className="h-px w-5 bg-gold/60" />
            Estados Unidos
            <span aria-hidden="true" className="h-px w-5 bg-gold/60" />
            Portugal
          </Revelar>

          <h1 className="display m-0 text-[clamp(40px,6.4vw,90px)] text-white">
            <TituloLinhas
              ordem={1}
              linhas={["Um lar aqui.", "Outro do outro", "lado do mundo."]}
            />
          </h1>

          <Revelar
            as="p"
            ordem={4}
            className="m-0 mt-8 max-w-[44ch] text-[clamp(15px,1.15vw,17.5px)] leading-relaxed text-white/70"
          >
            A Bretas Imóveis trabalha com corretores credenciados em três países. Você
            escolhe o endereço; a gente cuida do caminho até a chave.
          </Revelar>

          {/* Trilho de países: índice do catálogo e filtro da busca */}
          <div className="mt-12 max-w-[640px] border-t border-white/15">
            {PAISES.map((p, i) => {
              const ativo = paisAtivo === p.pais;
              return (
                <Revelar key={p.pais} ordem={5 + i} tipo="lado">
                  <button
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => escolher(p.pais)}
                    className={`group grid w-full cursor-pointer grid-cols-[34px_1fr_auto] items-center gap-5 border-b py-4 text-left transition-[padding,border-color,background-color] duration-500 ease-[var(--ease-saida)]
                      ${
                        ativo
                          ? "border-gold bg-white/[.07] pl-4"
                          : "border-white/12 hover:border-gold/60 hover:bg-white/[.05] hover:pl-4"
                      }`}
                  >
                    <img
                      src={p.src}
                      alt=""
                      className="h-[34px] w-[34px] rounded-full object-cover"
                    />
                    <span>
                      <span className="display-med block text-[23px] text-white max-[480px]:text-[19px]">
                        {p.pais}
                      </span>
                      <span className="mt-0.5 block text-[13.5px] text-white/50">
                        {p.praças}
                      </span>
                    </span>
                    <span
                      className={`flex items-center gap-3 text-[13.5px] ${
                        ativo ? "text-gold" : "text-white/55 group-hover:text-gold"
                      }`}
                    >
                      {ativo ? "Filtrando" : "Ver"}
                      <span aria-hidden="true" className="fio-cresce" />
                    </span>
                  </button>
                </Revelar>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
