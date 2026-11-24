// Prepara as fotos do imóvel antes do upload.
//
// Foto de celular chega com 3–8 MB e 4000px+; o site nunca mostra nada maior
// que ~1900px. Reduzir aqui deixa o banco, o backup e o carregamento leves,
// sem perda visível de qualidade.

const LADO_MAXIMO = 1920;
const QUALIDADE = 0.82;

export const TIPOS_ACEITOS = "image/jpeg,image/png,image/webp";

async function decodificar(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // cai no <img> abaixo
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Redimensiona para no máximo LADO_MAXIMO px e grava como JPEG.
// Lança erro com mensagem amigável quando o navegador não consegue ler o
// arquivo (ex.: HEIC do iPhone fora do Safari).
export async function otimizarFoto(file) {
  let fonte;
  try {
    fonte = await decodificar(file);
  } catch {
    throw new Error(
      `Não foi possível ler "${file.name}". Use fotos JPG, PNG ou WebP ` +
        "(no iPhone: Ajustes › Câmera › Formatos › Mais Compatível)."
    );
  }

  const largura = fonte.width;
  const altura = fonte.height;
  const escala = Math.min(1, LADO_MAXIMO / Math.max(largura, altura));

  // Já pequena e em JPEG: envia como está, sem recomprimir.
  if (escala === 1 && file.type === "image/jpeg" && file.size < 600 * 1024) {
    fonte.close?.();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(largura * escala);
  canvas.height = Math.round(altura * escala);
  const ctx = canvas.getContext("2d");
  // Fundo branco: PNG transparente não vira preto no JPEG.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(fonte, 0, 0, canvas.width, canvas.height);
  fonte.close?.();

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALIDADE)
  );
  if (!blob) return file;

  const nome = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], nome, { type: "image/jpeg" });
}

export async function otimizarFotos(files) {
  const resultado = [];
  for (const f of files) resultado.push(await otimizarFoto(f));
  return resultado;
}
