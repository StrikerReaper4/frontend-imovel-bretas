import { useEffect, useState } from "react";
import Gaveta from "./Gaveta";
import Input from "./Input";
import Button from "./Button";
import {
  apenasDigitos,
  formatarCep,
  formatarMilhar,
  simboloMoeda,
  valorPorExtenso,
} from "../utils/formato";
import { otimizarFotos, TIPOS_ACEITOS } from "../utils/imagem";

/**
 * Cadastro de imóvel em três etapas, dentro da gaveta lateral.
 * Vinte campos num modal centrado viram parede de caixinhas; aqui cada etapa
 * mostra só o que cabe numa coluna, e o rodapé conduz o caminho.
 */
const IMOVEL_VAZIO = {
  tipo: "Casa",
  rua: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
  pais: "Brasil",
  area: 0,
  quartos: 0,
  banheiros: 0,
  suites: 0,
  vagas: 0,
  andar: 0,
  valor: 0,
  situacao: "Venda",
  disponivel: true,
  id_pessoa: 1,
  descricao: "",
  imagem: [],
};

const ETAPAS = ["Onde fica", "Como é", "Anúncio"];

export default function GavetaImovel({
  inicial,
  titulo,
  subtitulo,
  rotulo,
  onSubmit,
  onChange,
  onClose,
}) {
  const [imovel, setImovel] = useState(inicial || IMOVEL_VAZIO);
  const [etapa, setEtapa] = useState(0);
  const [estados, setEstados] = useState(["Qualquer"]);
  const [cidades, setCidades] = useState(["Qualquer"]);
  const [otimizando, setOtimizando] = useState(false);
  const [erroFoto, setErroFoto] = useState("");
  const editando = Boolean(inicial);

  const aplicar = (campos) => setImovel((atual) => ({ ...atual, ...campos }));

  // Avisa quem abriu a gaveta depois do render — chamar onChange dentro do
  // updater do setState dispara "Cannot update a component while rendering".
  useEffect(() => {
    onChange?.(imovel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imovel]);

  const set = (campo, valor) => aplicar({ [campo]: valor });

  useEffect(() => {
    if (imovel.pais !== "Brasil") return;
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
  }, [imovel.pais]);

  useEffect(() => {
    const uf = imovel.estado;
    if (!uf || uf === "Qualquer") {
      setCidades(["Qualquer"]);
      return;
    }
    let vivo = true;
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
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
  }, [imovel.estado]);

  // Conta só as fotos escolhidas agora — na edição, `imagem` vem com a capa
  // já salva (base64), que não é uma foto nova.
  const fotos = Array.isArray(imovel.imagem)
    ? imovel.imagem.filter((f) => f instanceof File).length
    : 0;

  const escolherFotos = async (e) => {
    const arquivos = Array.from(e.target.files || []);
    if (arquivos.length === 0) return;
    setErroFoto("");
    setOtimizando(true);
    try {
      set("imagem", await otimizarFotos(arquivos));
    } catch (err) {
      e.target.value = "";
      set("imagem", []);
      setErroFoto(err.message);
    } finally {
      setOtimizando(false);
    }
  };
  const ultima = etapa === ETAPAS.length - 1;

  const resumo = [
    [imovel.rua, imovel.numero].filter(Boolean).join(", "),
    [imovel.bairro, imovel.cidade].filter(Boolean).join(" · "),
    imovel.pais,
  ].filter(Boolean);

  const rodape = (
    <div className="flex items-center gap-5">
      <p className="m-0 hidden flex-1 truncate text-[13.5px] text-muted min-[760px]:block">
        {resumo.length > 0 ? resumo.join(" — ") : "Comece pelo endereço."}
      </p>

      <div className="flex flex-1 gap-3 min-[760px]:flex-none">
        {etapa > 0 && (
          <Button
            label="Voltar"
            variant="ghost"
            className="flex-1 min-[760px]:flex-none"
            onClick={() => setEtapa((e) => e - 1)}
          />
        )}
        {ultima ? (
          <Button
            label={otimizando ? "Otimizando fotos…" : rotulo}
            disabled={otimizando}
            className="flex-1 min-[760px]:flex-none"
            onClick={() => onSubmit(imovel)}
          />
        ) : (
          <Button
            label="Avançar"
            className="flex-1 min-[760px]:flex-none"
            onClick={() => setEtapa((e) => e + 1)}
          />
        )}
      </div>
    </div>
  );

  return (
    <Gaveta
      titulo={titulo}
      subtitulo={subtitulo}
      passos={ETAPAS}
      passoAtual={etapa}
      onPasso={setEtapa}
      onClose={onClose}
      rodape={rodape}
    >
      {etapa === 0 && (
        <div className="flex flex-col gap-5">
          <Input
            label="País"
            type="text"
            select="true"
            selectOptions={["Brasil", "Estados Unidos", "Portugal"]}
            value={imovel.pais}
            setValue={(v) =>
              aplicar({ pais: String(v), estado: "", cidade: "" })
            }
          />

          <div className="grid grid-cols-2 gap-5 max-[560px]:grid-cols-1">
            {imovel.pais === "Brasil" ? (
              <>
                <Input
                  label="Estado"
                  type="text"
                  select="true"
                  selectOptions={estados}
                  value={imovel.estado}
                  setValue={(v) => set("estado", String(v))}
                />
                <Input
                  label="Cidade"
                  type="text"
                  select="true"
                  selectOptions={cidades}
                  value={imovel.cidade}
                  setValue={(v) => set("cidade", String(v))}
                />
              </>
            ) : (
              <>
                <Input
                  label="Estado ou região"
                  type="text"
                  value={imovel.estado}
                  setValue={(v) => set("estado", String(v))}
                />
                <Input
                  label="Cidade"
                  type="text"
                  value={imovel.cidade}
                  setValue={(v) => set("cidade", String(v))}
                />
              </>
            )}
          </div>

          <Input
            label="Bairro"
            type="text"
            placeholder={
              imovel.pais === "Portugal" ? "Belém" : "Jardim dos Estados"
            }
            value={imovel.bairro}
            setValue={(v) => set("bairro", String(v))}
          />

          <div className="grid grid-cols-[2fr_.8fr_1fr] gap-5 max-[560px]:grid-cols-1">
            <Input
              label="Rua"
              type="text"
              placeholder="Rua Antônio Maria Coelho"
              value={imovel.rua}
              setValue={(v) => set("rua", String(v))}
            />
            <Input
              label="Número"
              type="text"
              inputMode="numeric"
              placeholder="1420"
              value={imovel.numero}
              setValue={(v) => set("numero", apenasDigitos(v))}
            />
            <Input
              label={imovel.pais === "Brasil" ? "CEP" : "Código postal"}
              type="text"
              inputMode="numeric"
              maxLength={imovel.pais === "Brasil" ? 9 : 12}
              placeholder={imovel.pais === "Brasil" ? "79002-363" : "1300-343"}
              value={
                imovel.pais === "Brasil"
                  ? formatarCep(imovel.cep)
                  : imovel.cep
              }
              setValue={(v) => set("cep", apenasDigitos(v))}
            />
          </div>
        </div>
      )}

      {etapa === 1 && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-5 max-[560px]:grid-cols-1">
            <Input
              label="Tipo"
              type="text"
              select="true"
              selectOptions={["Casa", "Apartamento", "Terreno"]}
              value={imovel.tipo}
              setValue={(v) => set("tipo", String(v))}
            />
            <Input
              label="Área útil"
              type="text"
              inputMode="numeric"
              sufixo="m²"
              placeholder="120"
              value={imovel.area || ""}
              setValue={(v) => set("area", Number(apenasDigitos(v)))}
            />
          </div>

          <div className="grid grid-cols-4 gap-4 max-[560px]:grid-cols-2">
            <Input
              label="Quartos"
              type="text"
              inputMode="numeric"
              placeholder="3"
              value={imovel.quartos || ""}
              setValue={(v) => set("quartos", Number(apenasDigitos(v)))}
            />
            <Input
              label="Suítes"
              type="text"
              inputMode="numeric"
              placeholder="1"
              value={imovel.suites || ""}
              setValue={(v) => set("suites", Number(apenasDigitos(v)))}
            />
            <Input
              label="Banheiros"
              type="text"
              inputMode="numeric"
              placeholder="2"
              value={imovel.banheiros || ""}
              setValue={(v) => set("banheiros", Number(apenasDigitos(v)))}
            />
            <Input
              label="Vagas"
              type="text"
              inputMode="numeric"
              placeholder="2"
              value={imovel.vagas || ""}
              setValue={(v) => set("vagas", Number(apenasDigitos(v)))}
            />
          </div>

          <div className="grid grid-cols-2 gap-5 max-[560px]:grid-cols-1">
            <Input
              label="Andar"
              type="text"
              inputMode="numeric"
              placeholder="7"
              dica="Deixe vazio para casas e terrenos."
              value={imovel.andar || ""}
              setValue={(v) => set("andar", Number(apenasDigitos(v)))}
            />
            <Input
              label="Situação"
              type="text"
              select="true"
              selectOptions={["Venda", "Aluguel"]}
              value={imovel.situacao || "Venda"}
              setValue={(v) => set("situacao", String(v))}
            />
          </div>
        </div>
      )}

      {etapa === 2 && (
        <div className="flex flex-col gap-5">
          <Input
            label="Anúncio"
            type="text"
            select="true"
            selectOptions={["Disponível", "Indisponível"]}
            value={imovel.disponivel === false ? "Indisponível" : "Disponível"}
            setValue={(v) => set("disponivel", v === "Disponível")}
            dica="Imóvel indisponível continua no painel, mas sai do catálogo."
          />

          <Input
            label="Valor do imóvel"
            type="text"
            inputMode="numeric"
            prefixo={simboloMoeda(imovel.pais)}
            placeholder="1.250.000"
            value={formatarMilhar(imovel.valor, imovel.pais)}
            setValue={(v) => set("valor", Number(apenasDigitos(v)))}
            dica={
              imovel.valor > 0
                ? `${simboloMoeda(imovel.pais)} ${valorPorExtenso(imovel.valor)}`
                : "Só números: a pontuação entra sozinha."
            }
          />

          <Input
            label="Descrição"
            textarea
            rows={6}
            placeholder={
              "Ex.: Casa térrea reformada, sala integrada com a varanda, " +
              "cozinha planejada e quintal com churrasqueira. Rua tranquila, " +
              "cinco minutos do centro."
            }
            value={imovel.descricao}
            setValue={(v) => set("descricao", String(v))}
            dica={
              imovel.descricao
                ? `${imovel.descricao.length} caracteres`
                : "Conte o que a foto não mostra: reforma, vizinhança, vista."
            }
          />

          <div>
            <Input
              label="Fotos"
              type="file"
              wid="full"
              multiple
              accept={TIPOS_ACEITOS}
              className="file:mr-3 file:cursor-pointer file:border-0 file:bg-navy file:px-4 file:py-2 file:text-white file:transition-colors file:hover:bg-navy-dark"
              setValue={escolherFotos}
            />
            <p className="m-0 mt-2 text-[13.5px] text-muted">
              {otimizando
                ? "Otimizando as fotos…"
                : fotos > 0
                ? `${fotos} ${
                    fotos === 1 ? "foto escolhida" : "fotos escolhidas"
                  }. A primeira vira a capa.${
                    editando ? " Elas substituem as fotos atuais." : ""
                  }`
                : editando
                ? "Sem novas fotos, as atuais continuam. Escolher fotos substitui todas."
                : "A primeira foto vira a capa no catálogo."}
            </p>
            {erroFoto && (
              <p role="alert" className="m-0 mt-2 text-[13.5px] text-red-800">
                {erroFoto}
              </p>
            )}
          </div>
        </div>
      )}
    </Gaveta>
  );
}
