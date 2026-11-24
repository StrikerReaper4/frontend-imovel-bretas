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

// ── Contato sobre um imóvel ──────────────────────────────────────────────────
// Uma mensagem só para WhatsApp e e-mail, com código, link e (quando o imóvel
// veio do parceiro) a referência dele — para a corretora achar o anúncio na hora.
export const TELEFONE_WHATSAPP = "5567992609967";
export const EMAIL_CONTATO = "imoveisbretas@gmail.com";

export function linkImovel(property) {
  return `${window.location.origin}/property/${property?.ind}`;
}

export function mensagemImovel(property) {
  const onde = [property?.rua, property?.bairro, property?.cidade, property?.pais]
    .filter(Boolean)
    .join(", ");
  const refParceiro = String(property?.descricao || "").match(/Ref\. parceiro: (\S+)/)?.[1];
  const linhas = [
    "Olá! Tenho interesse neste imóvel:",
    "",
    `Código: ${property?.ind}${refParceiro ? ` (ref. ${refParceiro})` : ""}`,
    `${property?.tipo || "Imóvel"}${onde ? ` em ${onde}` : ""}`,
    `Valor: ${formatPrice(property?.valor, property?.pais)}`,
    `Link: ${linkImovel(property)}`,
  ];
  return linhas.join("\n");
}

export function abrirWhatsappImovel(property) {
  window.open(
    `https://wa.me/${TELEFONE_WHATSAPP}?text=${encodeURIComponent(mensagemImovel(property))}`,
    "_blank",
    "noopener,noreferrer"
  );
}

// Abre o Gmail já com assunto e corpo preenchidos (mesmo padrão do topo do site).
export function abrirEmailImovel(property) {
  const assunto = `Interesse no imóvel código ${property?.ind}`;
  window.open(
    `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL_CONTATO}` +
      `&su=${encodeURIComponent(assunto)}&body=${encodeURIComponent(mensagemImovel(property))}`,
    "_blank",
    "noopener,noreferrer"
  );
}
