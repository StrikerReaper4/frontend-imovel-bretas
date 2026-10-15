import api from "./api";
import { local } from "../utils/storage";

// Validade da sessão no front (o JWT do backend também expira).
const SESSION_MS = 60 * 60 * 1000;

export const Login = async (login) => {
  try {
    const response = await api.post("/login/usuario", login);

    const data = response.data;
    // A API responde { user, token } — versões antigas usavam `pessoa`.
    const user = data.user || data.pessoa || null;

    if (data.token) {
      local.set("token", data.token);
      local.set("token_expiry", String(Date.now() + SESSION_MS));
    }
    if (user) {
      // Nunca guardar a senha (mesmo em hash) no navegador.
      // eslint-disable-next-line no-unused-vars
      const { senha, ...safeUser } = user;
      local.setJSON("user", safeUser);
    }

    return response;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return 0;
  }
};

export const criarAdmin = (dados) => api.post("/admin/criar", dados);

export const alterarSenha = (senhaAtual, novaSenha) =>
  api.post("/admin/alterar-senha", { senha_atual: senhaAtual, nova_senha: novaSenha });

export const esqueciSenha = (email) => api.post("/senha/esqueci", { email });

export const redefinirSenha = (token, novaSenha) =>
  api.post("/senha/redefinir", { token, nova_senha: novaSenha });
