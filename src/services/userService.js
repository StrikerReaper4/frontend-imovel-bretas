import api from "./api";
export const Login = async (login) => {
  try {
    const response = await api.post("/criar/usuario", login);
    return response;
  } catch (error) {
    console.error("Erro ao pegar imóveis:", error);
    return 0;
  }
};
