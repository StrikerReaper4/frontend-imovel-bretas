import api from "./api";

const toFormData = (obj) => {
  const formData = new FormData();
  for (const key in obj) {
    const value = obj[key];

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item instanceof File || item instanceof Blob) {
          formData.append(key, item); // múltiplas imagens
        } else {
          formData.append(`${key}[]`, item);
        }
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

export const getImoveis = async () => {
  try {
    const response = await api.post("/filtrar/imoveis", new FormData());
    const data = response?.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") return [data];
    return [];
  } catch (error) {
    console.error("Erro ao pegar imóveis:", error);
    return [];
  }
};

export const filterImoveis = async (filtro) => {
  try {
    const formData = toFormData(filtro);
    const response = await api.post("/filtrar/imoveis", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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
    const formData = toFormData(imovel);
    const response = await api.post("/criar/imovel", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao criar imóvel:", error);
    throw error;
  }
};

export const deleteImovel = async (id) => {
  try {
    const formData = new FormData();
    formData.append("id_imovel", id);

    const response = await api.post("/deletar/imovel", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar imóvel:", error);
    throw error;
  }
};

export const updateImovel = async (imovel) => {
  try {
    const formData = toFormData(imovel);
    const response = await api.post("/atualizar/imovel", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar imóvel:", error);
    throw error;
  }
};
