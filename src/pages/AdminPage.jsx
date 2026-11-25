import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCheck,
  FaExclamationTriangle,
  FaKey,
  FaPlus,
  FaSearch,
  FaUserPlus,
  FaUsersCog,
} from "react-icons/fa";
import Header from "../components/Header";
import CardProperty from "../components/CardProperty";
import Modal from "../components/Modal";
import GavetaImovel from "../components/GavetaImovel";
import Input from "../components/Input";
import Button from "../components/Button";
import Revelar from "../components/Revelar";
import {
  ChangePasswordForm,
  NewAdminForm,
  AdminsList,
} from "../components/AdminAccountForms";
import {
  createImovel,
  deleteImovel,
  listImoveis,
  updateImovel,
} from "../services/imovelService";
import { isAdmin, logout } from "../utils/auth";
import { useRolou } from "../utils/motion";
import { formatarCep } from "../utils/formato";

// O painel carrega em páginas: com centenas de imóveis, trazer tudo de uma
// vez (mesmo só as capas) deixava a tela lenta — e o limite antigo de 200
// escondia o resto do catálogo.
const POR_PAGINA = 60;

const PAISES = ["Qualquer", "Brasil", "Estados Unidos", "Portugal"];
const TIPOS = ["Qualquer", "Casa", "Apartamento", "Terreno"];

const FILTRO_VAZIO = {
  id_imovel: "",
  pais: "",
  tipo: "",
  bairro: "",
  cidade: "",
  estado: "",
  quartos: 0,
  banheiros: 0,
  vagas: 0,
  de: 0,
  ate: 0,
};

const CAMPO =
  "flex flex-col gap-1 border-r border-line px-5 py-3.5 max-[1020px]:border-b max-[700px]:border-r-0";
const ROTULO = "text-[12px] font-semibold tracking-[.08em] text-muted";
const VALOR =
  "border-0 bg-transparent p-0 text-[16.5px] text-ink outline-none placeholder:text-muted/60";

function sanitizeNumber(value) {
  const clean = String(value).replace(/[^\d]/g, "");
  return clean === "" ? 0 : Number(clean);
}

