import { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";

/**
 * Painel lateral do site — o mesmo gesto da gaveta de filtros, reaproveitado
 * para formulários longos. Um formulário de 20 campos não cabe num modal
 * centrado sem virar parede de caixinhas; aqui ele respira em coluna única.
 *
 * `passos` e `passoAtual` são opcionais: quando vêm, o cabeçalho mostra o
 * caminho e o rodapé fica por conta de quem usa (via `rodape`).
 */
export default function Gaveta({
  titulo,
  subtitulo,
  children,
  rodape,
  onClose,
  passos,
  passoAtual = 0,
  onPasso,
  largura = "w-[620px]",
}) {
  const fecharRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    fecharRef.current?.focus();
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = antes;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-navy-deep/60"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`relative flex h-full ${largura} max-w-full flex-col border-l border-gold/40 bg-canvas`}
        style={{ animation: "entra-gaveta .5s var(--ease-saida) both" }}
      >
        <style>{`@keyframes entra-gaveta{from{transform:translateX(36px);opacity:0}}`}</style>

        {/* Cabeçalho */}
        <header className="border-b border-line-strong px-8 pb-5 pt-7 max-[700px]:px-5">
          <div className="flex items-start justify-between gap-5">
            <div>
              <h2 className="display-med m-0 text-[26px] text-ink max-[700px]:text-[21px]">
                {titulo}
              </h2>
              {subtitulo && (
                <p className="m-0 mt-1.5 text-[14.5px] text-muted">
                  {subtitulo}
                </p>
              )}
            </div>
            <button
              ref={fecharRef}
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-[2px] border border-line-strong text-muted transition-colors duration-300 hover:border-navy hover:bg-navy hover:text-white"
            >
              <FaTimes size={15} />
            </button>
          </div>

          {passos && (
            <nav aria-label="Etapas" className="mt-6 flex gap-6">
              {passos.map((p, i) => {
                const feito = i < passoAtual;
                const atual = i === passoAtual;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onPasso?.(i)}
                    aria-current={atual ? "step" : undefined}
                    className={`group flex-1 cursor-pointer border-t-2 pt-2.5 text-left text-[14px] transition-colors duration-300
                      ${
                        atual
                          ? "border-gold text-ink"
                          : feito
                          ? "border-gold/50 text-muted hover:text-ink"
                          : "border-line-strong text-muted hover:text-ink"
                      }`}
                  >
                    <span className="block text-[12px] tabular-nums text-muted">
                      {i + 1} de {passos.length}
                    </span>
                    <span className="block font-semibold">{p}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </header>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto px-8 py-7 max-[700px]:px-5">
          {children}
        </div>

        {/* Rodapé */}
        {rodape && (
          <footer className="border-t border-line-strong bg-surface px-8 py-5 max-[700px]:px-5">
            {rodape}
          </footer>
        )}
      </aside>
    </div>
  );
}
