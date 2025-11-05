import api from "./api";

// 🏠 Buscar todos os imóveis
export const getImoveis = async () => {
  try {
    const response = await api.post("/filtrar/imoveis", {});

    // 🔒 Garante que o retorno seja sempre um array
    const data = response?.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") return [data];
    return [];
  } catch (error) {
    console.error("Erro ao pegar imóveis:", error);
    return [];
  }
};

// 🔍 Filtrar imóveis conforme critérios
export const filterImoveis = async (filtro) => {
  try {
    const response = await api.post("/filtrar/imoveis", filtro);
    const data = response?.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") return [data];
    return [];
  } catch (error) {
    console.error("Erro ao filtrar imóveis:", error);
    return [];
  }
};

// 🏗️ Criar novo imóvel
export const createImovel = async (imovel) => {
  try {
    const response = await api.post("/criar/imovel", imovel);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar imóvel:", error);
    throw error;
  }
};

// ❌ Deletar imóvel
export const deleteImovel = async (id) => {
  try {
    const response = await api.post("/deletar/imovel", { id_imovel: id });
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar imóvel:", error);
    throw error;
  }
};

// ✏️ Atualizar imóvel
export const updateImovel = async (imovel) => {
  try {
    const response = await api.post("/atualizar/imovel", imovel);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar imóvel:", error);
    throw error;
  }
};
