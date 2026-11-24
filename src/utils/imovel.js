// Helpers de apresentação de imóvel, usados pelo card e pela página de detalhe.

export function formatPrice(valor, pais) {
  const num = Number(valor) || 0;
  if (pais === "Brasil")
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  if (pais === "Estados Unidos")
    return num
      .toLocaleString("en-US", { style: "currency", currency: "USD" })
      .replace("$", "U$ ");
  if (pais === "Portugal")
    return num.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
  return num.toLocaleString();
}

export const BANDEIRA = {
  Brasil: "/Bandeira_Brasil.png",
  "Estados Unidos": "/Bandeira_EUA.png",
  Portugal: "/Bandeira_Portugal.png",
};

// A API devolve imagem como base64 (ou já como data URL) em `imagem`/`imagens`.
export function resolveImage(property) {
  const pick = (v) => {
    if (typeof v !== "string" || v.length === 0) return null;
    return v.startsWith("data:image") ? v : `data:image/jpeg;base64,${v}`;
  };

  if (Array.isArray(property?.imagem) && property.imagem.length > 0)
    return pick(property.imagem[0]) || "/placeholder_house.jpg";
  if (typeof property?.imagem === "string")
    return pick(property.imagem) || "/placeholder_house.jpg";
  if (Array.isArray(property?.imagens) && property.imagens.length > 0)
    return pick(property.imagens[0]) || "/placeholder_house.jpg";

  return "/placeholder_house.jpg";
}
