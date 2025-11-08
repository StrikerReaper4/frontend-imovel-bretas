import api from "./api";

export const Login = async (login) => {
  try {
    const response = await api.post("/login/usuario", login);

    const data = response.data;

    // 💾 Verifica o formato retornado pelo backend
    // Caso venha como { pessoa: {...}, token: "..." }
    if (data.pessoa && data.token) {
      localStorage.setItem("user", JSON.stringify(data.pessoa));
      localStorage.setItem("token", data.token);
      console.log("✅ Usuário salvo:", data.pessoa);
    }
    // Caso venha tudo no mesmo objeto { id, nome, token }
    else {
      localStorage.setItem("user", JSON.stringify(data));
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      console.log("✅ Usuário salvo:", data);
    }

    return response;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return 0;
  }
};
