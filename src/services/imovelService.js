import api from "./api";

const toFormData = (obj) => {
  const formData = new FormData();

  for (const key in obj) {
    const value = obj[key];

    if (Array.isArray(value)) {
      value.forEach((item) => {
        formData.append(key, item);
      });
    } else if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (typeof value === "object" && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  }

  return formData;
};

// page começa em 1, limit define quantos imóveis por vez
export const getImoveis = async (page = 1, limit = 20) => {
  try {
    const response = await api.post("/filtrar/imoveis", { page, limit });
    const data = response?.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") return [data];
    return [];
  } catch (error) {
    console.error("Erro ao pegar imóveis:", error);
    return [];
  }
};

// filtro + paginação — o backend cuida do LIMIT/OFFSET
export const filterImoveis = async (filtro, page = 1, limit = 20) => {
  try {
    const response = await api.post("/filtrar/imoveis", { ...filtro, page, limit });
    const data = response?.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") return [data];
    return [];
  } catch (error) {
    console.error("Erro ao filtrar imóveis:", error);
    return [];
  }
};

export const createImovel = async (imovel) => {
  try {
    const saved = JSON.parse(localStorage.getItem("user"));
    const user = saved?.user;
    if (user?.id) {
      imovel.id_pessoa = user.id;
    }

    if (imovel.imagens && imovel.imagens.length > 0) {
      imovel.imagens = Array.from(imovel.imagens);
    }

    const formData = toFormData(imovel);
    const response = await api.post("/criar/imovel", formData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar imóvel:", error);
    throw error;
  }
};

export const deleteImovel = async (id) => {
  try {
    const response = await api.post("/deletar/imovel", {
      id_imovel: Number(id),
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar imóvel:", error);
    throw error;
  }
};

export const updateImovel = async (imovel) => {
  try {
    if (!imovel.id && !imovel.id_imovel) {
      throw new Error("ID do imóvel não informado para atualização");
    }

    imovel.id = imovel.id || imovel.id_imovel;

    if (imovel.imagens && imovel.imagens.length > 0) {
      imovel.imagens = Array.from(imovel.imagens);
    }

    const formData = toFormData(imovel);
    const response = await api.post("/atualizar/imovel", formData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar imóvel:", error);
    throw error;
  }
};
