// Formatação de entrada e de leitura. Tudo aqui trabalha com o valor cru
// (número ou dígitos) e devolve texto para a tela — nada guarda máscara.

export const MOEDA = {
  Brasil: { simbolo: "R$", local: "pt-BR" },
  "Estados Unidos": { simbolo: "U$", local: "en-US" },
  Portugal: { simbolo: "€", local: "pt-PT" },
};

export const apenasDigitos = (v) => String(v ?? "").replace(/\D/g, "");

/** 79002363 → 79002-363 (só no Brasil o CEP tem esse formato). */
export function formatarCep(valor) {
  const d = apenasDigitos(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** 1250000 → "1.250.000" no padrão do país escolhido. */
export function formatarMilhar(valor, pais) {
  const n = Number(apenasDigitos(valor));
  if (!n) return "";
  return n.toLocaleString(MOEDA[pais]?.local || "pt-BR");
}

/** Símbolo da moeda do país, para prefixar o campo de valor. */
export const simboloMoeda = (pais) => MOEDA[pais]?.simbolo || "";

/**
 * Por extenso curto, para conferir o valor digitado sem contar zeros:
 * 1250000 → "1,25 milhão", 850000 → "850 mil".
 */
export function valorPorExtenso(valor) {
  const n = Number(valor) || 0;
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    const texto = m.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
    return `${texto} ${m === 1 ? "milhão" : "milhões"}`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mil`;
  }
  return n > 0 ? String(n) : "";
}
