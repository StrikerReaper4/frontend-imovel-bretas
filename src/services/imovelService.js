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
    const response = await api.post("/filtrar/imoveis", {}); // ✅ JSON vazio
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
    const response = await api.post("/filtrar/imoveis", filtro); // ✅ JSON normal
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
    // ⚠️ Removido o header manual — Axios define automaticamente o boundary correto
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
    if (imovel.numero !== undefined && imovel.numero !== null) {
      imovel.numero = String(imovel.numero);
    }

    // ✅ Sempre cria um FormData, mesmo que não haja imagens
    const formData = toFormData(imovel);

    // Se não houver imagens, adiciona um placeholder vazio para evitar erro do backend
    if (!imovel.imagens || imovel.imagens.length === 0) {
      formData.append("imagens", ""); // ou null, conforme backend aceita
    }

    const response = await api.post("/atualizar/imovel", formData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar imóvel:", error);
    throw error;
  }
};
