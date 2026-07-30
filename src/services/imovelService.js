import api from "./api";
import { local } from "../utils/storage";

// Normaliza a resposta do /filtrar/imoveis, que pode vir em dois formatos:
// array puro (padrão antigo) ou { items, total } (quando with_total é pedido).
const normalizeList = (data) => {
  if (Array.isArray(data)) {
    return { items: data, total: null };
  }
  if (data && Array.isArray(data.items)) {
    return { items: data.items, total: Number(data.total) || 0 };
  }
  if (data && typeof data === "object") {
    return { items: [data], total: null };
  }
  return { items: [], total: null };
};

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

// Listagem da Home: pede só a PRIMEIRA imagem de cada imóvel (thumb) e o total
// de resultados. Devolve { items, total } — total é null se a API for antiga.
export const listImoveis = async (filtro = null, page = 1, limit = 12) => {
  try {
    const response = await api.post("/filtrar/imoveis", {
      ...(filtro || {}),
      page,
      limit,
      thumb: true,
      with_total: true,
    });
    return normalizeList(response?.data);
  } catch (error) {
    console.error("Erro ao listar imóveis:", error);
    throw error;
  }
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
    const saved = local.getJSON("user");
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
