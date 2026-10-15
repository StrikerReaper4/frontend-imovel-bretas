import Button from "../components/Button";
import Input from "../components/Input";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Login } from "../services/userService";
import { isAdmin, isLoggedIn } from "../utils/auth";

function LoginPage() {
  const navigate = useNavigate();
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
    if (isLoggedIn()) navigate(isAdmin() ? "/admin/logged" : "/", { replace: true });
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
      setErro("Email ou senha inválidos.");
    }
  };

  return (
    <div className="w-screen min-h-screen flex justify-center items-center bg-gray-100 px-4">
      <form
        onSubmit={efetuarLogin}
        className="w-96 max-w-full p-6 bg-white rounded-xl shadow-md"
      >
        <img
          src="/logo-nobg.png"
          alt="Logo"
          className="h-25 mx-auto cursor-pointer"
          onClick={() => navigate("/")}
        />
        <Input
          type="email"
          label="Email"
          id="email"
          value={loginInfos.email}
          setValue={(newValue) =>
            setLoginInfos({ ...loginInfos, email: newValue })
          }
          placeholder="Digite seu email"
          className="mt-2"
        />
        <Input
          type="password"
          label="Senha"
          id="password"
          value={loginInfos.senha}
          setValue={(newValue) =>
            setLoginInfos({ ...loginInfos, senha: newValue })
          }
          placeholder="Digite sua senha"
          className="mt-2"
        />
        {erro && <p className="text-red-600 text-sm mt-2">{erro}</p>}
        <Button
          disabled={enviando}
          label={enviando ? "Entrando..." : "Entrar"}
          wid="full"
          className="p-2 mt-3"
          onClick={efetuarLogin}
        />
        <button
          type="button"
          onClick={() => navigate("/esqueci-senha")}
          className="w-full text-sm text-[#0f3e58] hover:underline mt-3 cursor-pointer"
        >
          Esqueci minha senha
        </button>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full text-sm text-gray-500 hover:text-gray-800 mt-3 cursor-pointer"
        >
          ← Voltar ao site
        </button>
      </form>
    </div>
  );
}
export default LoginPage;
