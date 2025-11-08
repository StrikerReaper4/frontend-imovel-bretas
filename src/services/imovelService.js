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
    // ✅ Garante que o ID exista
    if (!imovel.id && !imovel.id_imovel) {
      throw new Error("ID do imóvel não informado para atualização");
    }

    // ✅ O backend espera o campo 'id', não 'id_imovel'
    imovel.id = imovel.id || imovel.id_imovel;

    // ✅ Converte número para string (Go lê tudo como texto no FormData)
    if (imovel.numero !== undefined && imovel.numero !== null) {
      imovel.numero = String(imovel.numero);
    }

    // ✅ Cria o FormData com todos os campos
    const formData = toFormData(imovel);

    // Se não houver imagem, não há problema — o Go lida com isso
    // (ele mostra "⚠️ Nenhuma imagem enviada, seguindo sem arquivo.")

    const response = await api.post("/atualizar/imovel", formData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar imóvel:", error);
    throw error;
  }
};
