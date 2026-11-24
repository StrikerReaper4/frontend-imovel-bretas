import { useEffect, useRef, useState } from "react";
import { FaSearch, FaSlidersH, FaTimes } from "react-icons/fa";
import Input from "./Input";
import Button from "./Button";
import { useRolou } from "../utils/motion";
import {
  apenasDigitos,
  formatarMilhar,
  simboloMoeda,
  valorPorExtenso,
} from "../utils/formato";

const MOEDA = { Brasil: "R$", "Estados Unidos": "U$", Portugal: "€" };

const VAZIO = {
  id_imovel: "",
  tipo: "",
  bairro: "",
  cidade: "",
  estado: "",
  pais: "",
  quartos: 0,
  banheiros: 0,
  vagas: 0,
  de: 0,
  ate: 0,
};

const OPCOES_QTD = ["0", "1", "2", "3", "4", "+5"];

const CAMPO =
  "group flex flex-col gap-1 border-r border-line px-5 py-3.5 transition-colors duration-300 focus-within:bg-canvas max-[1020px]:border-b max-[700px]:border-r-0";
const ROTULO = "text-[12px] font-semibold tracking-[.08em] text-muted";
const VALOR =
  "border-0 bg-transparent p-0 text-[16.5px] text-ink outline-none placeholder:text-muted/60";

// Limpa "Qualquer", converte números e devolve o filtro no formato da API.
function normalizar(filtro) {
  const f = { ...filtro };
  ["tipo", "pais", "estado", "cidade"].forEach((k) => {
    if (f[k] === "Qualquer") f[k] = "";
  });
  ["quartos", "banheiros", "vagas"].forEach((k) => {
    if (f[k] === "+5") f[k] = 5;
  });
  if (!f.pais) {
    f.de = 0;
    f.ate = 0;
  }
  return {
    ...f,
    id_imovel: Number(f.id_imovel) || 0,
    quartos: Number(f.quartos) || 0,
    banheiros: Number(f.banheiros) || 0,
    vagas: Number(f.vagas) || 0,
    de: Number(f.de) || 0,
    ate: Number(f.ate) || 0,
  };
}

/**
 * Barra de busca que ancora sob o cabeçalho. Fica com o filtro inteiro;
 * o que não cabe na régua vai para a gaveta lateral.
 */
