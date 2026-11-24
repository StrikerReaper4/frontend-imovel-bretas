import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaLock } from "react-icons/fa";
import Button from "../components/Button";
import Revelar, { TituloLinhas } from "../components/Revelar";
import { Login } from "../services/userService";
import { isAdmin, isLoggedIn } from "../utils/auth";
import { useParallax } from "../utils/motion";

const CAMPO =
  "w-full border border-line-strong bg-surface px-4 py-3.5 text-[16px] text-ink " +
  "transition-colors duration-300 outline-none placeholder:text-muted/60 " +
  "focus:border-gold focus:ring-1 focus:ring-gold/60";

/**
 * Entrada da área restrita. Painel da marca à esquerda, formulário à direita —
 * em vez do cartão solto no meio da tela cinza.
 */
function LoginPage() {
  const navigate = useNavigate();
  const fotoRef = useParallax(0.05);

  const [loginInfos, setLoginInfos] = useState({
    nome: "admin",
    email: "",
    senha: "",
    role: "admin",
  });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Já logado? Vai direto para onde a pessoa deve estar.
  useEffect(() => {
    if (isLoggedIn())
      navigate(isAdmin() ? "/admin/logged" : "/", { replace: true });
  }, [navigate]);

  const efetuarLogin = async (e) => {
    e?.preventDefault();
    if (enviando) return;
    setErro("");
    setEnviando(true);
    const response = await Login(loginInfos);
    setEnviando(false);

    if (response?.status === 200 && isLoggedIn()) {
      // O sistema detecta o perfil: admin vai para o painel, os demais para a Home.
      navigate(isAdmin() ? "/admin/logged" : "/");
    } else {
      setErro("E-mail ou senha inválidos.");
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-[1.05fr_.95fr] max-[900px]:grid-cols-1">
      {/* ── Painel da marca ───────────────────────────────────────────── */}
      <section className="grao relative isolate flex flex-col justify-between overflow-hidden bg-navy-dark p-12 text-white max-[900px]:p-8 max-[700px]:p-6">
        <img
          ref={fotoRef}
          src="/placeholder_house.jpg"
          alt=""
          aria-hidden="true"
          className="parallax absolute inset-0 -z-20 h-[112%] w-full -translate-y-[6%] object-cover opacity-35"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(160deg,rgba(4,22,31,.92),rgba(4,22,31,.75))]"
        />

        <div className="flex flex-wrap items-center justify-between gap-5">
          <img
            src="/logo-nobg.png"
            alt="Bretas Imóveis"
            className="h-[58px] w-auto cursor-pointer max-[700px]:h-[46px]"
            onClick={() => navigate("/")}
          />
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex cursor-pointer items-center gap-3 text-[14.5px] text-white/70 transition-colors duration-300 hover:text-gold"
          >
            <FaArrowLeft size={13} />
            Voltar ao site
          </button>
        </div>

        <div className="py-16 max-[900px]:py-10">
          <Revelar as="p" className="etiqueta m-0 mb-6 flex flex-wrap items-center gap-3">
            Brasil
            <span aria-hidden="true" className="h-px w-5 bg-gold/60" />
            Estados Unidos
            <span aria-hidden="true" className="h-px w-5 bg-gold/60" />
            Portugal
          </Revelar>
          <h1 className="display m-0 max-w-[13ch] text-[clamp(34px,4.4vw,62px)] text-white">
            <TituloLinhas ordem={1} linhas={["Bretas Imóveis."]} />
          </h1>
        </div>

        <p className="m-0 flex items-center gap-4 border-t border-white/15 pt-6 text-[13.5px] text-white/45">
          <span aria-hidden="true" className="h-px w-10 bg-gold/70" />
          Campo Grande · Lisboa · Orlando
        </p>
      </section>

      {/* ── Formulário ────────────────────────────────────────────────── */}
      <section className="flex items-center justify-center bg-canvas px-12 py-16 max-[900px]:px-8 max-[700px]:px-5 max-[700px]:py-10">
        <form onSubmit={efetuarLogin} className="w-full max-w-[420px]">
          <div className="regua mb-9">
            <h2 className="display-med m-0 text-[30px] text-ink">Entrar</h2>
            <FaLock className="shrink-0 text-gold-ink max-[760px]:hidden" size={15} />
          </div>

          <label className="mb-5 block">
            <span className="mb-2 block text-[12.5px] font-semibold tracking-[.08em] text-muted">
              E-mail
            </span>
            <input
              type="email"
              autoComplete="username"
              required
              value={loginInfos.email}
              onChange={(e) =>
                setLoginInfos({ ...loginInfos, email: e.target.value })
              }
              placeholder="voce@bretasimoveis.cloud"
              className={CAMPO}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[12.5px] font-semibold tracking-[.08em] text-muted">
              Senha
            </span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={loginInfos.senha}
              onChange={(e) =>
                setLoginInfos({ ...loginInfos, senha: e.target.value })
              }
              placeholder="Sua senha"
              className={CAMPO}
            />
          </label>

          <p
            role="alert"
            aria-live="polite"
            className={`m-0 overflow-hidden border-l-2 border-red-700 bg-red-700/8 pl-4 text-[14px] text-red-800 transition-[max-height,opacity,margin,padding] duration-400 ease-[var(--ease-saida)] ${
              erro
                ? "mt-5 max-h-24 py-3 opacity-100"
                : "mt-0 max-h-0 py-0 opacity-0"
            }`}
          >
            {erro}
          </p>

          <Button
            type="submit"
            disabled={enviando}
            label={enviando ? "Entrando…" : "Entrar"}
            wid="full"
            className="mt-7"
            onClick={efetuarLogin}
          />

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-5 text-[14px]">
            <button
              type="button"
              onClick={() => navigate("/esqueci-senha")}
              className="cursor-pointer font-semibold text-navy underline-offset-4 transition-colors duration-300 hover:text-gold-ink hover:underline"
            >
              Esqueci minha senha
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="cursor-pointer text-muted underline-offset-4 transition-colors duration-300 hover:text-ink hover:underline"
            >
              Ver o site
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default LoginPage;
