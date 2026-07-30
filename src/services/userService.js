import api from "./api";
import { local } from "../utils/storage";

export const Login = async (login) => {
  try {
    const response = await api.post("/login/usuario", login);

    const data = response.data;

    if (data.pessoa && data.token) {
      local.setJSON("user", data.pessoa);
      local.set("token", data.token);
    } else {
      local.setJSON("user", data);
      if (data.token) {
        local.set("token", data.token);
      }
    }

    return response;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return 0;
  }
};