export default function BarraBusca({ externalPais, onFilter, total }) {
  const [filtro, setFiltro] = useState(() => ({
    ...VAZIO,
    pais: externalPais || "",
  }));
  const [estados, setEstados] = useState(["Qualquer"]);
  const [cidades, setCidades] = useState(["Qualquer"]);
  const [gaveta, setGaveta] = useState(false);
  const fecharRef = useRef(null);
  const ancorada = useRolou(220);

  const set = (campo, valor) => setFiltro((f) => ({ ...f, [campo]: valor }));

  useEffect(() => {
    if (externalPais === undefined) return;
    setFiltro((f) =>
      f.pais === externalPais ? f : { ...VAZIO, pais: externalPais }
    );
  }, [externalPais]);

  // Estados e cidades do IBGE — só fazem sentido para o Brasil.
  useEffect(() => {
    if (filtro.pais !== "Brasil") return;
    let vivo = true;
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((r) => r.json())
      .then((d) => {
        if (!vivo) return;
        setEstados([
          "Qualquer",
          ...d.map((e) => e.sigla).sort((a, b) => a.localeCompare(b)),
        ]);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [filtro.pais]);

  useEffect(() => {
    if (!filtro.estado || filtro.estado === "Qualquer") {
      setCidades(["Qualquer"]);
      return;
    }
    let vivo = true;
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${filtro.estado}/municipios`
    )
      .then((r) => r.json())
      .then((d) => {
        if (!vivo) return;
        setCidades([
          "Qualquer",
          ...d.map((e) => e.nome).sort((a, b) => a.localeCompare(b)),
        ]);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [filtro.estado]);

  // Esc fecha a gaveta; o foco começa no botão de fechar.
  useEffect(() => {
    if (!gaveta) return;
    const onKey = (e) => e.key === "Escape" && setGaveta(false);
    window.addEventListener("keydown", onKey);
    fecharRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [gaveta]);

  const aplicar = (e) => {
    e?.preventDefault?.();
    setGaveta(false);
    onFilter(normalizar(filtro));
  };

  const limpar = () => {
    const limpo = { ...VAZIO, pais: filtro.pais };
    setFiltro(limpo);
    onFilter(normalizar(limpo));
  };

  const moeda = MOEDA[filtro.pais];
  const semPais = !filtro.pais;

  // Cada filtro ativo vira uma etiqueta que a pessoa pode tirar sozinha.
  const ativos = [
    filtro.pais && { chave: "pais", texto: filtro.pais, valor: "" },
    Number(filtro.id_imovel) > 0 && {
      chave: "id_imovel",
      texto: `Código ${filtro.id_imovel}`,
      valor: "",
    },
    filtro.tipo &&
      filtro.tipo !== "Qualquer" && {
        chave: "tipo",
        texto: filtro.tipo,
        valor: "",
      },
    filtro.cidade &&
      filtro.cidade !== "Qualquer" && {
        chave: "cidade",
        texto: filtro.cidade,
        valor: "",
      },
    filtro.bairro && { chave: "bairro", texto: filtro.bairro, valor: "" },
    Number(filtro.quartos) > 0 && {
      chave: "quartos",
      texto: `${filtro.quartos}+ quartos`,
      valor: 0,
    },
    Number(filtro.banheiros) > 0 && {
      chave: "banheiros",
      texto: `${filtro.banheiros}+ banheiros`,
      valor: 0,
    },
    Number(filtro.vagas) > 0 && {
      chave: "vagas",
      texto: `${filtro.vagas}+ vagas`,
      valor: 0,
    },
    Number(filtro.de) > 0 && {
      chave: "de",
      texto: `A partir de ${moeda || ""} ${Number(filtro.de).toLocaleString("pt-BR")}`,
      valor: 0,
    },
    Number(filtro.ate) > 0 && {
      chave: "ate",
      texto: `Até ${moeda || ""} ${Number(filtro.ate).toLocaleString("pt-BR")}`,
      valor: 0,
    },
  ].filter(Boolean);

  // Tirar uma etiqueta já refaz a busca — ninguém precisa clicar em Buscar.
  const remover = (chave, valor) => {
    const novo =
      chave === "pais"
        ? { ...VAZIO }
        : { ...filtro, [chave]: valor, ...(chave === "estado" ? { cidade: "" } : {}) };
    setFiltro(novo);
    onFilter(normalizar(novo));
  };

  return (
    <>
      <div
        className={`sticky top-[72px] z-30 transition-[padding] duration-500 ease-[var(--ease-saida)] max-[700px]:top-[64px] ${
          ancorada ? "py-2" : "py-0"
        }`}
      >
        <div className="mx-auto w-full max-w-[1320px] px-6 max-[700px]:px-4">
          <form
            onSubmit={aplicar}
            className={`border bg-surface transition-[border-color,box-shadow] duration-500 ease-[var(--ease-saida)] ${
              ancorada
                ? "border-line-strong shadow-lift"
                : "border-line-strong shadow-soft"
            }`}
          >
            <div className="grid grid-cols-[1.5fr_1fr_1fr_.9fr_auto] items-stretch max-[1020px]:grid-cols-2 max-[700px]:grid-cols-1">
              <label className={CAMPO}>
                <span className={ROTULO}>Bairro</span>
                <input
                  type="text"
                  value={filtro.bairro}
                  onChange={(e) => set("bairro", e.target.value)}
                  placeholder="Ex.: Jardim dos Estados"
                  className={VALOR}
                />
              </label>

              <label className={CAMPO}>
                <span className={ROTULO}>País</span>
                <select
                  value={filtro.pais}
                  onChange={(e) =>
                    setFiltro({
                      ...VAZIO,
                      bairro: filtro.bairro,
                      tipo: filtro.tipo,
                      quartos: filtro.quartos,
                      pais: e.target.value === "Qualquer" ? "" : e.target.value,
                    })
                  }
                  className={`${VALOR} cursor-pointer appearance-none`}
                >
                  {["Qualquer", "Brasil", "Estados Unidos", "Portugal"].map(
                    (o) => (
                      <option key={o}>{o}</option>
                    )
                  )}
                </select>
              </label>

              <label className={CAMPO}>
                <span className={ROTULO}>Tipo</span>
                <select
                  value={filtro.tipo}
                  onChange={(e) => set("tipo", e.target.value)}
                  className={`${VALOR} cursor-pointer appearance-none`}
                >
                  {["Qualquer", "Casa", "Apartamento", "Terreno"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>

              <label className={CAMPO}>
                <span className={ROTULO}>Quartos</span>
                <select
                  value={filtro.quartos}
                  onChange={(e) => set("quartos", e.target.value)}
                  className={`${VALOR} cursor-pointer appearance-none`}
                >
                  {OPCOES_QTD.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className="group relative flex cursor-pointer items-center justify-center gap-2.5 overflow-hidden bg-navy px-10 text-[15px] font-semibold text-white max-[700px]:py-4"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 origin-bottom scale-y-0 bg-gold transition-transform duration-500 ease-[var(--ease-saida)] group-hover:scale-y-100"
                />
                <FaSearch
                  size={14}
                  className="relative transition-colors duration-300 group-hover:text-navy-dark"
                />
                <span className="relative transition-colors duration-300 group-hover:text-navy-dark">
                  Buscar
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-5 py-3">
              <button
                type="button"
                onClick={() => setGaveta(true)}
                className="group inline-flex cursor-pointer items-center gap-2.5 text-[14px] font-semibold text-navy transition-colors duration-300 hover:text-gold-ink"
              >
                <FaSlidersH size={13} />
                Mais filtros
                <span aria-hidden="true" className="fio-cresce" />
              </button>

              {ativos.length > 0 && (
                <>
                  <span className="flex flex-wrap items-center gap-2">
                    {ativos.map((a) => (
                      <button
                        key={a.chave}
                        type="button"
                        onClick={() => remover(a.chave, a.valor)}
                        aria-label={`Remover filtro ${a.texto}`}
                        className="group inline-flex cursor-pointer items-center gap-2 border border-line-strong px-3 py-1.5 text-[13.5px] text-ink transition-colors duration-300 hover:border-navy hover:bg-navy hover:text-white"
                      >
                        {a.texto}
                        <FaTimes size={10} className="text-muted group-hover:text-white" />
                      </button>
                    ))}
                  </span>
                  <button
                    type="button"
                    onClick={limpar}
                    className="cursor-pointer text-[14px] font-semibold text-gold-ink underline-offset-4 hover:underline"
                  >
                    Limpar tudo
                  </button>
                </>
              )}

              {typeof total === "number" && (
                <span className="ml-auto text-[14px] tabular-nums text-muted">
                  {total} {total === 1 ? "imóvel" : "imóveis"}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ── Gaveta de filtros ──────────────────────────────────────────── */}
      {gaveta && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Fechar filtros"
            onClick={() => setGaveta(false)}
            className="absolute inset-0 cursor-default bg-navy-deep/60"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mais filtros"
            className="relative flex h-full w-[440px] max-w-full flex-col overflow-y-auto border-l border-gold/40 bg-canvas p-7 max-[700px]:p-5"
            style={{ animation: "entra-gaveta .5s var(--ease-saida) both" }}
          >
            <style>{`@keyframes entra-gaveta{from{transform:translateX(28px);opacity:0}}`}</style>

            <div className="regua mb-7">
              <h2 className="display-med m-0 text-[28px] text-ink">Filtros</h2>
              <button
                type="button"
                ref={fecharRef}
                onClick={() => setGaveta(false)}
                aria-label="Fechar filtros"
                className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-[2px] border border-line-strong text-muted transition-colors duration-300 hover:border-navy hover:bg-navy hover:text-white"
              >
                <FaTimes size={15} />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <Input
                label="País"
                type="text"
                select="true"
                selectOptions={[
                  "Qualquer",
                  "Brasil",
                  "Estados Unidos",
                  "Portugal",
                ]}
                value={filtro.pais}
                setValue={(v) =>
                  setFiltro({ ...VAZIO, pais: v === "Qualquer" ? "" : v })
                }
              />

              {filtro.pais === "Brasil" && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Estado"
                    type="text"
                    select="true"
                    selectOptions={estados}
                    value={filtro.estado}
                    setValue={(v) => set("estado", v)}
                  />
                  <Input
                    label="Cidade"
                    type="text"
                    select="true"
                    selectOptions={cidades}
                    value={filtro.cidade}
                    setValue={(v) => set("cidade", v)}
                  />
                </div>
              )}

              <Input
                label="Bairro"
                type="text"
                placeholder="Carandá Bosque"
                value={filtro.bairro}
                setValue={(v) => set("bairro", v)}
              />

              <Input
                label="Código do imóvel"
                type="text"
                inputMode="numeric"
                placeholder="1024"
                dica="O número que aparece na ficha do imóvel."
                value={filtro.id_imovel}
                setValue={(v) => set("id_imovel", apenasDigitos(v))}
              />

              {semPais && (
                <p className="m-0 border-l-2 border-gold bg-gold/10 px-4 py-3 text-[13.5px] text-gold-ink">
                  Escolha um país para filtrar por valor — cada país usa uma
                  moeda diferente.
                </p>
              )}

              <div
                className={`grid grid-cols-2 gap-4 ${
                  semPais ? "pointer-events-none opacity-40" : ""
                }`}
              >
                <Input
                  label="A partir de"
                  type="text"
                  inputMode="numeric"
                  prefixo={simboloMoeda(filtro.pais)}
                  placeholder="300.000"
                  value={formatarMilhar(filtro.de, filtro.pais)}
                  setValue={(v) => set("de", Number(apenasDigitos(v)))}
                  dica={
                    Number(filtro.de) > 0 ? valorPorExtenso(filtro.de) : null
                  }
                />
                <Input
                  label="Até"
                  type="text"
                  inputMode="numeric"
                  prefixo={simboloMoeda(filtro.pais)}
                  placeholder="1.500.000"
                  value={formatarMilhar(filtro.ate, filtro.pais)}
                  setValue={(v) => set("ate", Number(apenasDigitos(v)))}
                  dica={
                    Number(filtro.ate) > 0 ? valorPorExtenso(filtro.ate) : null
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Quartos"
                  type="text"
                  select="true"
                  selectOptions={OPCOES_QTD}
                  value={filtro.quartos}
                  setValue={(v) => set("quartos", v)}
                />
                <Input
                  label="Banheiros"
                  type="text"
                  select="true"
                  selectOptions={OPCOES_QTD}
                  value={filtro.banheiros}
                  setValue={(v) => set("banheiros", v)}
                />
                <Input
                  label="Vagas"
                  type="text"
                  select="true"
                  selectOptions={OPCOES_QTD}
                  value={filtro.vagas}
                  setValue={(v) => set("vagas", v)}
                />
              </div>
            </div>

            <div className="mt-auto flex gap-3 pt-7">
              <Button
                label="Limpar"
                variant="ghost"
                className="flex-1"
                onClick={limpar}
              />
              <Button
                label="Aplicar filtros"
                className="flex-1"
                onClick={aplicar}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