function AdminPage() {
  const navigate = useNavigate();
  const ancorada = useRolou(140);

  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [filtroApi, setFiltroApi] = useState(null);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [totaisPais, setTotaisPais] = useState({ todos: 0, Brasil: 0, "Estados Unidos": 0, Portugal: 0 });
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState(false);
  const [filtro, setFiltro] = useState(FILTRO_VAZIO);
  const [aviso, setAviso] = useState(null); // { tipo: "ok" | "erro", texto }

  const [modalType, setModalType] = useState(null);
  const [propertyId, setPropertyId] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const mostrar = useCallback((tipo, texto) => {
    setAviso({ tipo, texto });
    setTimeout(() => setAviso(null), 4000);
  }, []);

  // ── Carga inicial ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAdmin()) {
      logout();
      navigate("/login", { replace: true });
      return;
    }

    carregar(null);
    atualizarTotais();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizarLista = (items) => items.map((p) => ({ ...p, ind: Number(p.ind) }));

  // Primeira página de um filtro (ou do catálogo todo, com filtro null).
  const carregar = async (f) => {
    try {
      setCarregando(true);
      setErroCarga(false);
      const { items, total: t } = await listImoveis(f, 1, POR_PAGINA);
      setProperties(normalizarLista(items));
      setTotal(typeof t === "number" ? t : items.length);
      setPagina(1);
      setFiltroApi(f);
    } catch (err) {
      console.error("Erro ao carregar imóveis:", err);
      setErroCarga(true);
    } finally {
      setCarregando(false);
    }
  };

  const carregarMais = async () => {
    if (carregandoMais) return;
    setCarregandoMais(true);
    try {
      const { items } = await listImoveis(filtroApi, pagina + 1, POR_PAGINA);
      setProperties((prev) => {
        const vistos = new Set(prev.map((p) => p.ind));
        return [...prev, ...normalizarLista(items).filter((p) => !vistos.has(p.ind))];
      });
      setPagina((n) => n + 1);
    } catch (err) {
      console.error("Erro ao carregar mais imóveis:", err);
      mostrar("erro", "Não foi possível carregar mais imóveis.");
    } finally {
      setCarregandoMais(false);
    }
  };

  // Contadores do topo: total real do banco (limit 1 + with_total), não só
  // o que está carregado na tela.
  const atualizarTotais = async () => {
    try {
      const [todos, br, us, pt] = await Promise.all(
        [null, { pais: "Brasil" }, { pais: "Estados Unidos" }, { pais: "Portugal" }].map((f) =>
          listImoveis(f, 1, 1).then((r) => r.total || 0)
        )
      );
      setTotaisPais({ todos, Brasil: br, "Estados Unidos": us, Portugal: pt });
    } catch (err) {
      console.error("Erro ao contar imóveis:", err);
    }
  };

  // ── Filtro ────────────────────────────────────────────────────────────
  const aplicarFiltro = async (e) => {
    e?.preventDefault?.();
    const limpo = { ...filtro };
    ["pais", "tipo"].forEach((k) => {
      if (limpo[k] === "Qualquer") limpo[k] = "";
    });

    await carregar({ ...limpo, id_imovel: Number(limpo.id_imovel) || 0 });
  };

  const limparFiltro = async () => {
    setFiltro(FILTRO_VAZIO);
    await carregar(null);
  };

  // ── Ações sobre o imóvel ──────────────────────────────────────────────
  const apagarImovel = async () => {
    try {
      await deleteImovel(propertyId);
      setProperties((prev) => prev.filter((p) => p.ind !== propertyId));
      setTotal((t) => Math.max(0, t - 1));
      atualizarTotais();
      fecharModal();
      mostrar("ok", `Imóvel ${propertyId} removido do catálogo.`);
    } catch (err) {
      console.error("Erro ao deletar imóvel:", err);
      mostrar("erro", "Não foi possível remover o imóvel.");
    }
  };

  const paraEnvio = (p, id) => ({
    ...(id ? { id } : {}),
    rua: String(p.rua || ""),
    bairro: String(p.bairro || ""),
    cidade: String(p.cidade || ""),
    estado: String(p.estado || ""),
    pais: String(p.pais || ""),
    area: sanitizeNumber(p.area),
    quartos: sanitizeNumber(p.quartos),
    suites: sanitizeNumber(p.suites),
    banheiros: sanitizeNumber(p.banheiros),
    vagas: sanitizeNumber(p.vagas),
    andar: sanitizeNumber(p.andar),
    valor: sanitizeNumber(p.valor),
    // Número do endereço é texto: "1221-A", "S/N" ou vazio (imóveis de
    // parceiros). Converter para número transformava vazio em "0".
    numero: String(p.numero ?? "").trim() === "0" ? "" : String(p.numero ?? "").trim(),
    // Guarda o CEP no mesmo formato do resto da base (00000-000) em vez de
    // oito dígitos soltos.
    cep:
      p.pais === "Brasil"
        ? formatarCep(p.cep)
        : String(p.cep || "").trim(),
    tipo: p.tipo || "Casa",
    situacao: p.situacao || "Venda",
    // Sem este campo o backend interpreta como false e o imóvel nasce
    // indisponível, sumindo do catálogo.
    disponivel: p.disponivel === false ? "false" : "true",
    descricao: String(p.descricao || ""),
    // Só fotos NOVAS (File) vão no envio. As que já estão salvas chegam como
    // base64 e não precisam voltar — sem fotos novas o backend mantém as atuais.
    imagem: (p.imagem || []).filter((f) => f instanceof File),
    ...(p.id_pessoa ? { id_pessoa: p.id_pessoa } : {}),
  });

  const salvarEdicao = async () => {
    if (!selectedProperty) return;
    const id = selectedProperty.ind;
    const corpo = paraEnvio(selectedProperty, id);
    try {
      await updateImovel(corpo);
      const { imagem, ...campos } = corpo;
      if (imagem.length > 0) {
        // Fotos trocadas: busca de novo para o card mostrar a capa nova.
        await carregar(filtroApi);
      } else {
        setProperties((prev) =>
          prev.map((p) => (p.ind === id ? { ...p, ...campos, ind: id } : p))
        );
      }
      fecharModal();
      mostrar("ok", `Imóvel ${id} atualizado.`);
    } catch (err) {
      console.error("Erro ao editar imóvel:", err);
      mostrar("erro", "Não foi possível salvar as alterações.");
    }
  };

  const criarImovel = async (novo) => {
    try {
      await createImovel(paraEnvio(novo));
      fecharModal();
      mostrar("ok", "Imóvel publicado no catálogo.");
      await carregar(filtroApi);
      atualizarTotais();
    } catch (err) {
      console.error("Erro ao adicionar imóvel:", err);
      mostrar("erro", "Não foi possível publicar o imóvel.");
    }
  };

  const abrirModal = useCallback(
    (tipo, id = null) => {
      const numericId = Number(id);
      setSelectedProperty(
        properties.find((p) => Number(p.ind) === numericId) || null
      );
      setModalType(tipo);
      setPropertyId(numericId);
    },
    [properties]
  );

  const fecharModal = useCallback(() => {
    setModalType(null);
    setPropertyId(null);
    setSelectedProperty(null);
  }, []);


  const filtroAtivo =
    Object.entries(filtro).filter(
      ([k, v]) => v !== "" && v !== 0 && v !== "Qualquer" && k !== "estado"
    ).length > 0;

  return (
    <>
      <Header
        admin={true}
        adminActions={[
          {
            label: "Administradores",
            icon: <FaUsersCog />,
            onClick: () => abrirModal("admins"),
          },
          {
            label: "Novo admin",
            icon: <FaUserPlus />,
            onClick: () => abrirModal("newAdmin"),
          },
          {
            label: "Alterar senha",
            icon: <FaKey />,
            onClick: () => abrirModal("password"),
          },
        ]}
      />

      {/* ── Aviso curto, no lugar do alert() do navegador ──────────────── */}
      {aviso && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 border-l-2 px-5 py-4 text-[14.5px] shadow-lift ${
            aviso.tipo === "ok"
              ? "border-gold bg-navy text-white"
              : "border-red-700 bg-white text-red-800"
          }`}
          style={{ animation: "entra-aviso .4s var(--ease-saida) both" }}
        >
          <style>{`@keyframes entra-aviso{from{transform:translateY(10px);opacity:0}}`}</style>
          {aviso.tipo === "ok" ? (
            <FaCheck className="text-gold" />
          ) : (
            <FaExclamationTriangle />
          )}
          {aviso.texto}
        </div>
      )}

      <main className="min-h-[70vh] bg-canvas pb-24">
        {/* ── Abertura do painel ───────────────────────────────────────── */}
        <section className="grao relative isolate overflow-hidden bg-navy-dark text-white">
          <div className="mx-auto w-full max-w-[1320px] px-6 py-12 max-[700px]:px-4 max-[700px]:py-8">
            <Revelar as="p" className="etiqueta m-0 mb-5">
              Painel da Bretas Imóveis
            </Revelar>

            <h1 className="display m-0 max-w-[16ch] text-[clamp(28px,3.6vw,50px)] text-white">
              Catálogo de imóveis
            </h1>

            <Revelar
              ordem={1}
              className="mt-9 grid grid-cols-4 gap-px bg-white/15 max-[760px]:grid-cols-2"
            >
              {[
                { label: "Imóveis no catálogo", valor: totaisPais.todos },
                { label: "No Brasil", valor: totaisPais["Brasil"] },
                {
                  label: "Nos Estados Unidos",
                  valor: totaisPais["Estados Unidos"],
                },
                { label: "Em Portugal", valor: totaisPais["Portugal"] },
              ].map((b) => (
                <div key={b.label} className="bg-navy-dark px-5 py-5">
                  <p className="preco m-0 text-[34px] leading-none text-gold">
                    {b.valor}
                  </p>
                  <p className="m-0 mt-2 text-[13.5px] text-white/60">
                    {b.label}
                  </p>
                </div>
              ))}
            </Revelar>
          </div>
        </section>

        {/* ── Barra de trabalho ────────────────────────────────────────── */}
        <div
          className={`sticky top-[72px] z-30 transition-[padding] duration-500 ease-[var(--ease-saida)] max-[700px]:top-[64px] ${
            ancorada ? "py-2" : "py-0"
          }`}
        >
          <div className="mx-auto w-full max-w-[1320px] px-6 max-[700px]:px-4">
            <form
              onSubmit={aplicarFiltro}
              className={`-mt-8 border border-line-strong bg-surface transition-shadow duration-500 ${
                ancorada ? "shadow-lift" : "shadow-soft"
              }`}
            >
              <div className="grid grid-cols-[.8fr_1fr_1fr_1.2fr_auto] items-stretch max-[1020px]:grid-cols-2 max-[700px]:grid-cols-1">
                <label className={CAMPO}>
                  <span className={ROTULO}>Código</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={filtro.id_imovel}
                    onChange={(e) =>
                      setFiltro({
                        ...filtro,
                        id_imovel: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    placeholder="1024"
                    className={VALOR}
                  />
                </label>

                <label className={CAMPO}>
                  <span className={ROTULO}>País</span>
                  <select
                    value={filtro.pais}
                    onChange={(e) =>
                      setFiltro({ ...filtro, pais: e.target.value })
                    }
                    className={`${VALOR} cursor-pointer appearance-none`}
                  >
                    {PAISES.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </label>

                <label className={CAMPO}>
                  <span className={ROTULO}>Tipo</span>
                  <select
                    value={filtro.tipo}
                    onChange={(e) =>
                      setFiltro({ ...filtro, tipo: e.target.value })
                    }
                    className={`${VALOR} cursor-pointer appearance-none`}
                  >
                    {TIPOS.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </label>

                <label className={CAMPO}>
                  <span className={ROTULO}>Bairro</span>
                  <input
                    type="text"
                    value={filtro.bairro}
                    onChange={(e) =>
                      setFiltro({ ...filtro, bairro: e.target.value })
                    }
                    placeholder="Ex.: Jardim dos Estados"
                    className={VALOR}
                  />
                </label>

                <button
                  type="submit"
                  className="group relative flex cursor-pointer items-center justify-center gap-2.5 overflow-hidden bg-navy px-9 text-[15px] font-semibold text-white max-[700px]:py-4"
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
                    Filtrar
                  </span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line px-5 py-3">
                <Button
                  label="Novo imóvel"
                  icon={<FaPlus size={13} />}
                  className="px-5 py-2.5 text-[14px]"
                  onClick={() => abrirModal("add", null)}
                />

                {filtroAtivo && (
                  <button
                    type="button"
                    onClick={limparFiltro}
                    className="cursor-pointer text-[14px] font-semibold text-gold-ink underline-offset-4 hover:underline"
                  >
                    Limpar filtros
                  </button>
                )}

                <span className="ml-auto text-[14px] tabular-nums text-muted">
                  {carregando
                    ? "Carregando…"
                    : `${properties.length} de ${total} ${
                        total === 1 ? "imóvel" : "imóveis"
                      }`}
                </span>
              </div>
            </form>
          </div>
        </div>

        {/* ── Lista ────────────────────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-[1320px] px-6 pt-12 max-[700px]:px-4 max-[700px]:pt-8">
          <div className="regua mb-10 max-[700px]:mb-8">
            <h2 className="display m-0 text-[clamp(24px,2.8vw,38px)] text-ink">
              Imóveis publicados
            </h2>
          </div>

          {carregando ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-8 gap-y-14">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse border-t border-line-strong"
                >
                  <div className="aspect-[4/3] w-full bg-line/70" />
                  <div className="mt-4 h-7 w-2/5 bg-line/70" />
                  <div className="mt-3 h-4 w-4/5 bg-line/70" />
                </div>
              ))}
            </div>
          ) : erroCarga ? (
            <div className="flex flex-col items-center justify-center border-y border-line-strong px-6 py-20 text-center">
              <h3 className="display-med m-0 mb-3 text-[24px] text-ink">
                Não conseguimos carregar o catálogo
              </h3>
              <p className="m-0 mb-7 text-muted">
                Verifique se a API está no ar e tente de novo.
              </p>
              <Button label="Tentar novamente" onClick={limparFiltro} />
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center border-y border-line-strong px-6 py-20 text-center">
              <h3 className="display-med m-0 mb-3 text-[24px] text-ink">
                Nenhum imóvel nesta lista
              </h3>
              <p className="m-0 mb-7 max-w-[46ch] text-muted">
                {filtroAtivo
                  ? "Nenhum imóvel bate com o filtro. Limpe os campos para ver o catálogo inteiro."
                  : "O catálogo está vazio. Publique o primeiro imóvel da Bretas Imóveis."}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  label="Novo imóvel"
                  icon={<FaPlus size={13} />}
                  onClick={() => abrirModal("add", null)}
                />
                {filtroAtivo && (
                  <Button
                    label="Limpar filtros"
                    variant="ghost"
                    onClick={limparFiltro}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-8 gap-y-14">
              {properties.map((property, i) => (
                <CardProperty
                  key={property.ind}
                  property={property}
                  admin={true}
                  handleOpen={abrirModal}
                  ordem={i % 4}
                />
              ))}
            </div>
          )}

          {!carregando && !erroCarga && properties.length < total && (
            <div className="mt-14 flex flex-col items-center gap-3">
              <p className="m-0 text-[14px] tabular-nums text-muted">
                Mostrando {properties.length} de {total} imóveis
              </p>
              <Button
                label={carregandoMais ? "Carregando…" : "Carregar mais"}
                variant="ghost"
                disabled={carregandoMais}
                onClick={carregarMais}
              />
            </div>
          )}
        </section>
      </main>

      {/* ── Janelas ──────────────────────────────────────────────────────*/}
      {modalType === "password" && (
        <Modal
          title="Alterar senha"
          largura="max-w-[520px]"
          data={<ChangePasswordForm onDone={fecharModal} />}
          onClose={fecharModal}
        />
      )}

      {modalType === "admins" && (
        <Modal
          title="Administradores"
          description="Quem pode entrar no painel. Os imóveis de quem for excluído passam para a sua conta."
          largura="max-w-[560px]"
          data={<AdminsList />}
          onClose={fecharModal}
        />
      )}

      {modalType === "newAdmin" && (
        <Modal
          title="Novo administrador"
          largura="max-w-[520px]"
          data={<NewAdminForm onDone={fecharModal} />}
          onClose={fecharModal}
        />
      )}

      {modalType === "edit" && selectedProperty && (
        <GavetaImovel
          inicial={selectedProperty}
          titulo={`Imóvel ${propertyId}`}
          subtitulo="Edite o que mudou e salve ao final."
          rotulo="Salvar alterações"
          onSubmit={salvarEdicao}
          onChange={setSelectedProperty}
          onClose={fecharModal}
        />
      )}

      {modalType === "add" && (
        <GavetaImovel
          titulo="Novo imóvel"
          subtitulo="Três etapas: onde fica, como é e como anunciar."
          rotulo="Publicar imóvel"
          onSubmit={criarImovel}
          onClose={fecharModal}
        />
      )}

      {modalType === "delete" && (
        <Modal
          title="Remover do catálogo?"
          description={`O imóvel ${propertyId} sai do ar e as fotos são perdidas. Não dá para desfazer.`}
          onClose={fecharModal}
          data={
            <div className="flex gap-3">
              <Button
                label="Cancelar"
                variant="ghost"
                className="flex-1"
                onClick={fecharModal}
              />
              <Button
                label="Remover"
                variant="danger"
                className="flex-1"
                onClick={apagarImovel}
              />
            </div>
          }
        />
      )}
    </>
  );
}

export default AdminPage;
