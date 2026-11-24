import { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";

/**
 * Janela curta, só para confirmar algo ou pedir três campos. Formulário longo
 * vai para a Gaveta — modal centrado com vinte campos vira parede.
 *
 * closeOnBackdrop: por padrão o clique fora NÃO fecha, para não perder o que
 * foi digitado. Esc sempre fecha.
 */
export default function Modal({
  title,
  description,
  data,
  onClose,
  closeOnBackdrop = false,
  largura = "max-w-[460px]",
}) {
  const fecharRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    fecharRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/70 p-5"
      onMouseDown={(e) => closeOnBackdrop && e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[90vh] w-full ${largura} flex-col border-t-2 border-gold bg-canvas p-7 max-[700px]:p-5`}
        style={{ animation: "abre-modal .4s var(--ease-saida) both" }}
      >
        <style>{`@keyframes abre-modal{from{transform:translateY(12px);opacity:0}}`}</style>

        <button
          ref={fecharRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-5 top-5 grid h-9 w-9 cursor-pointer place-items-center text-muted transition-colors duration-300 hover:text-ink"
        >
          <FaTimes size={15} />
        </button>

        <h2 className="display-med m-0 pr-10 text-[23px] text-ink">{title}</h2>
        {description && (
          <p className="m-0 mt-2.5 text-[15px] leading-relaxed text-muted">
            {description}
          </p>
        )}

        <div className="mt-6 overflow-y-auto text-left">{data}</div>
      </div>
    </div>
  );
}
