import { useEffect, useState } from "react";
import { FaWhatsapp, FaInstagram, FaUserCircle } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { IoMenu, IoExitOutline, IoClose } from "react-icons/io5";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { isAdmin, logout } from "../utils/auth";
import { useRolou } from "../utils/motion";

// O valor de `pais` precisa bater com o que está salvo no banco.
const FLAGS = [
  { pais: "Brasil", src: "/Bandeira_Brasil.png" },
  { pais: "Estados Unidos", src: "/Bandeira_EUA.png" },
  { pais: "Portugal", src: "/Bandeira_Portugal.png" },
];

const CONTATOS = [
  {
    label: "WhatsApp",
    icon: FaWhatsapp,
    href: "https://wa.me/5567992609967",
  },
  {
    label: "E-mail",
    icon: SiGmail,
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=imoveisbretas@gmail.com&su=Contato%20via%20site",
  },
  {
    label: "Instagram",
    icon: FaInstagram,
    href: "https://www.instagram.com/imoveisbretas?igsh=MWthM28xdTdwMTh1eg==",
  },
];

const LINKS = [
  { to: "/", label: "Imóveis" },
  { to: "/about", label: "Sobre nós" },
];

// adminActions: botões extras do painel (ex.: alterar senha, novo admin)
export default function Header({ admin, adminActions }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [menuAberto, setMenuAberto] = useState(false);
  const rolou = useRolou(60);

  const activePais = location.pathname === "/" ? searchParams.get("pais") : null;
  const adminLogado = isAdmin();

  // Fecha o menu ao trocar de página.
  useEffect(() => setMenuAberto(false), [location.pathname, location.search]);

  // Clicar na bandeira filtra por aquele país; clicar de novo remove o filtro.
  const filtrarPorPais = (pais) => {
    navigate(activePais === pais ? "/" : `/?pais=${encodeURIComponent(pais)}`);
  };

  // Sem `size`, o tamanho acompanha a largura da tela (topo do site): as
  // bandeiras ficam sempre visíveis, só encolhem em telas menores.
  const Bandeiras = ({ size }) => (
    <div className="flex items-center gap-2 max-[480px]:gap-1.5">
      {FLAGS.map((f) => {
        const ativa = activePais === f.pais;
        return (
          <button
            key={f.pais}
            type="button"
            aria-pressed={ativa}
            title={`Ver imóveis em ${f.pais}`}
            onClick={() => filtrarPorPais(f.pais)}
            className={`shrink-0 rounded-full transition-[transform,box-shadow,opacity] duration-200 hover:scale-110 cursor-pointer
              ${ativa ? "ring-2 ring-gold ring-offset-2 ring-offset-navy" : activePais ? "opacity-55" : ""}`}
          >
            <img
              src={f.src}
              alt={`Imóveis em ${f.pais}`}
              style={size ? { width: size, height: size } : undefined}
              className={`shrink-0 rounded-full object-cover ${
                size
                  ? ""
                  : "h-[34px] w-[34px] max-[1080px]:h-[30px] max-[1080px]:w-[30px] max-[480px]:h-[26px] max-[480px]:w-[26px] max-[360px]:h-[22px] max-[360px]:w-[22px]"
              }`}
            />
          </button>
        );
      })}
    </div>
  );

  const BotaoEntrar = ({ compacto }) => (
    <button
      type="button"
      onClick={() => navigate(adminLogado ? "/admin/logged" : "/login")}
      aria-label={adminLogado ? "Abrir painel do admin" : "Entrar"}
      className={`inline-flex items-center gap-2 font-semibold transition-colors duration-200 cursor-pointer
        ${compacto
          ? "h-11 w-11 justify-center text-white hover:text-gold"
          : "rounded-[2px] border border-gold px-5 py-2.5 text-[14.5px] text-gold hover:bg-gold hover:text-navy-dark"}`}
    >
      <FaUserCircle size={compacto ? 28 : 18} />
      {!compacto && (adminLogado ? "Painel" : "Entrar")}
    </button>
  );

  // ── Cabeçalho do painel administrativo ──────────────────────────────────
  if (admin) {
    return (
      <header className="w-full bg-navy">
        <div className="mx-auto flex w-full max-w-[1320px] flex-wrap items-center gap-4 px-6 py-4">
          <img
            src="/logo-nobg.png"
            onClick={() => navigate("/")}
            className="h-[64px] w-auto cursor-pointer"
            alt="Bretas Imóveis — ir para a página inicial"
          />
          <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
            {adminActions?.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={a.onClick}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-[15px] font-semibold text-navy transition-colors duration-200 hover:bg-gold hover:text-navy-dark"
              >
                {a.icon}
                {a.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-[15px] font-semibold text-white transition-colors duration-200 hover:border-gold hover:text-gold"
            >
              <IoExitOutline size={22} />
              Sair
            </button>
          </div>
        </div>
      </header>
    );
  }

  // ── Cabeçalho público ───────────────────────────────────────────────────
  return (
    <header
      className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-[background-color,border-color,padding] duration-500 ease-[var(--ease-saida)] ${
        rolou
          ? "border-gold/40 bg-navy-dark/95"
          : "border-white/10 bg-navy/90"
      }`}
    >
      <div
        className={`mx-auto flex w-full max-w-[1320px] items-center gap-4 px-6 transition-[padding] duration-500 ease-[var(--ease-saida)] max-[700px]:px-4 ${
          rolou ? "py-2" : "py-3.5"
        }`}
      >
        <img
          src="/logo-nobg.png"
          className={`w-auto cursor-pointer transition-[height] duration-500 ease-[var(--ease-saida)] max-[480px]:h-[42px] max-[360px]:h-[34px] ${rolou ? "h-[46px]" : "h-[56px]"}`}
          alt="Bretas Imóveis — ir para a página inicial"
          onClick={() => navigate("/")}
        />

        <nav aria-label="Principal" className="ml-6 flex gap-7 max-[860px]:hidden">
          {LINKS.map((l) => {
            const ativo = location.pathname === l.to;
            return (
              <button
                key={l.to}
                type="button"
                onClick={() => navigate(l.to)}
                aria-current={ativo ? "page" : undefined}
                className={`group relative cursor-pointer px-1 py-2 text-[15px] font-medium transition-colors duration-200
                  ${ativo ? "text-white" : "text-white/75 hover:text-white"}`}
              >
                {l.label}
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0 left-0 h-px bg-gold transition-all duration-300 ease-out
                    ${ativo ? "w-full" : "w-0 group-hover:w-full"}`}
                />
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3 max-[480px]:gap-2">
          <Bandeiras />

          <div className="flex items-center gap-2 max-[860px]:hidden">
            {CONTATOS.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={c.label}
                className="grid h-10 w-10 place-items-center text-white/80 transition-colors duration-200 hover:text-gold"
              >
                <c.icon size={20} />
              </a>
            ))}
          </div>

          <div className="max-[700px]:hidden">
            <BotaoEntrar />
          </div>
          <div className="hidden max-[700px]:block">
            <BotaoEntrar compacto />
          </div>

          <button
            type="button"
            onClick={() => setMenuAberto((v) => !v)}
            aria-expanded={menuAberto}
            aria-controls="menu-mobile"
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            className="hidden h-11 w-11 cursor-pointer place-items-center rounded-[2px] border border-white/25 text-white transition-colors duration-200 hover:border-gold hover:text-gold max-[860px]:grid"
          >
            {menuAberto ? <IoClose size={26} /> : <IoMenu size={26} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuAberto && (
        <div
          id="menu-mobile"
          className="hidden border-t border-white/10 bg-navy px-6 pb-6 pt-4 max-[860px]:block max-[700px]:px-4"
        >
          <nav aria-label="Principal (mobile)" className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <button
                key={l.to}
                type="button"
                onClick={() => navigate(l.to)}
                className={`display-med cursor-pointer border-b border-white/10 py-3.5 text-left text-[26px] transition-colors duration-200
                  ${location.pathname === l.to ? "text-gold" : "text-white hover:text-gold"}`}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <p className="mt-6 mb-3 text-[12px] font-semibold tracking-[.08em] text-white/55">
            Onde você procura
          </p>
          <Bandeiras size={40} />

          <p className="mt-6 mb-3 text-[12px] font-semibold tracking-[.08em] text-white/55">
            Fale com a gente
          </p>
          <div className="flex gap-3">
            {CONTATOS.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={c.label}
                className="grid h-12 w-12 place-items-center rounded-[2px] border border-white/20 text-white transition-colors duration-200 hover:border-gold hover:text-gold"
              >
                <c.icon size={22} />
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
