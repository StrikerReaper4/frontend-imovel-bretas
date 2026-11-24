import { createElement } from "react";
import { useRevelar } from "../utils/motion";

/**
 * Embrulho de revelação. `tipo` escolhe a distância do movimento e `ordem`
 * define o atraso em cascata. Com movimento reduzido, entrega o conteúdo
 * pronto — o hook não chega a observar nada.
 */
export default function Revelar({
  children,
  tipo = "sobe",
  ordem = 0,
  as = "div",
  className = "",
  ...resto
}) {
  const ref = useRevelar();

  return createElement(
    as,
    {
      ref,
      "data-revelar": tipo,
      style: { "--i": ordem },
      className,
      ...resto,
    },
    children
  );
}

/** Título cujas linhas sobem, cada uma dentro da própria máscara. */
export function TituloLinhas({ linhas, className = "", ordem = 0 }) {
  const ref = useRevelar();

  return (
    <span
      ref={ref}
      className={`linhas block ${className}`}
      style={{ "--i": ordem }}
    >
      {linhas.map((linha, i) => (
        <span key={linha} style={{ "--i": ordem + i }}>
          <span>{linha}</span>
        </span>
      ))}
    </span>
  );
}
