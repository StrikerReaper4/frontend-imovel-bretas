import { useEffect, useRef, useState } from "react";

// Uma única fonte de verdade sobre movimento. Se o sistema operacional pede
// menos animação, todo hook abaixo vira no-op — nada de efeito "só um pouco".
export const semMovimento = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Revela um bloco quando ele entra em cena.
 * Devolve uma ref: o elemento começa com data-revelar e ganha data-visivel.
 * O CSS cuida do resto (translate + clip + opacidade, escalonado por --i).
 */
export function useRevelar({ margem = "0px 0px -12% 0px", umaVez = true } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (semMovimento() || !("IntersectionObserver" in window)) {
      el.setAttribute("data-visivel", "");
      return;
    }

    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute("data-visivel", "");
            if (umaVez) obs.unobserve(e.target);
          } else if (!umaVez) {
            e.target.removeAttribute("data-visivel");
          }
        });
      },
      { rootMargin: margem, threshold: 0.12 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [margem, umaVez]);

  return ref;
}

/**
 * Parallax vertical leve. Escreve --parallax no elemento, em pixels.
 * Usa rAF e só roda enquanto o elemento está na tela.
 */
export function useParallax(intensidade = 0.12) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || semMovimento()) return;

    let rodando = false;
    let visivel = false;

    const aplicar = () => {
      rodando = false;
      const r = el.getBoundingClientRect();
      const centro = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.setProperty("--parallax", `${(-centro * intensidade).toFixed(1)}px`);
    };

    const aoRolar = () => {
      if (!visivel || rodando) return;
      rodando = true;
      requestAnimationFrame(aplicar);
    };

    const obs = new IntersectionObserver(
      ([e]) => {
        visivel = e.isIntersecting;
        if (visivel) aplicar();
      },
      { rootMargin: "100px" }
    );

    obs.observe(el);
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);

    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, [intensidade]);

  return ref;
}

/** Verdadeiro depois que a página rolou além de `limite` pixels. */
export function useRolou(limite = 80) {
  const [rolou, setRolou] = useState(false);

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > limite);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, [limite]);

  return rolou;
}

/**
 * Luz que segue o cursor dentro de um bloco: escreve --mx e --my em %.
 * Só no ponteiro fino (mouse), e nunca com movimento reduzido.
 */
export function useLuzDoCursor() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || semMovimento()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const mover = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    };

    el.addEventListener("pointermove", mover);
    return () => el.removeEventListener("pointermove", mover);
  }, []);

  return ref;
}

/**
 * Arrastar para rolar na horizontal, com o cursor ou o dedo.
 * Devolve { ref, rolar } — `rolar(dir)` move um painel inteiro por clique.
 */
export function useArrastar() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let arrastando = false;
    let xInicial = 0;
    let scrollInicial = 0;

    const baixo = (e) => {
      // Só com o botão principal do mouse; toque já rola sozinho.
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (e.pointerType === "touch") return;
      arrastando = true;
      xInicial = e.clientX;
      scrollInicial = el.scrollLeft;
      el.setPointerCapture?.(e.pointerId);
      el.style.cursor = "grabbing";
      el.style.scrollSnapType = "none";
    };

    const mover = (e) => {
      if (!arrastando) return;
      e.preventDefault();
      el.scrollLeft = scrollInicial - (e.clientX - xInicial);
    };

    const cima = (e) => {
      if (!arrastando) return;
      arrastando = false;
      // Arrastou de verdade? Engole o clique que viria em seguida, para não
      // abrir o painel sem querer ao soltar o botão.
      if (Math.abs(e.clientX - xInicial) > 6) {
        el.addEventListener("click", (c) => c.stopPropagation(), {
          capture: true,
          once: true,
        });
      }
      el.releasePointerCapture?.(e.pointerId);
      el.style.cursor = "";
      setTimeout(() => {
        el.style.scrollSnapType = "";
      }, 120);
    };

    // Roda do mouse vertical vira rolagem horizontal dentro do trilho.
    const roda = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const antes = el.scrollLeft;
      el.scrollLeft += e.deltaY;
      if (el.scrollLeft !== antes) e.preventDefault();
    };

    el.addEventListener("pointerdown", baixo);
    el.addEventListener("pointermove", mover);
    el.addEventListener("pointerup", cima);
    el.addEventListener("pointercancel", cima);
    el.addEventListener("wheel", roda, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", baixo);
      el.removeEventListener("pointermove", mover);
      el.removeEventListener("pointerup", cima);
      el.removeEventListener("pointercancel", cima);
      el.removeEventListener("wheel", roda);
    };
  }, []);

  const rolar = (dir) => {
    const el = ref.current;
    if (!el) return;
    const painel = el.firstElementChild?.getBoundingClientRect().width || 420;
    el.scrollBy({
      left: dir * (painel + 20),
      behavior: semMovimento() ? "auto" : "smooth",
    });
  };

  return { ref, rolar };
}
