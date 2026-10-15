import axios from "axios";
import { local } from "../utils/storage";

const api = axios.create({
  baseURL: "https://api.bretasimoveis.cloud",
});

// Envia o token do admin em todas as requisições — criar/editar/deletar imóvel
// e as rotas de conta exigem login no backend.
api.interceptors.request.use((config) => {
  const token = local.get("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Sessão expirada no backend: limpa o login e manda para a tela de entrada.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    if (error.response?.status === 401 && local.get("token") && !url.includes("/login/")) {
      local.remove("token");
      local.remove("token_expiry");
      local.remove("user");
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Mensagem amigável vinda da API ({ erro }) ou um texto padrão.
export const apiErrorMessage = (error, fallback = "Algo deu errado. Tente novamente.") =>
  error?.response?.data?.erro || fallback;

export default api;
