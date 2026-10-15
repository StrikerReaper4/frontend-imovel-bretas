import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import { esqueciSenha, redefinirSenha } from "../services/userService";
import { apiErrorMessage } from "../services/api";

const SENHA_MINIMA = 8;

function AuthCard({ title, children }) {
  const navigate = useNavigate();
  return (
    <div className="w-screen min-h-screen flex justify-center items-center bg-gray-100 px-4">
      <div className="w-96 max-w-full p-6 bg-white rounded-xl shadow-md">
        <img
          src="/logo-nobg.png"
          alt="Logo"
          className="h-25 mx-auto cursor-pointer"
          onClick={() => navigate("/")}
        />
        <h2 className="text-xl font-bold text-[#0f3e58] text-center mt-2">{title}</h2>
        {children}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full text-sm text-gray-500 hover:text-gray-800 mt-3 cursor-pointer"
        >
          ← Voltar ao login
        </button>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setErro("Digite seu email.");
    setErro("");
    setEnviando(true);
    try {
      await esqueciSenha(email);
      setEnviado(true);
    } catch (err) {
      setErro(apiErrorMessage(err, "Não foi possível enviar o email agora."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthCard title="Recuperar senha">
      {enviado ? (
        <p className="text-sm text-gray-700 mt-4 text-center">
          Se <strong>{email}</strong> for o email de um admin, você vai receber um
          link para criar uma nova senha. Ele vale por 30 minutos — confira também
          a caixa de spam.
        </p>
      ) : (
        <form onSubmit={enviar}>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Informe o email da sua conta de admin.
          </p>
          <Input type="email" label="Email" wid="full" value={email}
            setValue={setEmail} placeholder="Digite seu email" className="mt-2" />
          {erro && <p className="text-red-600 text-sm mt-2">{erro}</p>}
          <Button label={enviando ? "Enviando..." : "Enviar link"} wid="full"
            className="p-2 mt-3" disabled={enviando} onClick={enviar} />
        </form>
      )}
    </AuthCard>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [nova, setNova] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setErro("");
    if (nova.length < SENHA_MINIMA)
      return setErro(`A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`);
    if (nova !== confirma) return setErro("As senhas não coincidem.");
    setEnviando(true);
    try {
      await redefinirSenha(token, nova);
      setOk(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setErro(apiErrorMessage(err, "Não foi possível redefinir a senha."));
    } finally {
      setEnviando(false);
    }
  };

  if (!token) {
    return (
      <AuthCard title="Link inválido">
        <p className="text-sm text-gray-700 mt-4 text-center">
          Este link de redefinição está incompleto. Peça um novo em “Esqueci minha senha”.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Criar nova senha">
      {ok ? (
        <p className="text-sm text-green-700 mt-4 text-center">
          Senha redefinida! Redirecionando para o login...
        </p>
      ) : (
        <form onSubmit={enviar}>
          <Input type="password" label="Nova senha" wid="full" value={nova}
            setValue={setNova} placeholder={`Mínimo ${SENHA_MINIMA} caracteres`} className="mt-2" />
          <Input type="password" label="Confirmar nova senha" wid="full" value={confirma}
            setValue={setConfirma} className="mt-2" />
          {erro && <p className="text-red-600 text-sm mt-2">{erro}</p>}
          <Button label={enviando ? "Salvando..." : "Salvar nova senha"} wid="full"
            className="p-2 mt-3" disabled={enviando} onClick={enviar} />
        </form>
      )}
    </AuthCard>
  );
}
